import type { AdminJobLevel, AdminWorkPolicy, AdminWorkTask } from '../types';

export interface VerifiedWorkConsole {
  readonly catalogue: readonly AdminWorkTask[];
  readonly jobLevels: readonly AdminJobLevel[];
  readonly policy: AdminWorkPolicy;
}

type RecordValue = Record<string, unknown>;

function record(value: unknown): value is RecordValue {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function text(value: unknown, max = 128): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}

function count(value: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max;
}

function integerText(value: unknown): value is string {
  return typeof value === 'string' && /^(0|[1-9][0-9]*)$/.test(value) && value.length <= 40;
}

function decimalText(value: unknown): value is string {
  return typeof value === 'string' && /^(0|[1-9][0-9]*)(\.[0-9]{1,6})?$/.test(value) && value.length <= 40;
}

function timestamp(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 40 &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value) &&
    !Number.isNaN(Date.parse(value));
}

function taskRow(value: unknown): value is AdminWorkTask {
  if (!record(value)) return false;
  return typeof value.task_id === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.task_id) &&
    typeof value.code === 'string' && /^[a-z0-9_-]{1,100}$/.test(value.code) &&
    text(value.name, 160) &&
    typeof value.job_type === 'string' && /^[a-z_]{1,40}$/.test(value.job_type) &&
    count(value.difficulty, 1, 100) && integerText(value.base_reward) &&
    value.base_reward !== '0' && integerText(value.base_experience) &&
    count(value.minimum_duration_seconds, 1, 86400) && count(value.daily_limit, 0, 100000) &&
    typeof value.active === 'boolean' &&
    integerText(value.open_assignment_count) && integerText(value.awaiting_verification_count) &&
    integerText(value.approved_24h) && integerText(value.rejected_24h) &&
    integerText(value.paid_24h) &&
    (value.last_assigned_at === null || timestamp(value.last_assigned_at));
}

function jobRow(value: unknown): value is AdminJobLevel {
  if (!record(value)) return false;
  return typeof value.job_type === 'string' && /^[a-z_]{1,40}$/.test(value.job_type) &&
    integerText(value.member_count) && decimalText(value.average_level) &&
    count(value.top_level, 0, 1000000) && integerText(value.total_experience) &&
    integerText(value.active_7d_count) &&
    BigInt(value.active_7d_count) <= BigInt(value.member_count);
}

function policyRow(value: unknown): value is AdminWorkPolicy {
  if (!record(value)) return false;
  const hasVersion = value.policy_id !== null;
  if (hasVersion) {
    if (!count(value.policy_id, 1) || !timestamp(value.effective_at) ||
        !(value.daily_cap === null || integerText(value.daily_cap)) ||
        !(value.weekly_cap === null || integerText(value.weekly_cap)) ||
        !count(value.repeat_decay_percent, 0, 100) ||
        typeof value.enabled !== 'boolean' ||
        !(value.reason === null || (typeof value.reason === 'string' && value.reason.length <= 500))) return false;
  } else if (value.effective_at !== null || value.daily_cap !== null ||
             value.weekly_cap !== null || value.repeat_decay_percent !== null ||
             value.enabled !== null || value.reason !== null) {
    return false;
  }
  return integerText(value.active_task_count) && integerText(value.open_assignment_count) &&
    integerText(value.awaiting_verification_count) && integerText(value.paid_24h) &&
    integerText(value.members_paid_24h) && integerText(value.experience_24h);
}

/** Keep unchecked DB responses out of the privileged reward-tuning UI. */
export function parseAdminWorkConsole(value: unknown): VerifiedWorkConsole | null {
  if (!record(value) || !Array.isArray(value.catalogue) || value.catalogue.length > 500 ||
      !Array.isArray(value.jobLevels) || value.jobLevels.length > 20 ||
      !policyRow(value.policy)) return null;
  const taskIds = new Set<string>();
  const taskCodes = new Set<string>();
  for (const row of value.catalogue) {
    if (!taskRow(row) || taskIds.has(row.task_id) || taskCodes.has(row.code)) return null;
    taskIds.add(row.task_id);
    taskCodes.add(row.code);
  }
  const jobs = new Set<string>();
  for (const row of value.jobLevels) {
    if (!jobRow(row) || jobs.has(row.job_type)) return null;
    jobs.add(row.job_type);
  }
  return value as unknown as VerifiedWorkConsole;
}
