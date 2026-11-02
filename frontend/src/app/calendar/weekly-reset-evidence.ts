/** The KST Monday and goal count are only useful when every returned row agrees. */
export interface WeeklyResetEvidence {
  readonly count: number;
  readonly weekStart: string | null;
  readonly nextReset: string | null;
}

const INTEGER = /^(0|[1-9]\d*)$/;
const CODE = /^[a-z][a-z0-9_]{0,79}$/;
const MAX_PG_BIGINT = 9223372036854775807n;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isText(value: unknown, min = 1, max = 200): value is string {
  return typeof value === 'string' && value.length >= min && value.length <= max &&
    !/[\x00-\x1f\x7f]/.test(value);
}

function isPgNonnegativeBigInt(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 19 && INTEGER.test(value) &&
    BigInt(value) <= MAX_PG_BIGINT;
}

function isMonday(date: unknown): date is string {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const day = new Date(`${date}T00:00:00.000Z`);
  return Number.isFinite(day.getTime()) && day.toISOString().slice(0, 10) === date &&
    day.getUTCDay() === 1;
}

function currentMondayKst(now: Date): string | null {
  if (!Number.isFinite(now.getTime())) return null;
  const localDay = new Date(now.getTime() + KST_OFFSET_MS);
  const day = localDay.getUTCDay();
  localDay.setUTCDate(localDay.getUTCDate() - ((day + 6) % 7));
  return localDay.toISOString().slice(0, 10);
}

/**
 * The Nest endpoint uses migration 101's owner-scoped weekly goal function.
 * An API failure or a malformed HTTP 200 must not be reported as zero goals.
 */
export function parseWeeklyResetEvidence(value: unknown, now: Date = new Date()): WeeklyResetEvidence | null {
  if (!isRecord(value) || !Array.isArray(value.goals) || !Array.isArray(value.collections) ||
      value.goals.length > 32 || value.collections.length > 100) return null;
  const currentWeek = currentMondayKst(now);
  if (!currentWeek) return null;
  const seen = new Set<string>();
  let weeklyCount = 0;
  for (const raw of value.goals as unknown[]) {
    if (!isRecord(raw) || !isText(raw.goal_code) || !CODE.test(raw.goal_code) ||
        seen.has(raw.goal_code) || !isText(raw.goal_label) ||
        !isText(raw.goal_detail, 0, 1000) || !isText(raw.goal_metric) ||
        !isText(raw.goal_unit, 0, 40) ||
        (raw.goal_window !== 'week' && raw.goal_window !== 'lifetime') ||
        !isPgNonnegativeBigInt(raw.goal_target) || raw.goal_target === '0' ||
        !isPgNonnegativeBigInt(raw.goal_progress) ||
        typeof raw.goal_self_reported !== 'boolean' ||
        typeof raw.goal_completed !== 'boolean' ||
        raw.goal_completed !== (BigInt(raw.goal_progress) >= BigInt(raw.goal_target)) ||
        !isMonday(raw.week_start) || raw.week_start !== currentWeek) return null;
    seen.add(raw.goal_code);
    if (raw.goal_window === 'week') weeklyCount++;
  }
  if (weeklyCount === 0) return { count: 0, weekStart: null, nextReset: null };
  const nextReset = new Date(Date.parse(`${currentWeek}T00:00:00+09:00`) + WEEK_MS).toISOString();
  return { count: weeklyCount, weekStart: currentWeek, nextReset };
}
