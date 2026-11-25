import type { FirstDayStep, TodayEvent } from './early-events';
import type { EarlyGameBoard } from './early-game';
import type { EngagementBoard } from './quests';

/**
 * Readers for /api/v1/early-game/{first-day,today}. Only rows shaped like the
 * database functions (public.early_first_day_flow, public.early_today_event)
 * are accepted; anything else — including Spring's hard-coded placeholders —
 * is "unavailable" (null), which the page already renders honestly.
 */
const obj = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v);
const str = (v: unknown): v is string => typeof v === 'string';
const INT = /^-?\d+$/;

function step(v: unknown): v is FirstDayStep {
  return obj(v) && str(v.step_code) && str(v.step_label) && str(v.step_detail) &&
    str(v.step_href) && /^\/(?!\/)/.test(v.step_href) && str(v.step_metric) &&
    typeof v.step_verified === 'boolean' && typeof v.step_done === 'boolean' &&
    str(v.step_target) && INT.test(v.step_target) && str(v.step_progress) && INT.test(v.step_progress) && str(v.step_unit);
}

export function readFirstDaySteps(raw: unknown): readonly FirstDayStep[] | null {
  if (!obj(raw) || !Array.isArray(raw.steps) || !raw.steps.every(step)) return null;
  return raw.steps;
}

function event(v: unknown): v is TodayEvent {
  return obj(v) && str(v.event_date) && str(v.event_code) && str(v.event_label) && str(v.event_detail) &&
    str(v.claim_label) && str(v.reward_amount) && INT.test(v.reward_amount) && str(v.reward_experience) &&
    INT.test(v.reward_experience) && typeof v.experience_blocked === 'boolean' && typeof v.claimed === 'boolean' &&
    (v.reward_item_name === null || str(v.reward_item_name)) && typeof v.reward_item_quantity === 'number';
}

export function readTodayEvent(raw: unknown): { readonly event: TodayEvent | null } | null {
  if (!obj(raw) || !('event' in raw)) return null;
  if (raw.event === null) return { event: null };
  return event(raw.event) ? { event: raw.event } : null;
}

export function isEngagementBoard(raw: unknown): raw is EngagementBoard {
  return obj(raw) && Array.isArray(raw.today_tasks) && Array.isArray(raw.weekly_goals) &&
    typeof raw.notifications_enabled === 'boolean' && (raw.next_unlock === null || obj(raw.next_unlock));
}

export function isEarlyGameBoard(raw: unknown): raw is EarlyGameBoard {
  return obj(raw) && Array.isArray(raw.goals) && Array.isArray(raw.collections);
}
