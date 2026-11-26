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
  /** GAMEYEAR: the server year, or null when the API did not certify one (shown as unavailable). */
  readonly year: GameYear | null;
}

/** The server game year (SERVER_GAME_CLOCK_SPEC section 6): 365 game days, from the API only. */
export interface GameYear {
  readonly gameYear: number;
  readonly dayOfYear: number;
  readonly gameDaysPerYear: number;
  readonly yearStartedAt: string;
  readonly yearEndsAt: string;
  readonly observedAt: string;
  readonly calendarVersion: string;
}

function parseYear(v: Record<string, unknown>): GameYear | null {
  const gameYear = Number(v.gameYear);
  const dayOfYear = Number(v.dayOfYear);
  const gameDaysPerYear = Number(v.gameDaysPerYear);
  if (!Number.isSafeInteger(gameYear) || gameYear < 1) return null;
  if (!Number.isSafeInteger(gameDaysPerYear) || gameDaysPerYear < 1) return null;
  if (!Number.isSafeInteger(dayOfYear) || dayOfYear < 1 || dayOfYear > gameDaysPerYear) return null;
  if (!iso(v.yearStartedAt) || !iso(v.yearEndsAt) || !iso(v.observedAt)) return null;
  if (Date.parse(v.yearEndsAt) <= Date.parse(v.yearStartedAt)) return null;
  if (typeof v.calendarVersion !== 'string' || v.calendarVersion.length === 0 || v.calendarVersion.length > 64) return null;
  return { gameYear, dayOfYear, gameDaysPerYear, yearStartedAt: v.yearStartedAt, yearEndsAt: v.yearEndsAt,
    observedAt: v.observedAt, calendarVersion: v.calendarVersion };
}

type YearLocale = 'ko' | 'en' | 'ja' | 'zh' | 'vi';

/**
 * "Moneyverse Year 28 · Day 1" in the reader's language (EN is the fallback, KO the default UI
 * locale). Real timestamps are never formatted with this; it names the game calendar only.
 */
export function gameYearLabel(locale: string, year: GameYear, compact = false): string {
  const y = year.gameYear.toLocaleString(locale === 'ko' ? 'ko-KR' : locale === 'ja' ? 'ja-JP' : locale === 'zh' ? 'zh-CN' : locale === 'vi' ? 'vi-VN' : 'en-US');
  const d = year.dayOfYear;
  const l = (['ko', 'en', 'ja', 'zh', 'vi'] as const).includes(locale as YearLocale) ? (locale as YearLocale) : 'en';
  if (compact) {
    return { en: `Y${y} · D${d}`, ko: `${y}년 · ${d}일차`, ja: `${y}年 · ${d}日目`, zh: `${y}年 · 第${d}天`, vi: `Năm ${y} · Ngày ${d}` }[l];
  }
  return {
    en: `Moneyverse Year ${y} · Day ${d}`,
    ko: `머니버스 ${y}년 · ${d}일차`,
    ja: `マネーバース${y}年 · ${d}日目`,
    zh: `Moneyverse 第${y}年 · 第${d}天`,
    vi: `Năm Moneyverse ${y} · Ngày ${d}`,
  }[l];
}

/** "Week 1,489 · day 4 of 7" in the reader's language. */
export function gameWeekLabel(locale: string, week: number, dayOfWeek: number): string {
  const w = week.toLocaleString(locale === 'ko' ? 'ko-KR' : 'en-US');
  return ({
    en: `Week ${w} · Day ${dayOfWeek}/7`,
    ko: `${w}주차 · ${dayOfWeek}일째`,
    ja: `第${w}週 · ${dayOfWeek}日目`,
    zh: `第${w}周 · 第${dayOfWeek}天`,
    vi: `Tuần ${w} · Ngày ${dayOfWeek}/7`,
  } as Record<string, string>)[locale] ?? `Week ${w} · Day ${dayOfWeek}/7`;
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
    year: parseYear(v),
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
