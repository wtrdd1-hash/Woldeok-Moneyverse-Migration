import type { AdminRoleAssignment, EconomyPolicyVersion, FeatureSwitch } from '../types';

export interface VerifiedControlsOverview {
  readonly featureSwitches: readonly FeatureSwitch[];
  readonly policies: readonly EconomyPolicyVersion[];
  readonly roles: readonly AdminRoleAssignment[];
}

const STATES = new Set(['enabled', 'paused', 'safe_mode', 'disabled']);
const POLICY_STATES = new Set(['draft', 'approved', 'active', 'superseded', 'rolled_back']);

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function string(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function date(value: unknown): value is string {
  return string(value) && Number.isFinite(Date.parse(value));
}

function nullableString(value: unknown): boolean {
  return value === null || typeof value === 'string';
}

function feature(value: unknown): value is FeatureSwitch {
  return record(value) && string(value.feature_key) && string(value.title) &&
    STATES.has(String(value.state)) && Array.isArray(value.activation_preconditions) &&
    value.activation_preconditions.every(string) && typeof value.reason === 'string' &&
    nullableString(value.updated_by) && date(value.updated_at);
}

function policy(value: unknown): value is EconomyPolicyVersion {
  return record(value) && string(value.policy_id) && string(value.version) &&
    POLICY_STATES.has(String(value.status)) && date(value.effective_at) &&
    (value.activated_at === null || date(value.activated_at)) &&
    (value.superseded_at === null || date(value.superseded_at)) &&
    nullableString(value.superseded_by) && typeof value.reason === 'string' &&
    nullableString(value.created_by) && date(value.created_at) && 'payload' in value;
}

function role(value: unknown): value is AdminRoleAssignment {
  return record(value) && string(value.user_id) && string(value.display_name) &&
    string(value.role) && date(value.granted_at);
}

function unique<T>(items: readonly T[], key: (item: T) => string): boolean {
  return new Set(items.map(key)).size === items.length;
}

/** Fail closed: a malformed control-plane response is not evidence of an empty or safe system. */
export function parseControlsOverview(value: unknown): VerifiedControlsOverview | null {
  if (!record(value) || !Array.isArray(value.featureSwitches) ||
      !Array.isArray(value.policies) || !Array.isArray(value.roles)) return null;
  if (!value.featureSwitches.every(feature) || !value.policies.every(policy) ||
      !value.roles.every(role)) return null;
  const featureSwitches: FeatureSwitch[] = value.featureSwitches;
  const policies: EconomyPolicyVersion[] = value.policies;
  const roles: AdminRoleAssignment[] = value.roles;
  if (!unique(featureSwitches, (item) => item.feature_key) ||
      !unique(policies, (item) => item.policy_id) ||
      !unique(roles, (item) => `${item.user_id}:${item.role}`) ||
      policies.filter((item) => item.status === 'active').length > 1) return null;
  return { featureSwitches, policies, roles };
}

export function parsePublishedPolicy(value: unknown): { termsVersion: string; privacyVersion: string } | null {
  if (!record(value) || !string(value.termsVersion) || !string(value.privacyVersion)) return null;
  return { termsVersion: value.termsVersion, privacyVersion: value.privacyVersion };
}
