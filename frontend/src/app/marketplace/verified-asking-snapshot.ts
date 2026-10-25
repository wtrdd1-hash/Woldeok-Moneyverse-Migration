export interface MarketplaceAskingSnapshot {
  readonly count: number;
  readonly minPriceWld: string | null;
  readonly maxPriceWld: string | null;
  readonly limited: boolean;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DECIMAL_WLD = /^(?:0|[1-9][0-9]{0,15})(?:\.[0-9]{1,4})?$/;
const MAX_SAMPLE = 50;

function scaledWld(raw: unknown): bigint | null {
  if (typeof raw !== 'string' || !DECIMAL_WLD.test(raw)) return null;
  const [whole = '0', fraction = ''] = raw.split('.');
  const amount = BigInt(whole) * 10000n + BigInt(fraction.padEnd(4, '0') || '0');
  return amount > 0n ? amount : null;
}

function formatScaledWld(value: bigint): string {
  const whole = (value / 10000n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const fraction = (value % 10000n).toString().padStart(4, '0').replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : whole;
}

/**
 * The authenticated listings endpoint returns up to 50 newest ACTIVE *asks*.
 * No trade execution or market-wide volume can be inferred from these rows.
 */
export function parseMarketplaceAskingSnapshot(raw: unknown): MarketplaceAskingSnapshot | null {
  if (!Array.isArray(raw) || raw.length > MAX_SAMPLE) return null;

  const seen = new Set<string>();
  let min: bigint | null = null;
  let max: bigint | null = null;

  for (const value of raw) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const row = value as Record<string, unknown>;
    if (typeof row.id !== 'string' || !UUID.test(row.id) || seen.has(row.id.toLowerCase())) return null;
    if (row.status !== 'ACTIVE') return null;
    if (typeof row.quantity !== 'number' || !Number.isSafeInteger(row.quantity) || row.quantity < 1) return null;
    if (typeof row.created_at !== 'string' || !Number.isFinite(Date.parse(row.created_at))) return null;
    const price = scaledWld(row.price_wld);
    if (price === null) return null;
    seen.add(row.id.toLowerCase());
    if (min === null || price < min) min = price;
    if (max === null || price > max) max = price;
  }

  return {
    count: raw.length,
    minPriceWld: min === null ? null : formatScaledWld(min),
    maxPriceWld: max === null ? null : formatScaledWld(max),
    limited: raw.length === MAX_SAMPLE,
  };
}
