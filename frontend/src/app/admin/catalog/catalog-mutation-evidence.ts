import { parseBusinessCatalog, parseSeasonCatalog } from './catalog-evidence';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function catalogUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** PostgreSQL reports `changed: false` for a missing target without an HTTP error. */
export function changedCatalogReceipt(value: unknown): boolean {
  return record(value) && value.changed === true;
}

export function createdCatalogId(value: unknown): string | null {
  return record(value) && catalogUuid(value.id) ? value.id : null;
}

export function businessStateConfirmed(payload: unknown, id: string, active: boolean): boolean {
  const rows = parseBusinessCatalog(payload);
  return rows !== null && rows.some((row) => row.id.toLowerCase() === id.toLowerCase() && row.active === active);
}

export function eventStateConfirmed(payload: unknown, id: string, active: boolean): boolean {
  const rows = parseSeasonCatalog(payload);
  return rows !== null && rows.some((row) => row.id.toLowerCase() === id.toLowerCase() && row.active === active);
}

export function createdEventConfirmed(
  payload: unknown,
  id: string,
  expected: { readonly title: string; readonly costWld: string; readonly pointsPerEntry: string },
): boolean {
  const rows = parseSeasonCatalog(payload);
  return rows !== null && rows.some((row) =>
    row.id.toLowerCase() === id.toLowerCase() && row.title === expected.title &&
    row.cost_wld === expected.costWld && String(row.points_per_entry) === expected.pointsPerEntry,
  );
}
