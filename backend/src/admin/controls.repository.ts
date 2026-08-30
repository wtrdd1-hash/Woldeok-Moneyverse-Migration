import { Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

/**
 * The control plane: which features are on, which economy policy is in force,
 * and who holds which administrative role.
 *
 * Every method calls a SECURITY DEFINER function from migrations 058 and 060.
 * None of these tables is readable or writable by `moneyverse_app`, and the
 * functions re-decide the caller's authority for themselves — the guards on
 * the controller decide who may knock, not who may act.
 */

export class ControlsInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ControlsInputError';
  }
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const FEATURE_KEY_PATTERN = /^[a-z][a-z0-9_]{2,63}$/;
const VERSION_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_.:-]{2,63}$/;
const KNOB_KEY_PATTERN = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;
const SWITCH_STATES = new Set(['enabled', 'paused', 'safe_mode', 'disabled']);
const GRANTABLE_ROLES = new Set(['operator', 'approver', 'server_operator', 'superadmin']);
const REVOCABLE_ROLES = new Set(['operator', 'approver', 'server_operator']);

/**
 * The floor `admin_normalized_reason` (058) enforces, repeated here so an
 * operator is told which field is wrong instead of receiving a database
 * message about a function they have never heard of. The database is still
 * the authority: it refuses the same value even if this check is bypassed.
 */
const REASON_MIN = 10;
const REASON_MAX = 1000;

function assertUuid(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
    throw new ControlsInputError(`${field} must be a UUID`);
  }
}

function assertReason(value: unknown): string {
  if (typeof value !== 'string') throw new ControlsInputError('a reason is required');
  const reason = value.trim();
  if (reason.length < REASON_MIN || reason.length > REASON_MAX) {
    throw new ControlsInputError(`the reason must be ${REASON_MIN} to ${REASON_MAX} characters`);
  }
  return reason;
}

// packages/database/migrations/059-feature-switches-and-economy-policies.sql
export interface FeatureSwitchRow {
  readonly feature_key: string;
  readonly state: string;
  readonly title: string;
  readonly activation_preconditions: unknown;
  readonly reason: string;
  readonly updated_by: string | null;
  readonly updated_at: Date;
}

// packages/database/migrations/059-feature-switches-and-economy-policies.sql
export interface EconomyPolicyRow {
  readonly policy_id: string;
  readonly version: string;
  readonly status: string;
  readonly effective_at: Date;
  readonly activated_at: Date | null;
  readonly superseded_at: Date | null;
  readonly superseded_by: string | null;
  readonly reason: string;
  readonly created_by: string | null;
  readonly created_at: Date;
  readonly payload: unknown;
}

// packages/database/migrations/089-economy-policy-knobs.sql
export interface PolicyKnobRow {
  readonly knob_key: string;
  readonly title: string;
  readonly unit: string;
  // numeric columns arrive as text so no bound is rounded on the way through.
  readonly current_value: string;
  readonly baseline_value: string;
  readonly min_value: string;
  readonly max_value: string;
  readonly auto_adjustable: boolean;
  readonly paused_reason: string;
  readonly updated_at: Date;
}

export interface PolicyKnobSettingRow {
  readonly knob_key: string;
  readonly auto_adjustable: boolean;
  readonly min_value: string;
  readonly max_value: string;
}

// packages/database/migrations/057-superadmin-authority-and-admin-sessions.sql
export interface AdminRoleAssignmentRow {
  readonly user_id: string;
  readonly display_name: string;
  readonly role: string;
  readonly granted_at: Date;
}

@Injectable()
export class ControlsRepository {
  readonly pool: Queryable;

  constructor(pool: Queryable) {
    this.pool = pool;
  }

  featureSwitches(actorUserId: unknown): Promise<FeatureSwitchRow[]> {
    assertUuid(actorUserId, 'actor user id');
    return queryRows<FeatureSwitchRow>(
      this.pool,
      `SELECT feature_key, state, title, activation_preconditions, reason, updated_by, updated_at
       FROM public.admin_list_feature_switches($1)`,
      [actorUserId],
    );
  }

