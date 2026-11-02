import type { ProgressionStatus } from './stages';

/**
 * A member's stage is a SECURITY DEFINER read from progression_my_status.
 * Null is a legitimate, verified "not computed yet" value; missing or
 * malformed envelopes are NOT evidence of a new member or a starter stage.
 */
export type ProgressionStageEvidence =
  | { readonly kind: 'verified'; readonly status: ProgressionStatus | null }
  | { readonly kind: 'unavailable' };

const CODE = /^[a-z][a-z0-9_-]{0,63}$/;
const REQUIREMENT_KEY = /^[a-z][a-zA-Z0-9_]{0,63}$/;
const ZONED_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/;

function validCalendarDay(timestamp: string): boolean {
  const day = timestamp.slice(0, 10);
  const [year, month, date] = day.split('-').map(Number);
  return new Date(Date.UTC(year ?? 0, (month ?? 0) - 1, date ?? 0)).toISOString().slice(0, 10) === day;
}

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function parseProgressionStageEvidence(input: unknown): ProgressionStageEvidence {
  if (!record(input) || !Object.hasOwn(input, 'progression')) return { kind: 'unavailable' };
  const stage = input.progression;
  if (stage === null) return { kind: 'verified', status: null };
  if (!record(stage)) return { kind: 'unavailable' };

  if (typeof stage.stage_code !== 'string' || !CODE.test(stage.stage_code)) return { kind: 'unavailable' };
  if (
    typeof stage.reached_at !== 'string' ||
    !ZONED_TIMESTAMP.test(stage.reached_at) ||
    !Number.isFinite(Date.parse(stage.reached_at)) ||
    !validCalendarDay(stage.reached_at)
  ) return { kind: 'unavailable' };
  if (stage.next_stage_code !== null &&
    (typeof stage.next_stage_code !== 'string' || !CODE.test(stage.next_stage_code))
  ) return { kind: 'unavailable' };

  if (stage.next_stage_code === null) {
    if (stage.next_requirements !== null) return { kind: 'unavailable' };
  } else {
    if (!record(stage.next_requirements)) return { kind: 'unavailable' };
    const entries = Object.entries(stage.next_requirements);
    if (entries.length > 20 || entries.some(([key, value]) =>
      !REQUIREMENT_KEY.test(key) ||
      typeof value !== 'number' ||
      !Number.isSafeInteger(value) ||
      value < 0
    )) return { kind: 'unavailable' };
  }

  return { kind: 'verified', status: stage as unknown as ProgressionStatus };
}
