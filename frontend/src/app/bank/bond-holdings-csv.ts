/** A downloadable read-only projection, never a settlement or redemption receipt. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const AMOUNT = /^(0|[1-9][0-9]{0,37})$/;

function csvCell(input: string): string {
  const clean = input.replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
  const safe = /^[=+\-@]/.test(clean) ? `'${clean}` : clean;
  return `"${safe.replace(/"/g, '""')}"`;
}

function time(value: unknown): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(value)) {
    throw new Error('invalid bond timestamp');
  }
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) throw new Error('invalid bond timestamp');
  return date.toISOString();
}

/** Validate the full response before emitting a single byte; never return partial CSV. */
export function bondHoldingsCsv(data: unknown): string {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('bond holdings unavailable');
  }
  const result = data as Record<string, unknown>;
  if (result['scope'] !== 'current_holdings_only' ||
      !Array.isArray(result['bonds']) || result['bonds'].length > 100) {
    throw new Error('verified bond holdings unavailable');
  }
  const header = ['Bond ID', 'Bond code', 'Bond name', 'Principal (WLD)',
    'Maturity value (WLD)', 'Yield (bps)', 'Purchased at (UTC)',
    'Maturity at (UTC)', 'Matured', 'Scope'];
  const rows = result['bonds'].map((value: unknown) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid bond');
    const bond = value as Record<string, unknown>;
    if (typeof bond['id'] !== 'string' || !UUID.test(bond['id']) ||
        typeof bond['bond_code'] !== 'string' || bond['bond_code'].length < 1 || bond['bond_code'].length > 40 ||
        typeof bond['bond_name'] !== 'string' || bond['bond_name'].length < 1 || bond['bond_name'].length > 200 ||
        typeof bond['principal_amount'] !== 'string' || !AMOUNT.test(bond['principal_amount']) ||
        typeof bond['maturity_amount'] !== 'string' || !AMOUNT.test(bond['maturity_amount']) ||
        !Number.isSafeInteger(bond['yield_bps']) || (bond['yield_bps'] as number) < 0 ||
        typeof bond['is_matured'] !== 'boolean' || bond['status'] !== 'holding') {
      throw new Error('unverified bond holding');
    }
    return [bond['id'], bond['bond_code'], bond['bond_name'], bond['principal_amount'],
      bond['maturity_amount'], String(bond['yield_bps']), time(bond['purchased_at']),
      time(bond['maturity_at']), bond['is_matured'] ? 'Yes' : 'No', 'Current holdings only']
      .map((field) => csvCell(field as string)).join(',');
  });
  return '\uFEFF' + [header.map(csvCell).join(','), ...rows].join('\r\n') + '\r\n';
}