  async setFeatureSwitch(input: {
    readonly idempotencyKey: unknown;
    readonly actorUserId: unknown;
    readonly featureKey: unknown;
    readonly state: unknown;
    readonly reason: unknown;
  }): Promise<{
    readonly featureKey: string;
    readonly previousState: string;
    readonly nextState: string;
  }> {
    assertUuid(input.idempotencyKey, 'idempotency key');
    assertUuid(input.actorUserId, 'actor user id');
    if (typeof input.featureKey !== 'string' || !FEATURE_KEY_PATTERN.test(input.featureKey)) {
      throw new ControlsInputError('feature must be a known feature key');
    }
    if (typeof input.state !== 'string' || !SWITCH_STATES.has(input.state)) {
      throw new ControlsInputError('state must be enabled, paused, safe_mode or disabled');
    }
    const reason = assertReason(input.reason);
    const row = await queryOne<{
      readonly feature_key: string;
      readonly previous_state: string;
      readonly next_state: string;
    }>(
      this.pool,
      `SELECT feature_key, previous_state, next_state
       FROM public.admin_set_feature_switch($1, $2, $3, $4, $5)`,
      [input.idempotencyKey, input.actorUserId, input.featureKey, input.state, reason],
    );
    if (!row) throw new Error('admin_set_feature_switch did not return a row');
    return {
      featureKey: row.feature_key,
      previousState: row.previous_state,
      nextState: row.next_state,
    };
  }

