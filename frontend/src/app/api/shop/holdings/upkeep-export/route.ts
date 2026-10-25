import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const WLD = /^(?:0|[1-9][0-9]*)$/;
const MAX_WLD = 9223372036854775807n;
const MAX_ROWS = 100;
const HEADERS = [
  'Catalog ID', 'Item code', 'Item name', 'Category', 'Quantity',
  'Weekly upkeep (WLD)', 'Arrears due (WLD)', 'Arrears cap (WLD)',
  'Unpaid weeks', 'Suspended', 'Acquired at (UTC)', 'Item expires at (UTC)',
  'Effect expires at (UTC)', 'Snapshot as of (UTC)',
] as const;
const PRIVATE_HEADERS = {
  'cache-control': 'private, no-store',
  'x-content-type-options': 'nosniff',
  'x-robots-tag': 'noindex, nofollow',
};

interface UpkeepHolding {
  readonly catalogId: string;
  readonly code: string;
  readonly name: string;
  readonly category: string;
  readonly quantity: number;
  readonly weeklyCost: string;
  readonly arrearsDue: string;
  readonly arrearsCap: string;
  readonly unpaidWeeks: number;
  readonly suspended: boolean;
  readonly acquiredAt: string;
  readonly expiresAt: string;
  readonly effectExpiresAt: string;
}

function boundedText(value: unknown, max: number): string {
  if (typeof value !== 'string' || !value.trim() || value.length > max) {
    throw new Error('invalid upkeep field');
  }
  return value;
}

function timestamp(value: unknown): string {
  if (typeof value !== 'string' || value.length > 40 || !/^\d{4}-\d\d-\d\dT/.test(value)) {
    throw new Error('invalid upkeep timestamp');
  }
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) throw new Error('invalid upkeep timestamp');
  return date.toISOString();
}

function optionalTimestamp(value: unknown): string {
  return value === null ? '' : timestamp(value);
}

function wld(value: unknown): string {
  if (typeof value !== 'string' || value.length > 19 || !WLD.test(value) || BigInt(value) > MAX_WLD) {
    throw new Error('invalid upkeep amount');
  }
  return value;
}

function integer(value: unknown, minimum: number, maximum: number): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new Error('invalid upkeep count');
  }
  return value;
}

function parseHolding(value: unknown): UpkeepHolding {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('invalid upkeep holding');
  }
  const row = value as Record<string, unknown>;
  if (typeof row.catalog_id !== 'string' || !UUID.test(row.catalog_id)) {
    throw new Error('invalid upkeep catalog id');
  }
  if (typeof row.suspended !== 'boolean') throw new Error('invalid upkeep suspension');
  const weeklyCost = wld(row.weekly_cost);
  const arrearsDue = wld(row.arrears_due);
  const arrearsCap = wld(row.arrears_cap);
  if (weeklyCost === '0' && arrearsDue === '0' && row.suspended === false) {
    throw new Error('non-upkeep item in exposure snapshot');
  }
  return {
    catalogId: row.catalog_id,
    code: boundedText(row.code, 120),
    name: boundedText(row.name, 160),
    category: boundedText(row.category, 80),
    quantity: integer(row.quantity, 1, 2147483647),
    weeklyCost,
    arrearsDue,
    arrearsCap,
    unpaidWeeks: integer(row.unpaid_weeks, 0, 2147483647),
    suspended: row.suspended,
    acquiredAt: timestamp(row.acquired_at),
    expiresAt: optionalTimestamp(row.expires_at),
    effectExpiresAt: optionalTimestamp(row.effect_expires_at),
  };
}

function csvCell(value: string): string {
  // Spreadsheet applications may evaluate a formula even when a CSV cell is quoted.
  const normalized = value.replace(/[\p{Cc}\p{Cf}\u2028\u2029]+/gu, ' ').trim();
  const safe = /^[=+@-]/.test(normalized) ? `'${normalized}` : normalized;
  return `"${safe.replace(/"/g, '""')}"`;
}

function problem(status: number, code: string): NextResponse {
  return NextResponse.json({ code }, { status, headers: PRIVATE_HEADERS });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (request.nextUrl.search) return problem(400, 'invalid_upkeep_export_scope');
  try {
    // The NestJS session/consent guards choose the actor; no client actor ID is accepted.
    const payload = await api<unknown>('/api/v1/shop/holdings/upkeep-snapshot');
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw new Error('invalid upkeep snapshot');
    }
    const snapshot = payload as Record<string, unknown>;
    if (snapshot.complete !== true || !Array.isArray(snapshot.upkeepHoldings) ||
        snapshot.upkeepHoldings.length > MAX_ROWS) {
      throw new Error('incomplete upkeep snapshot');
    }
    const generatedAt = timestamp(snapshot.generatedAt);
    const rows = snapshot.upkeepHoldings.map((entry: unknown) => {
      const row = parseHolding(entry);
      return [
        row.catalogId, row.code, row.name, row.category, String(row.quantity),
        row.weeklyCost, row.arrearsDue, row.arrearsCap, String(row.unpaidWeeks),
        String(row.suspended), row.acquiredAt, row.expiresAt, row.effectExpiresAt, generatedAt,
      ].map(csvCell).join(',');
    });
    const csv = '\uFEFF' + [HEADERS.map(csvCell).join(','), ...rows].join('\r\n');
    return new NextResponse(csv, {
      status: 200,
      headers: {
        ...PRIVATE_HEADERS,
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="moneyverse-shop-upkeep-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error: unknown) {
    if (error instanceof ApiError && [401, 403, 428].includes(error.status)) {
      return problem(error.status, 'upkeep_export_not_authorized');
    }
    return problem(503, 'upkeep_export_unavailable');
  }
}
