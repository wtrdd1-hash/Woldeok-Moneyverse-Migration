import type { HeldItem } from '@/app/inventory/inventory-view';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isTimestamp(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) &&
    Number.isFinite(Date.parse(value));
}

function isHolding(value: unknown): value is HeldItem {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  return typeof row.catalog_id === 'string' && UUID.test(row.catalog_id) &&
    typeof row.code === 'string' && row.code.length > 0 &&
    typeof row.name === 'string' && row.name.trim().length > 0 &&
    typeof row.description === 'string' &&
    typeof row.category === 'string' && row.category.length > 0 &&
    typeof row.quantity === 'number' && Number.isSafeInteger(row.quantity) && row.quantity > 0 &&
    isTimestamp(row.acquired_at) &&
    (row.expires_at === null || isTimestamp(row.expires_at)) &&
    typeof row.effect_kind === 'string' && typeof row.rarity === 'string' &&
    (row.animation_css === null || typeof row.animation_css === 'string') &&
    row.preview_data !== null && typeof row.preview_data === 'object' &&
    !Array.isArray(row.preview_data) &&
    typeof row.is_equipped === 'boolean' &&
    (row.equipped_slot === null || typeof row.equipped_slot === 'string') &&
    (row.serial_number === null ||
      (typeof row.serial_number === 'number' && Number.isSafeInteger(row.serial_number)) ||
      (typeof row.serial_number === 'string' && /^[1-9][0-9]*$/.test(row.serial_number)));
}

/** A missing or malformed success payload is never evidence of an empty shelf. */
export function parseVerifiedShopHoldings(payload: unknown): HeldItem[] | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const holdings = (payload as { holdings?: unknown }).holdings;
  if (!Array.isArray(holdings) || !holdings.every(isHolding)) return null;
  return holdings;
}