  policies(actorUserId: unknown, limit = 30): Promise<EconomyPolicyRow[]> {
    assertUuid(actorUserId, 'actor user id');
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
      throw new ControlsInputError('limit must be an integer between 1 and 100');
    }
    return queryRows<EconomyPolicyRow>(
      this.pool,
      `SELECT policy_id, version, status, effective_at, activated_at, superseded_at,
              superseded_by, reason, created_by, created_at, payload
       FROM public.admin_list_economy_policies($1, $2)`,
      [actorUserId, limit],
    );
  }

  async createPolicyVersion(input: {
    readonly idempotencyKey: unknown;
    readonly actorUserId: unknown;
    readonly version: unknown;
    readonly effectiveAt: unknown;
    readonly payload: unknown;
    readonly reason: unknown;
  }): Promise<{
    readonly policyId: string;
    readonly version: string;
    readonly status: string;
    readonly effectiveAt: Date;
  }> {
    assertUuid(input.idempotencyKey, 'idempotency key');
    assertUuid(input.actorUserId, 'actor user id');
    if (typeof input.version !== 'string' || !VERSION_PATTERN.test(input.version)) {
      throw new ControlsInputError('the version name must be 3 to 64 characters');
    }
    if (
      input.payload === null ||
      typeof input.payload !== 'object' ||
      Array.isArray(input.payload)
    ) {
      throw new ControlsInputError('the payload must be a JSON object');
    }
    if (Buffer.byteLength(JSON.stringify(input.payload), 'utf8') > 16_384) {
      throw new ControlsInputError('the payload must be at most 16 KiB');
    }
    // Null means "now", which the function turns into an immediate
    // activation. Anything else must be a timestamp the database can read.
    let effectiveAt: string | null = null;
    if (input.effectiveAt !== null && input.effectiveAt !== undefined) {
      if (typeof input.effectiveAt !== 'string' || Number.isNaN(Date.parse(input.effectiveAt))) {
        throw new ControlsInputError('the effective time must be an ISO 8601 instant');
      }
      effectiveAt = new Date(input.effectiveAt).toISOString();
    }
    const reason = assertReason(input.reason);
    const row = await queryOne<{
      readonly policy_id: string;
      readonly version: string;
      readonly status: string;
      readonly effective_at: Date;
    }>(
      this.pool,
      `SELECT policy_id, version, status, effective_at
       FROM public.admin_create_economy_policy_version($1, $2, $3, $4::timestamptz, $5::jsonb, $6)`,
      [
        input.idempotencyKey,
        input.actorUserId,
        input.version,
        effectiveAt,
        input.payload,
        reason,
      ],
    );
    if (!row) throw new Error('admin_create_economy_policy_version did not return a row');
    return {
      policyId: row.policy_id,
      version: row.version,
      status: row.status,
      effectiveAt: row.effective_at,
    };
  }

  async rollbackPolicy(input: {
    readonly idempotencyKey: unknown;
    readonly actorUserId: unknown;
    readonly reason: unknown;
  }): Promise<{ readonly rolledBackVersion: string; readonly restoredVersion: string }> {
    assertUuid(input.idempotencyKey, 'idempotency key');
    assertUuid(input.actorUserId, 'actor user id');
    const reason = assertReason(input.reason);
    const row = await queryOne<{
      readonly rolled_back_version: string;
      readonly restored_version: string;
    }>(
      this.pool,
      `SELECT rolled_back_version, restored_version
       FROM public.admin_rollback_economy_policy($1, $2, $3)`,
      [input.idempotencyKey, input.actorUserId, reason],
    );
    if (!row) throw new Error('admin_rollback_economy_policy did not return a row');
    return {
      rolledBackVersion: row.rolled_back_version,
      restoredVersion: row.restored_version,
    };
  }

  async activateDuePolicies(): Promise<{ readonly activated: number }> {
    const row = await queryOne<{ readonly activated: number }>(
      this.pool,
      'SELECT public.economy_activate_due_policies() AS activated',
    );
    return { activated: row?.activated ?? 0 };
  }

  /**
   * The knob registry and what the engine would do with today's numbers.
   * Reading a proposal changes nothing, so 092 lets any administrator ask;
   * running it is the superadmin's.
   */
  policyKnobs(actorUserId: unknown): Promise<PolicyKnobRow[]> {
    assertUuid(actorUserId, 'actor user id');
    return queryRows<PolicyKnobRow>(
      this.pool,
      `SELECT knob_key, title, unit, current_value::text AS current_value,
              baseline_value::text AS baseline_value, min_value::text AS min_value,
              max_value::text AS max_value, auto_adjustable, paused_reason, updated_at
       FROM public.admin_list_policy_knobs($1)`,
      [actorUserId],
    );
  }

  async autoPolicyPreview(actorUserId: unknown): Promise<Record<string, unknown>> {
    assertUuid(actorUserId, 'actor user id');
    const row = await queryOne<{ readonly preview: Record<string, unknown> }>(
      this.pool,
      'SELECT public.admin_preview_auto_policy($1, 7) AS preview',
      [actorUserId],
    );
    return row?.preview ?? {};
  }

  async runAutoPolicy(input: {
    readonly idempotencyKey: unknown;
    readonly actorUserId: unknown;
    readonly reason: unknown;
  }): Promise<Record<string, unknown>> {
    assertUuid(input.idempotencyKey, 'idempotency key');
    assertUuid(input.actorUserId, 'actor user id');
    const reason = assertReason(input.reason);
    const row = await queryOne<{ readonly result: Record<string, unknown> }>(
      this.pool,
      'SELECT public.admin_run_auto_policy_now($1, $2, $3) AS result',
      [input.idempotencyKey, input.actorUserId, reason],
    );
    return row?.result ?? {};
  }

  async setPolicyKnob(input: {
    readonly idempotencyKey: unknown;
    readonly actorUserId: unknown;
    readonly knobKey: unknown;
    readonly autoAdjustable: unknown;
    readonly minValue: unknown;
    readonly maxValue: unknown;
    readonly reason: unknown;
  }): Promise<PolicyKnobSettingRow> {
    assertUuid(input.idempotencyKey, 'idempotency key');
    assertUuid(input.actorUserId, 'actor user id');
    const reason = assertReason(input.reason);
    if (typeof input.knobKey !== 'string' || !KNOB_KEY_PATTERN.test(input.knobKey)) {
      throw new ControlsInputError('knob key must name a policy knob');
    }
    if (input.autoAdjustable !== undefined && typeof input.autoAdjustable !== 'boolean') {
      throw new ControlsInputError('autoAdjustable must be true or false');
    }
    // The bounds are sent as text so a number that JavaScript cannot hold
    // exactly never reaches a numeric column having already been rounded.
    const bound = (value: unknown, field: string): string | null => {
      if (value === undefined || value === null) return null;
      if (typeof value === 'number' && Number.isFinite(value)) return String(value);
      if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value)) return value;
      throw new ControlsInputError(`${field} must be a number`);
    };
    const row = await queryOne<PolicyKnobSettingRow>(
      this.pool,
      `SELECT knob_key, auto_adjustable, min_value::text AS min_value,
              max_value::text AS max_value
       FROM public.admin_set_policy_knob($1, $2, $3, $4, $5::numeric, $6::numeric, $7)`,
      [
        input.idempotencyKey,
        input.actorUserId,
        input.knobKey,
        input.autoAdjustable ?? null,
        bound(input.minValue, 'minValue'),
        bound(input.maxValue, 'maxValue'),
        reason,
      ],
    );
    if (!row) throw new Error('admin_set_policy_knob did not return a row');
    return row;
  }

  roles(actorUserId: unknown): Promise<AdminRoleAssignmentRow[]> {
    assertUuid(actorUserId, 'actor user id');
    return queryRows<AdminRoleAssignmentRow>(
      this.pool,
      'SELECT user_id, display_name, role, granted_at FROM public.admin_list_roles($1)',
      [actorUserId],
    );
  }

  async grantRole(input: {
    readonly idempotencyKey: unknown;
    readonly actorUserId: unknown;
    readonly targetUserId: unknown;
    readonly role: unknown;
    readonly reason: unknown;
  }): Promise<{
    readonly designationId: string;
    readonly grantedRole: string;
    readonly displacedUserId: string | null;
  }> {
    assertUuid(input.idempotencyKey, 'idempotency key');
    assertUuid(input.actorUserId, 'actor user id');
    assertUuid(input.targetUserId, 'target user id');
    if (typeof input.role !== 'string' || !GRANTABLE_ROLES.has(input.role)) {
      throw new ControlsInputError('role must be operator, approver, server_operator or superadmin');
    }
    const reason = assertReason(input.reason);
    const row = await queryOne<{
      readonly designation_id: string;
      readonly granted_role: string;
      readonly displaced_user_id: string | null;
    }>(
      this.pool,
      `SELECT designation_id, granted_role, displaced_user_id
       FROM public.admin_grant_role($1, $2, $3, $4, $5)`,
      [input.idempotencyKey, input.actorUserId, input.targetUserId, input.role, reason],
    );
    if (!row) throw new Error('admin_grant_role did not return a row');
    return {
      designationId: row.designation_id,
      grantedRole: row.granted_role,
      displacedUserId: row.displaced_user_id,
    };
  }

  async revokeRole(input: {
    readonly idempotencyKey: unknown;
    readonly actorUserId: unknown;
    readonly targetUserId: unknown;
    readonly role: unknown;
    readonly reason: unknown;
  }): Promise<{ readonly designationId: string; readonly revokedRole: string }> {
    assertUuid(input.idempotencyKey, 'idempotency key');
    assertUuid(input.actorUserId, 'actor user id');
    assertUuid(input.targetUserId, 'target user id');
    if (typeof input.role !== 'string' || !REVOCABLE_ROLES.has(input.role)) {
      // The superadmin designation moves by being granted to somebody else;
      // 058 refuses to remove it, and saying so here is clearer than letting
      // the database phrase it.
      throw new ControlsInputError(
        'only operator, approver and server_operator can be revoked',
      );
    }
    const reason = assertReason(input.reason);
    const row = await queryOne<{
      readonly designation_id: string;
      readonly revoked_role: string;
    }>(
      this.pool,
      `SELECT designation_id, revoked_role FROM public.admin_revoke_role($1, $2, $3, $4, $5)`,
      [input.idempotencyKey, input.actorUserId, input.targetUserId, input.role, reason],
    );
    if (!row) throw new Error('admin_revoke_role did not return a row');
    return { designationId: row.designation_id, revokedRole: row.revoked_role };
  }
}
