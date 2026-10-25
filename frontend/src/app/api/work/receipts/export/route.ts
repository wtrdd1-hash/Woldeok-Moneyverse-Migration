import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const INTEGER = /^(?:0|[1-9][0-9]*)$/;
const MAX_BIGINT = 9223372036854775807n;
const PRIVATE = {
  'cache-control': 'private, no-store',
  'x-content-type-options': 'nosniff',
  'x-robots-tag': 'noindex, nofollow',
};
const COLUMNS = [
  'Created at (UTC)', 'Receipt ID', 'Assignment ID', 'Task code', 'Task name',
  'Reward (WLD)', 'Experience (EXP)', 'Ledger transaction reference ID', 'Ledger reference status',
];

interface Receipt {
  readonly receipt_id: string;
  readonly assignment_id: string;
  readonly code: string;
  readonly name: string;
  readonly reward_amount: string;
  readonly experience_amount: string;
  readonly transaction_id: string | null;
  readonly created_at: string;
}

function cell(value: string): string {
  const clean = value.replace(/[\p{Cc}\p{Cf}\u2028\u2029]+/gu, ' ').trim();
  const neutral = /^[=+@-]/.test(clean) ? `'${clean}` : clean;
  return `"${neutral.replace(/"/g, '""')}"`;
}

function integer(value: unknown): value is string {
  return typeof value === 'string' && INTEGER.test(value) && value.length <= 19 && BigInt(value) <= MAX_BIGINT;
}

function parse(value: unknown): Receipt {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid receipt');
  const row = value as Record<string, unknown>;
  if (!UUID.test(String(row.receipt_id)) || !UUID.test(String(row.assignment_id))) throw new Error('invalid receipt id');
  if (row.transaction_id !== null && (typeof row.transaction_id !== 'string' || !UUID.test(row.transaction_id))) {
    throw new Error('invalid transaction reference');
  }
  if (typeof row.code !== 'string' || !row.code.trim() || row.code.length > 120 ||
      typeof row.name !== 'string' || !row.name.trim() || row.name.length > 240) {
    throw new Error('invalid task label');
  }
  if (!integer(row.reward_amount) || !integer(row.experience_amount)) throw new Error('invalid reward amount');
  if (typeof row.created_at !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(row.created_at) ||
      !Number.isFinite(Date.parse(row.created_at))) throw new Error('invalid receipt date');
  return row as unknown as Receipt;
}

function problem(status: number, code: string): NextResponse {
  return NextResponse.json({ code }, { status, headers: PRIVATE });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (request.nextUrl.search) return problem(400, 'work_receipt_export_query_not_supported');
  try {
    const result = await api<unknown>('/api/v1/work/receipts/export');
    if (!result || typeof result !== 'object' || Array.isArray(result)) throw new Error('invalid export');
    const data = result as Record<string, unknown>;
    if (data.scope !== 'recent_20' || data.limit !== 20 || !Array.isArray(data.receipts) || data.receipts.length > 20) {
      throw new Error('invalid export scope');
    }
    const rows = data.receipts.map((value: unknown) => {
      const row = parse(value);
      return [
        new Date(row.created_at).toISOString(), row.receipt_id, row.assignment_id,
        row.code, row.name, row.reward_amount, row.experience_amount,
        row.transaction_id ?? '', row.transaction_id ? 'reference_present_unverified' : 'no_transaction_recorded',
      ].map(cell).join(',');
    });
    const csv = '\uFEFF' + [COLUMNS.map(cell).join(','), ...rows].join('\r\n');
    return new NextResponse(csv, {
      status: 200,
      headers: {
        ...PRIVATE,
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="moneyverse-work-receipts-recent-20-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error: unknown) {
    if (error instanceof ApiError && [401, 403, 428].includes(error.status)) {
      return problem(error.status, 'work_receipt_export_not_authorized');
    }
    return problem(503, 'work_receipt_export_unavailable');
  }
}
