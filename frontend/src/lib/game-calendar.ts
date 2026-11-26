/**
 * The server game calendar (docs/planning/SERVER_GAME_CLOCK_SPEC.ko.md): 10 real minutes are one
 * game day, seven game days one week. The server owns it; this file only reads and formats.
 */
export interface GameClock {
  readonly dayIndex: number;
  readonly weekIndex: number;
  /** 1..7 within the current week. */
  readonly dayOfWeek: number;
  readonly realSecondsPerDay: number;
  readonly gameDaysPerWeek: number;
  readonly dayStartedAt: string;
  readonly dayEndsAt: string;
  readonly weekStartedAt: string;
  /** Synthetic calendar date of this game day, e.g. 2028-07-07. */
  readonly dayKey: string;
  /** Synthetic calendar date the week started on. */
  readonly weekKey: string;
}

const DAY = /^\d{4}-\d{2}-\d{2}$/;

function iso(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

/** Accepts only a complete, self-consistent clock; anything else is no clock at all. */
export function parseGameClock(value: unknown): GameClock | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  const dayIndex = Number(v.dayIndex);
  const weekIndex = Number(v.weekIndex);
  const dayOfWeek = Number(v.dayOfWeek);
  const realSecondsPerDay = Number(v.realSecondsPerDay);
  const gameDaysPerWeek = Number(v.gameDaysPerWeek);
  if (![dayIndex, weekIndex, dayOfWeek, realSecondsPerDay, gameDaysPerWeek].every(Number.isSafeInteger)) return null;
  if (dayOfWeek < 1 || dayOfWeek > gameDaysPerWeek || realSecondsPerDay < 1 || gameDaysPerWeek < 1 || gameDaysPerWeek > 14) return null;
  if (!iso(v.dayStartedAt) || !iso(v.dayEndsAt) || !iso(v.weekStartedAt)) return null;
  if (typeof v.dayKey !== 'string' || !DAY.test(v.dayKey) || typeof v.weekKey !== 'string' || !DAY.test(v.weekKey)) return null;
  return {
    dayIndex, weekIndex, dayOfWeek, realSecondsPerDay, gameDaysPerWeek,
    dayStartedAt: v.dayStartedAt, dayEndsAt: v.dayEndsAt, weekStartedAt: v.weekStartedAt,
    dayKey: v.dayKey, weekKey: v.weekKey,
  };
}

/** 2028-07-07 -> 28.07.07, the way a passbook printer dates a line. */
export function passbookDate(dayKey: string): string {
  return DAY.test(dayKey) ? `${dayKey.slice(2, 4)}.${dayKey.slice(5, 7)}.${dayKey.slice(8, 10)}` : dayKey;
}

/** The synthetic date n days after a key (UTC arithmetic on the calendar date only). */
export function addDays(dayKey: string, days: number): string {
  const t = Date.parse(`${dayKey}T00:00:00.000Z`) + days * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}

/**
 * Where a real moment falls in the current game week: 1..7, or null outside this week.
 * Derived from the server's own day boundary and day length, never from the browser clock.
 */
export function weekDayOf(clock: GameClock, occurredAt: string): number | null {
  const t = Date.parse(occurredAt);
  if (!Number.isFinite(t)) return null;
  const offset = Math.floor((t - Date.parse(clock.dayStartedAt)) / (clock.realSecondsPerDay * 1000));
  const day = clock.dayOfWeek + offset;
  return day >= 1 && day <= clock.gameDaysPerWeek ? day : null;
}

/** The game date of any real moment, as a synthetic day key. */
export function dayKeyOf(clock: GameClock, occurredAt: string): string | null {
  const t = Date.parse(occurredAt);
  if (!Number.isFinite(t)) return null;
  const offset = Math.floor((t - Date.parse(clock.dayStartedAt)) / (clock.realSecondsPerDay * 1000));
  return addDays(clock.dayKey, offset);
}
