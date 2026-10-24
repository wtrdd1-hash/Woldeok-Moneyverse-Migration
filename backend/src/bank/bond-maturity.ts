/** Project only owner-scoped holdings returned by the database's SECURITY DEFINER read. */
type BondState = 'MATURED_UNREDEEMED' | 'DUE_WITHIN_SEVEN_DAYS' | 'LATER';

export interface BondMaturityEntry {
  id: string;
  bondCode: string;
  bondName: string;
  principalWld: string;
  maturityWld: string;
  maturityAt: string;
  maturityState: BondState;
  redemptionVerified: false;
}

const DECIMAL = /^(0|[1-9][0-9]*)$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO_OFFSET = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)$/;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function nonnegativeWld(value: unknown): bigint {
  if (typeof value !== 'string' || value.length > 128 || !DECIMAL.test(value)) {
    throw new Error('invalid verified bond amount');
  }
  return BigInt(value);
}

function timestamp(value: unknown): number {
  if (typeof value !== 'string' || !ISO_OFFSET.test(value)) throw new Error('invalid bond maturity date');
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) throw new Error('invalid bond maturity date');
  return parsed;
}

export function projectBondMaturities(source: unknown, now: Date = new Date()) {
  if (!source || typeof source !== 'object' || !('bonds' in source)) {
    throw new Error('verified bond standing unavailable');
  }
  const raw = (source as {bonds: unknown}).bonds;
  if (!Array.isArray(raw) || raw.length > 5000 || !Number.isFinite(now.getTime())) {
    throw new Error('verified bond portfolio unavailable');
  }
  let totalPrincipal = 0n;
  let totalMaturity = 0n;
  let dueWithinSevenDays = 0;
  let maturedUnredeemed = 0;
  const ids = new Set<string>();
  const bonds: BondMaturityEntry[] = raw.map((item: unknown) => {
    if (!item || typeof item !== 'object') throw new Error('invalid verified bond');
    const row = item as Record<string, unknown>;
    if (typeof row.id !== 'string' || !UUID.test(row.id) || ids.has(row.id)) throw new Error('invalid or duplicate bond id');
    if (row.status !== 'holding') throw new Error('unexpected non-holding bond');
    if (typeof row.bond_code !== 'string' || row.bond_code.length > 64 ||
        typeof row.bond_name !== 'string' || row.bond_name.length > 200) throw new Error('invalid bond identity');
    const maturity = timestamp(row.maturity_at);
    const principal = nonnegativeWld(row.principal_amount);
    const maturityValue = nonnegativeWld(row.maturity_amount);
    ids.add(row.id);
    totalPrincipal += principal;
    totalMaturity += maturityValue;
    let maturityState: BondState = 'LATER';
    if (maturity <= now.getTime()) {
      maturityState = 'MATURED_UNREDEEMED';
      maturedUnredeemed++;
    } else if (maturity - now.getTime() <= SEVEN_DAYS_MS) {
      maturityState = 'DUE_WITHIN_SEVEN_DAYS';
      dueWithinSevenDays++;
    }
    return {
      id: row.id, bondCode: row.bond_code, bondName: row.bond_name,
      principalWld: principal.toString(), maturityWld: maturityValue.toString(),
      maturityAt: new Date(maturity).toISOString(), maturityState, redemptionVerified: false,
    };
  });
  bonds.sort((a, b) => a.maturityAt.localeCompare(b.maturityAt) || a.id.localeCompare(b.id));
  return {
    asOf: now.toISOString(), holdingCount: bonds.length,
    dueWithinSevenDays, maturedUnredeemed,
    totalPrincipalWld: totalPrincipal.toString(), totalMaturityWld: totalMaturity.toString(),
    bonds,
  };
}
