import { ServiceUnavailableException } from '@nestjs/common';
import type { WorkReceiptRow } from './work.repository';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const BIGINT_MAX = 9223372036854775807n;

export interface VerifiedWorkReceipt {
  readonly receipt_id: string;
  readonly assignment_id: string;
  readonly code: string;
  readonly name: string;
  readonly reward_amount: string;
  readonly experience_amount: string;
  readonly transaction_id: string | null;
  readonly created_at: string;
}

/** The SQL function is owner-scoped and LIMIT 20; never accept a fabricated or unbounded read. */
export function verifyWorkReceiptExportRows(value: unknown): VerifiedWorkReceipt[] {
  if (!Array.isArray(value) || value.length > 20) {
    throw new ServiceUnavailableException('Work receipt export is unavailable');
  }
  const ids = new Set<string>();
  return value.map((raw: unknown) => {
    const row = raw as Partial<WorkReceiptRow> | null;
    const amount = (input: unknown): input is string => typeof input === 'string' &&
      /^(0|[1-9][0-9]{0,18})$/.test(input) && BigInt(input) <= BIGINT_MAX;
    if (!row || typeof row !== 'object' || Array.isArray(row) ||
        typeof row.receipt_id !== 'string' || !UUID.test(row.receipt_id) || ids.has(row.receipt_id) ||
        typeof row.assignment_id !== 'string' || !UUID.test(row.assignment_id) ||
        typeof row.code !== 'string' || !row.code.trim() || row.code.length > 100 ||
        typeof row.name !== 'string' || !row.name.trim() || row.name.length > 300 ||
        !amount(row.reward_amount) || !amount(row.experience_amount) || row.experience_amount === '0' ||
        (row.transaction_id !== null && (typeof row.transaction_id !== 'string' || !UUID.test(row.transaction_id))) ||
        !(row.created_at instanceof Date) || !Number.isFinite(row.created_at.getTime())) {
      throw new ServiceUnavailableException('Work receipt export is unavailable');
    }
    ids.add(row.receipt_id);
    return {
      receipt_id: row.receipt_id, assignment_id: row.assignment_id,
      code: row.code, name: row.name,
      reward_amount: row.reward_amount, experience_amount: row.experience_amount,
      transaction_id: row.transaction_id, created_at: row.created_at.toISOString(),
    };
  });
}
