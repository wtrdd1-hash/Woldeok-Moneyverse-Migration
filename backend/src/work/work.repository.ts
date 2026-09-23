import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class WorkInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkInputError';
  }
}

function assertUuid(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string' || !UUID.test(value)) {
    throw new WorkInputError(`${field} must be a UUID`);
  }
}

export type WorkFeatureState = 'enabled' | 'paused' | 'safe_mode' | 'disabled';

export interface WorkAssignmentRow {
  assignment_id: string;
  task_id: string;
  assigned_at: Date;
  expires_at: Date;
  replayed: boolean;
}

export interface WorkCompletionRow {
  assignment_id: string;
  submitted_at: Date;
  replayed: boolean;
}

export interface WorkRewardRow {
  assignment_id: string;
  reward_amount: string;
  experience_amount: string;
  transaction_id: string | null;
  replayed: boolean;
}

export interface WorkTaskRow {
  task_id: string;
  code: string;
  name: string;
  description: string;
  job_type: string;
  difficulty: number;
  base_reward: string;
  base_experience: string;
  minimum_duration_seconds: number;
  daily_limit: number;
  taken_today: number;
  reward_preview: string | null;
  experience_preview: string | null;
  recommended: boolean;
  policy_version?: string;
  expected_work_seconds?: number;
  eligible_submit_at?: string;
  settlement_mode?: 'ACTIVE' | 'ASYNC' | 'VERIFY' | 'BATCH';
  repeat_factor?: string;
  issuance_factor?: string;
  net_reward?: string;
  reason_codes?: string[];
}

export interface WorkReceiptRow {
  receipt_id: string;
  assignment_id: string;
  code: string;
  name: string;
  reward_amount: string;
  experience_amount: string;
  transaction_id: string | null;
  created_at: Date;
}

export interface WorkDashboardRow {
  daily_paid: string;
  daily_cap: string;
  weekly_paid: string;
  weekly_cap: string;
  active_assignments: string;
  game_day_key: string;
  game_week_key: string;
  day_ends_at: Date;
  week_ends_at: Date;
}

export interface WorkCompleteV2Row {
  reward_amount: string;
  experience_gained: string;
  current_level: number;
  current_experience: string;
  level_up: boolean;
  transaction_id: string;
}

export class WorkRepository {
  private cachedFeatureState: { readonly state: WorkFeatureState; readonly cachedUntil: number } | null = null;

  constructor(private readonly pool: Queryable) {}

  invalidateFeatureStateCache(): void {
    this.cachedFeatureState = null;
  }

  async featureState(): Promise<WorkFeatureState> {
    const now = Date.now();
    if (this.cachedFeatureState && this.cachedFeatureState.cachedUntil > now) {
      return this.cachedFeatureState.state;
    }
    const row = await queryOne<{ state: WorkFeatureState }>(
      this.pool,
      `SELECT public.feature_switch_state('work')::text AS state`,
    );
    const state = row?.state ?? 'disabled';
    this.cachedFeatureState = { state, cachedUntil: now + 30_000 };
    return state;
  }

  private async requireEnabled(): Promise<void> {
    const state = await this.featureState();
    if (state !== 'enabled') throw new WorkInputError(`work feature is ${state}`);
  }

  private async requireExistingFlowAllowed(): Promise<void> {
    const state = await this.featureState();
    if (state === 'disabled') throw new WorkInputError('work feature is disabled');
  }

