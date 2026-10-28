import { createHmac, timingSafeEqual } from 'node:crypto';
import { WalletInputError, requireUuid } from './wallet.repository';

export type WalletActivityPeriod = 'all' | '7d' | '30d';
export interface WalletActivityCursor {
  readonly owner: string;
  readonly session: string;
  readonly period: WalletActivityPeriod;
  readonly asOf: string;
  readonly afterAt: string;
  readonly afterId: string;
}

function key(): string {
  const value = process.env.SESSION_CURRENT_KEY ?? process.env.SESSION_SIGNING_KEY ?? process.env.DATA_ENCRYPTION_KEY;
  if (!value || value.length < 32) throw new Error('wallet history cursor signing key is unavailable');
  return value;
}

function signature(body: string): Buffer {
  return createHmac('sha256', key()).update(`wallet-history-v1:${body}`).digest();
}

export function signWalletActivityCursor(cursor: WalletActivityCursor): string {
  const body = Buffer.from(JSON.stringify({ v: 1, ...cursor }), 'utf8').toString('base64url');
  return `${body}.${signature(body).toString('base64url')}`;
}

export function verifyWalletActivityCursor(token: string, owner: string, session: string, period: WalletActivityPeriod, now: Date): WalletActivityCursor {
  if (typeof token !== 'string' || token.length > 2048 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) {
    throw new WalletInputError('invalid wallet activity cursor');
  }
  const [body, mac] = token.split('.');
  const actual = Buffer.from(mac!, 'base64url');
  const expected = signature(body!);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    throw new WalletInputError('invalid wallet activity cursor');
  }
  let data: Record<string, unknown>;
  try { data = JSON.parse(Buffer.from(body!, 'base64url').toString('utf8')) as Record<string, unknown>; }
  catch { throw new WalletInputError('invalid wallet activity cursor'); }
  if (data.v !== 1 || data.owner !== owner || data.session !== session || data.period !== period ||
      typeof data.asOf !== 'string' || typeof data.afterAt !== 'string' || typeof data.afterId !== 'string') {
    throw new WalletInputError('wallet activity cursor does not match this session or period');
  }
  requireUuid(data.afterId, 'cursor transaction id');
  const asOf = new Date(data.asOf);
  const afterAt = new Date(data.afterAt);
  if (Number.isNaN(asOf.valueOf()) || Number.isNaN(afterAt.valueOf()) ||
      asOf.toISOString() !== data.asOf || afterAt.toISOString() !== data.afterAt ||
      asOf.getTime() > now.getTime() || now.getTime() - asOf.getTime() > 60 * 60 * 1000 || afterAt > asOf) {
    throw new WalletInputError('wallet activity cursor is expired or invalid');
  }
  return { owner, session, period, asOf: data.asOf, afterAt: data.afterAt, afterId: data.afterId };
}
