import { createHmac, timingSafeEqual } from 'node:crypto';
import { WalletInputError, requireUuid } from './wallet.repository';

export class WalletActivityCursorExpired extends WalletInputError {}

export type WalletActivityPeriod = 'all' | '7d' | '30d';
export type WalletActivityDirection = 'all' | 'in' | 'out' | 'neutral';
export interface WalletActivityCursor {
  readonly owner: string;
  readonly session: string;
  readonly period: WalletActivityPeriod;
  readonly direction?: WalletActivityDirection;
  readonly asOf: string;
  readonly afterAt: string;
  readonly afterId: string;
  readonly rangeFrom?: string;
  readonly rangeTo?: string;
  readonly minAmount?: string;
}

function key(): string {
  const value = process.env.SESSION_CURRENT_KEY ?? process.env.SESSION_SIGNING_KEY ?? process.env.DATA_ENCRYPTION_KEY;
  if (!value || value.length < 32) throw new Error('wallet history cursor signing key is unavailable');
  return value;
}

function signature(body: string, range: boolean, amount: boolean = false): Buffer {
  const purpose = amount ? (range ? 'wallet-history-amount-range-v4' : 'wallet-history-amount-v3')
    : (range ? 'wallet-history-range-v2' : 'wallet-history-v1');
  return createHmac('sha256', key()).update(`${purpose}:${body}`).digest();
}

export function signWalletActivityCursor(cursor: WalletActivityCursor): string {
  const range = cursor.rangeFrom !== undefined || cursor.rangeTo !== undefined;
  const amount = cursor.minAmount !== undefined;
  const body = Buffer.from(JSON.stringify({ v: amount ? (range ? 4 : 3) : (range ? 2 : 1), ...cursor }), 'utf8').toString('base64url');
  return `${body}.${signature(body, range, amount).toString('base64url')}`;
}

export function verifyWalletActivityCursor(token: string, owner: string, session: string, period: WalletActivityPeriod, now: Date, direction: WalletActivityDirection = 'all', range?: { from: string; to: string }, minAmount?: string): WalletActivityCursor {
  if (typeof token !== 'string' || token.length > 2048 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) {
    throw new WalletInputError('invalid wallet activity cursor');
  }
  const [body, mac] = token.split('.');
  let data: Record<string, unknown>;
  try { data = JSON.parse(Buffer.from(body!, 'base64url').toString('utf8')) as Record<string, unknown>; }
  catch { throw new WalletInputError('invalid wallet activity cursor'); }
  const actual = Buffer.from(mac!, 'base64url');
  const expected = signature(body!, range !== undefined, minAmount !== undefined);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    throw new WalletInputError('invalid wallet activity cursor');
  }
  if (data.v !== (minAmount ? (range ? 4 : 3) : (range ? 2 : 1)) || data.minAmount !== minAmount || data.owner !== owner || data.session !== session || data.period !== period || (data.direction ?? 'all') !== direction ||
      data.rangeFrom !== range?.from || data.rangeTo !== range?.to ||
      typeof data.asOf !== 'string' || typeof data.afterAt !== 'string' || typeof data.afterId !== 'string') {
    throw new WalletInputError('wallet activity cursor does not match this session, period, direction or calendar range');
  }
  if (range && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/.test(data.afterAt)) {
    throw new WalletInputError('wallet activity cursor lacks microsecond precision');
  }
  requireUuid(data.afterId, 'cursor transaction id');
  const asOf = new Date(data.asOf);
  const afterAt = new Date(data.afterAt);
  if (Number.isNaN(asOf.valueOf()) || Number.isNaN(afterAt.valueOf()) ||
      asOf.toISOString() !== data.asOf || afterAt.toISOString() !== (range ? data.afterAt.slice(0, 23) + 'Z' : data.afterAt) ||
      asOf.getTime() > now.getTime() || afterAt > asOf) {
    throw new WalletInputError('wallet activity cursor is expired or invalid');
  }
  if (now.getTime() - asOf.getTime() > (range ? 15 : 60) * 60 * 1000) {
    if (range) throw new WalletActivityCursorExpired('wallet activity cursor expired');
    throw new WalletInputError('wallet activity cursor is expired or invalid');
  }
  return { owner, session, period, direction, asOf: data.asOf, afterAt: data.afterAt, afterId: data.afterId,
    ...(range ? { rangeFrom: range.from, rangeTo: range.to } : {}), ...(minAmount ? { minAmount } : {}) };
}