  async assign(key: unknown, actor: unknown, task: unknown): Promise<WorkAssignmentRow | null> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');
    assertUuid(task, 'task id');
    await this.requireEnabled();
    return queryOne<WorkAssignmentRow>(
      this.pool,
      `SELECT assignment.assignment_id::text, assignment.task_id::text,
              assignment.assigned_at, assignment.expires_at, assignment.replayed
       FROM public.work_assign_task($1, $2, $3) AS assignment`,
      [key, actor, task],
    );
  }

  async submit(
    key: unknown,
    actor: unknown,
    assignment: unknown,
    evidence?: string,
  ): Promise<WorkCompletionRow | null> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');
    assertUuid(assignment, 'assignment id');
    await this.requireExistingFlowAllowed();
    return queryOne<WorkCompletionRow>(
      this.pool,
      `SELECT completion.assignment_id::text, completion.submitted_at, completion.replayed
       FROM public.work_submit_completion($1, $2, $3, $4) AS completion`,
      [key, actor, assignment, evidence ?? null],
    );
  }

  async verify(key: unknown, actor: unknown, assignment: unknown): Promise<WorkRewardRow | null> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');
    assertUuid(assignment, 'assignment id');
    await this.requireExistingFlowAllowed();
    return queryOne<WorkRewardRow>(
      this.pool,
      `SELECT reward.assignment_id::text, reward.reward_amount::text,
              reward.experience_amount::text, reward.transaction_id::text, reward.replayed
       FROM public.work_verify_and_reward($1, $2, $3) AS reward`,
      [key, actor, assignment],
    );
  }

  dashboard(actor: unknown): Promise<WorkDashboardRow | null> {
    assertUuid(actor, 'actor');
    return queryOne<WorkDashboardRow>(
      this.pool,
      `SELECT summary.daily_paid::text, summary.daily_cap::text,
              summary.weekly_paid::text, summary.weekly_cap::text,
              summary.active_assignments::text,
              summary.game_day_key::text, summary.game_week_key::text,
              summary.day_ends_at, summary.week_ends_at
       FROM public.work_my_dashboard_v2($1) AS summary`,
      [actor],
    );
  }

  async tasks(actor: unknown): Promise<WorkTaskRow[]> {
    assertUuid(actor, 'actor');
    const rows = await queryRows<WorkTaskRow>(
      this.pool,
      `SELECT task.task_id::text, task.code, task.name, task.description,
              task.job_type::text, task.difficulty, task.base_reward::text,
              task.base_experience::text, task.minimum_duration_seconds,
              task.daily_limit, task.taken_today, task.reward_preview::text,
              public.work_experience_preview($1, task.task_id)::text AS experience_preview,
              task.recommended
       FROM public.work_task_board($1) AS task`,
      [actor],
    );
    const now = Date.now();
    return rows.map((task) => {
      const expectedSeconds =
        task.minimum_duration_seconds > 0
          ? task.minimum_duration_seconds
          : Math.max(30, (task.difficulty || 1) * 30);
      const eligibleSubmitAt = new Date(now + expectedSeconds * 1000).toISOString();
      const takenToday = Number(task.taken_today) || 0;
      const repeatFactorNum = Math.max(0.2, 1.0 - takenToday * 0.15);
      const repeatFactor = repeatFactorNum.toFixed(4);
      const issuanceFactor = '1.0000';
      const effectiveBase = parseFloat(task.reward_preview || task.base_reward) || 0;
      const netReward = String(Math.round(effectiveBase * repeatFactorNum * parseFloat(issuanceFactor)));
      const reasonCodes: string[] = [];
      if (takenToday > 0) {
        reasonCodes.push('REPEAT_DECAY_APPLIED');
      } else {
        reasonCodes.push('OPTIMAL_REWARD');
      }
      if (task.recommended) {
        reasonCodes.push('CAREER_AFFINITY_BONUS');
      }
      return {
        ...task,
        policy_version: 'v2026.09.23.401',
        expected_work_seconds: expectedSeconds,
        eligible_submit_at: eligibleSubmitAt,
        settlement_mode: 'ACTIVE' as const,
        repeat_factor: repeatFactor,
        issuance_factor: issuanceFactor,
        net_reward: netReward,
        reason_codes: reasonCodes,
      };
    });
  }

  receipts(actor: unknown): Promise<WorkReceiptRow[]> {
    assertUuid(actor, 'actor');
    return queryRows<WorkReceiptRow>(
      this.pool,
      `SELECT receipt.receipt_id::text, receipt.assignment_id::text, receipt.code,
              receipt.name, receipt.reward_amount::text, receipt.experience_amount::text,
              receipt.transaction_id::text, receipt.created_at
       FROM public.work_my_receipts($1) AS receipt`,
      [actor],
    );
  }

  assignments(actor: unknown): Promise<unknown[]> {
    assertUuid(actor, 'actor');
    return queryRows(
      this.pool,
      `SELECT item.assignment_id::text, item.task_id::text, item.code, item.name,
              item.job_type::text, item.status::text, item.assigned_at, item.expires_at,
              item.reward_amount::text, item.experience_amount::text
       FROM public.work_my_assignments($1) AS item`,
      [actor],
    );
  }

  async jobProfile(actor: unknown): Promise<unknown> {
    assertUuid(actor, 'actor');
    const row = await queryOne<{ profile: unknown }>(
      this.pool,
      `SELECT public.job_get_my_profile($1) AS profile`,
      [actor],
    );
    return row?.profile ?? null;
  }

  async switchActiveJob(actor: unknown, jobType: string): Promise<unknown> {
    assertUuid(actor, 'actor');
    await this.requireEnabled();
    return queryOne(
      this.pool,
      `SELECT job_type::text, level, experience::text AS current_experience, is_active
       FROM public.job_switch_active($1, $2::text)`,
      [actor, jobType],
    );
  }

  async completeTaskV2(
    key: unknown,
    actor: unknown,
    taskId: unknown,
  ): Promise<WorkCompleteV2Row | null> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');
    assertUuid(taskId, 'task id');
    await this.requireEnabled();
    return queryOne<WorkCompleteV2Row>(
      this.pool,
      `SELECT reward_amount::text, experience_gained::text, current_level,
              current_experience::text, level_up, transaction_id::text
       FROM public.work_complete_task_v2($1, $2, $3)`,
      [actor, taskId, key],
    );
  }
}
