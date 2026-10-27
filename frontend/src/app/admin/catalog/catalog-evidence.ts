import type { AdminBusiness, AdminSeasonEvent } from '../types';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const WLD = /^(0|[1-9][0-9]{0,37})$/;
const MAX_CATALOG_ROWS = 5000;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonEmpty(value: unknown, max = 256): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}

function validRows(value: unknown, key: string): unknown[] | null {
  if (!record(value)) return null;
  const rows = value[key];
  return Array.isArray(rows) && rows.length <= MAX_CATALOG_ROWS ? rows : null;
}

function validIso(value: unknown): boolean {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
    return false;
  }
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString() === value;
}

/** Only PostgreSQL-derived, internally consistent catalog evidence can drive admin actions. */
export function parseBusinessCatalog(value: unknown): AdminBusiness[] | null {
  const rows = validRows(value, 'businessTypes');
  if (!rows) return null;
  const ids = new Set<string>();
  const symbols = new Set<string>();
  const businesses: AdminBusiness[] = [];
  for (const row of rows) {
    if (
      !record(row) || typeof row.id !== 'string' || !UUID.test(row.id) ||
      !nonEmpty(row.symbol, 64) || !nonEmpty(row.name) ||
      typeof row.purchase_cost !== 'string' || !WLD.test(row.purchase_cost) ||
      typeof row.daily_revenue !== 'string' || !WLD.test(row.daily_revenue) ||
      typeof row.daily_operating_cost !== 'string' || !WLD.test(row.daily_operating_cost) ||
      typeof row.active !== 'boolean'
    ) return null;
    const id = row.id.toLowerCase();
    const symbol = row.symbol.toLowerCase();
    if (ids.has(id) || symbols.has(symbol)) return null;
    ids.add(id);
    symbols.add(symbol);
    businesses.push({
      id: row.id, symbol: row.symbol, name: row.name,
      purchase_cost: row.purchase_cost, daily_revenue: row.daily_revenue,
      daily_operating_cost: row.daily_operating_cost, active: row.active,
    });
  }
  return businesses;
}

export function parseSeasonCatalog(value: unknown): AdminSeasonEvent[] | null {
  const rows = validRows(value, 'events');
  if (!rows) return null;
  const ids = new Set<string>();
  const events: AdminSeasonEvent[] = [];
  for (const row of rows) {
    if (
      !record(row) || typeof row.id !== 'string' || !UUID.test(row.id) ||
      !nonEmpty(row.season_name) || !nonEmpty(row.title) ||
      typeof row.cost_wld !== 'string' || !WLD.test(row.cost_wld) ||
      typeof row.points_per_entry !== 'number' || !Number.isSafeInteger(row.points_per_entry) ||
      row.points_per_entry < 1 || typeof row.active !== 'boolean' || !validIso(row.ends_at)
    ) return null;
    const id = row.id.toLowerCase();
    if (ids.has(id)) return null;
    ids.add(id);
    events.push({
      id: row.id, season_name: row.season_name, title: row.title,
      cost_wld: row.cost_wld, points_per_entry: row.points_per_entry, active: row.active,
    });
  }
  return events;
}
