import { createHash } from 'node:crypto';
import { BadRequestException } from '@nestjs/common';

interface MoneyFlowCursor {
  readonly at: string;
  readonly tx: string;
  readonly posting: string;
  readonly filter: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
// PostgreSQL timestamptz::text preserves microseconds, unlike JavaScript Date.
const PG_TIMESTAMP = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:[+-]\d{2}(?::?\d{2})?|Z)$/;

export function moneyFlowFilterFingerprint(search?: string, type?: string, direction?: string): string {
  return createHash('sha256').update(JSON.stringify([search?.trim() ?? '', type?.trim() ?? '', direction ?? ''])).digest('hex');
}

export function encodeMoneyFlowCursor(value: Omit<MoneyFlowCursor, 'filter'>, filter: string): string {
  return `mf1.${Buffer.from(JSON.stringify({ ...value, filter }), 'utf8').toString('base64url')}`;
}

export function decodeMoneyFlowCursor(cursor: string, expectedFilter: string): MoneyFlowCursor {
  if (typeof cursor !== 'string' || !/^mf1\.[A-Za-z0-9_-]{1,480}$/.test(cursor)) {
    throw new BadRequestException('Invalid money-flow cursor');
  }
  try {
    const parsed: unknown = JSON.parse(Buffer.from(cursor.slice(4), 'base64url').toString('utf8'));
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) throw new Error('cursor object required');
    const value = parsed as Record<string, unknown>;
    if (typeof value.at !== 'string' || !PG_TIMESTAMP.test(value.at) || !Number.isFinite(Date.parse(value.at))
      || typeof value.tx !== 'string' || !UUID.test(value.tx)
      || typeof value.posting !== 'string' || !UUID.test(value.posting)
      || value.filter !== expectedFilter) throw new Error('cursor contents invalid');
    return value as unknown as MoneyFlowCursor;
  } catch {
    throw new BadRequestException('Invalid or mismatched money-flow cursor');
  }
}
