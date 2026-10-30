import { WalletInputError } from './wallet.repository';

export interface WalletCalendarRange {
  readonly from: string;
  readonly to: string;
  readonly since: Date;
  readonly before: Date;
}

function day(value: unknown): { text: string; utc: number } {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new WalletInputError('wallet calendar dates must use YYYY-MM-DD');
  }
  const utc = Date.parse(`${value}T00:00:00.000Z`);
  if (
    !Number.isFinite(utc) ||
    Number(value.slice(0, 4)) < 1 ||
    new Date(utc).toISOString().slice(0, 10) !== value
  ) {
    throw new WalletInputError('invalid Gregorian wallet calendar date');
  }
  return { text: value, utc };
}

/** Korean local days are UTC half-open windows; no local-host timezone dependency. */
export function parseWalletCalendarRange(
  from: unknown,
  to: unknown,
  now: Date,
): WalletCalendarRange | null {
  if (from === undefined && to === undefined) return null;
  const start = day(from);
  const end = day(to);
  const count = Math.round((end.utc - start.utc) / 86_400_000) + 1;
  const todayKst = new Date(now.getTime() + 9 * 3_600_000).toISOString().slice(0, 10);
  if (count < 1 || count > 366 || end.text > todayKst) {
    throw new WalletInputError(
      'wallet calendar range must be 1 to 366 days and cannot end in the future',
    );
  }
  return {
    from: start.text,
    to: end.text,
    since: new Date(start.utc - 9 * 3_600_000),
    before: new Date(end.utc + 86_400_000 - 9 * 3_600_000),
  };
}
