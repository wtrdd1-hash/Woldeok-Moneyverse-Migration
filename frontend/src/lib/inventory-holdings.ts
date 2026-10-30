/** Owner-scoped inventory response from shop_my_items_v2. Never infer empty from missing evidence. */
export interface InventoryHolding {
  readonly catalog_id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly quantity: number;
  readonly acquired_at: string;
  readonly expires_at: string | null;
  readonly effect_kind: string;
  readonly rarity: string;
  readonly animation_css: string | null;
  readonly preview_data: Record<string, unknown>;
  readonly is_equipped: boolean;
  readonly equipped_slot: string | null;
  readonly serial_number: number | null;
  readonly durable: boolean | null;
  readonly weekly_cost: string | null;
  readonly effect_expires_at: string | null;
  readonly unpaid_weeks: number | null;
  readonly arrears_due: string | null;
  readonly arrears_cap: string | null;
  readonly suspended: boolean | null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const WLD = /^(?:0|[1-9][0-9]{0,37})$/;
const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const isTime = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
  Number.isFinite(Date.parse(value));
const isNullableTime = (value: unknown): value is string | null => value === null || isTime(value);
const isNullableString = (value: unknown): value is string | null =>
  value === null || typeof value === 'string';
const isNullableInt = (value: unknown): value is number | null =>
  value === null || (typeof value === 'number' && Number.isSafeInteger(value) && value >= 0);
const isNullableWld = (value: unknown): value is string | null =>
  value === null || (typeof value === 'string' && WLD.test(value));

function conditionValue(row: Record<string, unknown>, key: string): unknown {
  // An older backend may omit a field. Missing is UNKNOWN, never zero/false.
  return Object.prototype.hasOwnProperty.call(row, key) ? row[key] : null;
}

export function parseInventoryHoldings(payload: unknown): { holdings: InventoryHolding[] } | null {
  if (!isObject(payload) || !Array.isArray(payload.holdings)) return null;
  const ids = new Set<string>();
  const holdings: InventoryHolding[] = [];
  for (const value of payload.holdings) {
    if (!isObject(value)) return null;
    const row = value;
    if (
      typeof row.catalog_id !== 'string' ||
      !UUID.test(row.catalog_id) ||
      ids.has(row.catalog_id.toLowerCase()) ||
      typeof row.code !== 'string' ||
      !row.code ||
      typeof row.name !== 'string' ||
      !row.name ||
      typeof row.description !== 'string' ||
      typeof row.category !== 'string' ||
      !row.category ||
      typeof row.quantity !== 'number' ||
      !Number.isSafeInteger(row.quantity) ||
      row.quantity <= 0 ||
      !isTime(row.acquired_at) ||
      !isNullableTime(row.expires_at) ||
      typeof row.effect_kind !== 'string' ||
      typeof row.rarity !== 'string' ||
      !isNullableString(row.animation_css) ||
      !isObject(row.preview_data) ||
      typeof row.is_equipped !== 'boolean' ||
      !isNullableString(row.equipped_slot) ||
      !isNullableInt(row.serial_number)
    )
      return null;
    const durable = conditionValue(row, 'durable');
    const weeklyCost = conditionValue(row, 'weekly_cost');
    const effectExpires = conditionValue(row, 'effect_expires_at');
    const unpaidWeeks = conditionValue(row, 'unpaid_weeks');
    const arrearsDue = conditionValue(row, 'arrears_due');
    const arrearsCap = conditionValue(row, 'arrears_cap');
    const suspended = conditionValue(row, 'suspended');
    if (
      (durable !== null && typeof durable !== 'boolean') ||
      !isNullableWld(weeklyCost) ||
      !isNullableTime(effectExpires) ||
      !isNullableInt(unpaidWeeks) ||
      !isNullableWld(arrearsDue) ||
      !isNullableWld(arrearsCap) ||
      (suspended !== null && typeof suspended !== 'boolean')
    )
      return null;
    ids.add(row.catalog_id.toLowerCase());
    holdings.push({
      catalog_id: row.catalog_id,
      code: row.code,
      name: row.name,
      description: row.description,
      category: row.category,
      quantity: row.quantity,
      acquired_at: row.acquired_at,
      expires_at: row.expires_at,
      effect_kind: row.effect_kind,
      rarity: row.rarity,
      animation_css: row.animation_css,
      preview_data: row.preview_data,
      is_equipped: row.is_equipped,
      equipped_slot: row.equipped_slot,
      serial_number: row.serial_number,
      durable,
      weekly_cost: weeklyCost,
      effect_expires_at: effectExpires,
      unpaid_weeks: unpaidWeeks,
      arrears_due: arrearsDue,
      arrears_cap: arrearsCap,
      suspended,
    });
  }
  return { holdings };
}
