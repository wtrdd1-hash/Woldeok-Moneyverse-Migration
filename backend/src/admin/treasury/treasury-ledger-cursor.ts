import { BadRequestException } from '@nestjs/common';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
// PostgreSQL timestamptz::text retains microseconds that Date.toISOString() drops.
const PG_TIMESTAMP = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:[+-]\d{2}(?::?\d{2})?|Z)$/;

export interface TreasuryLedgerCursor {
  readonly at: string;
  readonly id: string;
}

export function parseTreasuryLedgerLimit(input: unknown): number {
  if (input === undefined) return 30;
  if (typeof input === 'number') {
    if (Number.isSafeInteger(input) && input >= 1 && input <= 100) return input;
  } else if (typeof input === 'string' && /^(?:[1-9]|[1-9][0-9]|100)$/.test(input)) {
    return Number(input);
  }
  throw new BadRequestException('limit must be a canonical decimal integer from 1 to 100');
}

export function encodeTreasuryLedgerCursor(cursor: TreasuryLedgerCursor): string {
  return `tl1.${Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url')}`;
}

export function decodeTreasuryLedgerCursor(input: unknown): TreasuryLedgerCursor {
  if (typeof input !== 'string' || !/^tl1\.[A-Za-z0-9_-]{1,480}$/.test(input)) {
    throw new BadRequestException('Invalid treasury ledger cursor');
  }
  try {
    const encoded = input.slice(4);
    const decoded = Buffer.from(encoded, 'base64url');
    if (decoded.toString('base64url') !== encoded) throw new Error('noncanonical base64url');
    const value: unknown = JSON.parse(decoded.toString('utf8'));
    if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error('cursor object required');
    const record = value as Record<string, unknown>;
    if (Object.keys(record).sort().join(',') !== 'at,id'
      || typeof record.at !== 'string' || !PG_TIMESTAMP.test(record.at)
      || !Number.isFinite(Date.parse(record.at))
      || typeof record.id !== 'string' || !UUID.test(record.id)) {
      throw new Error('invalid cursor fields');
    }
    return { at: record.at, id: record.id };
  } catch {
    throw new BadRequestException('Invalid treasury ledger cursor');
  }
}
