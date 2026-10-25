import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const WLD = /^(?:0|[1-9][0-9]*)$/;
const MAX_WLD = 9223372036854775807n;
const MAX_HOLDINGS = 100;
const HEADERS = [
  'Catalog ID', 'Item code', 'Item name', 'Category', 'Quantity',
  'Acquired at (UTC)', 'Expires at (UTC)', 'Rarity', 'Equipped', 'Equipped slot',
  'Serial number', 'Weekly upkeep (WLD)',
] as const;
const PRIVATE_HEADERS = {
  'cache-control': 'private, no-store',
  'x-content-type-options': 'nosniff',
  'x-robots-tag': 'noindex, nofollow',
};

interface Holding {
  catalog_id: string;
  code: string;
  name: string;
  category: string;
  quantity: number;
  acquired_at: string;
  expires_at: string | null;
  rarity: string;
  is_equipped: boolean;
  equipped_slot: string | null;
  serial_number: number | null;
  weekly_cost: string | null;
}

function text(value: unknown, maxLength: number): string {
  if (typeof value !== 'string' || !value.trim() || value.length > maxLength) {
    throw new Error('invalid inventory field');
  }
  return value;
}

function timestamp(value: unknown): string {
  if (typeof value !== 'string' || value.length > 40 || !/^\d{4}-\d\d-\d\dT/.test(value)) {
    throw new Error('invalid inventory timestamp');
  }
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) throw new Error('invalid inventory timestamp');
  return parsed.toISOString();
}

function optionalTimestamp(value: unknown): string {
  return value === null ? '' : timestamp(value);
}

function optionalText(value: unknown, maxLength: number): string {
  return value === null ? '' : text(value, maxLength);
}

function optionalInteger(value: unknown): string {
  if (value === null) return '';
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0 || value > 2147483647) {
    throw new Error('invalid inventory serial');
  }
  return String(value);
}

function optionalWld(value: unknown): string {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string' || !WLD.test(value) || value.length > 19 || BigInt(value) > MAX_WLD) {
    throw new Error('invalid inventory upkeep');
  }
  return value;
}

function parseHolding(value: unknown): Holding {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('invalid inventory record');
  }
  const row = value as Record<string, unknown>;
  if (typeof row.catalog_id !== 'string' || !UUID.test(row.catalog_id)) {
    throw new Error('invalid inventory catalog id');
  }
  if (typeof row.quantity !== 'number' || !Number.isSafeInteger(row.quantity) ||
      row.quantity < 1 || row.quantity > 2147483647) {
    throw new Error('invalid inventory quantity');
  }
  if (typeof row.is_equipped !== 'boolean') throw new Error('invalid inventory equipment flag');
  return {
    catalog_id: row.catalog_id,
    code: text(row.code, 120),
    name: text(row.name, 160),
    category: text(row.category, 80),
    quantity: row.quantity,
    acquired_at: timestamp(row.acquired_at),
    expires_at: optionalTimestamp(row.expires_at),
    rarity: text(row.rarity, 80),
    is_equipped: row.is_equipped,
    equipped_slot: optionalText(row.equipped_slot, 80),
    serial_number: row.serial_number === undefined ? null : row.serial_number === null ? null :
      Number(optionalInteger(row.serial_number)),
    weekly_cost: optionalWld(row.weekly_cost),
  };
}

function csvCell(value: string): string {
  // Quoting alone does not stop spreadsheet software evaluating formula cells.
  const normalized = value.replace(/[\p{Cc}\p{Cf}\u2028\u2029]+/gu, ' ').trim();
  const safe = /^[=+@-]/.test(normalized) ? `'${normalized}` : normalized;
  return `"${safe.replace(/"/g, '""')}"`;
}

function problem(status: number, code: string): NextResponse {
  return NextResponse.json({ code }, { status, headers: PRIVATE_HEADERS });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (request.nextUrl.search) return problem(400, 'invalid_inventory_export_scope');
  try {
    // The guarded backend obtains the owner from the HttpOnly member session.
    const result = await api<unknown>('/api/v1/shop/holdings/export-snapshot');
    if (!result || typeof result !== 'object' || Array.isArray(result)) {
      throw new Error('invalid inventory snapshot');
    }
    const snapshot = result as Record<string, unknown>;
    if (snapshot.complete !== true || !Array.isArray(snapshot.holdings) ||
        snapshot.holdings.length > MAX_HOLDINGS) {
      throw new Error('incomplete inventory snapshot');
    }
    const rows = snapshot.holdings.map((entry: unknown) => {
      const row = parseHolding(entry);
      return [
        row.catalog_id, row.code, row.name, row.category, String(row.quantity),
        row.acquired_at, row.expires_at, row.rarity, String(row.is_equipped),
        row.equipped_slot, row.serial_number === null ? '' : String(row.serial_number),
        row.weekly_cost ?? '',
      ].map(csvCell).join(',');
    });
    const csv = '\uFEFF' + [HEADERS.map(csvCell).join(','), ...rows].join('\r\n');
    return new NextResponse(csv, {
      status: 200,
      headers: {
        ...PRIVATE_HEADERS,
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="moneyverse-inventory-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error: unknown) {
    if (error instanceof ApiError && [401, 403, 428].includes(error.status)) {
      return problem(error.status, 'inventory_export_not_authorized');
    }
    return problem(503, 'inventory_export_unavailable');
  }
}
