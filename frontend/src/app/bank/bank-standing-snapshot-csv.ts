/** A bounded current-state export; this is not a transaction, deposit certificate or interest payout. */
const WLD = /^(0|[1-9][0-9]{0,37})$/;
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

function safeCell(value: string): string {
  const normalized = value
    .replace(/[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, ' ')
    .trim();
  const escaped = /^[=+\-@]/.test(normalized) ? `'${normalized}` : normalized;
  return `"${escaped.replace(/"/g, '""')}"`;
}

export function bankStandingSnapshotCsv(value: unknown): string {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('bank snapshot unavailable');
  const row = value as Record<string, unknown>;
  if (
    row['scope'] !== 'current_virtual_cash_deposit_only' ||
    row['source'] !== 'bank_get_my_standing'
  ) {
    throw new Error('unverified bank snapshot scope');
  }
  const timestamp = row['generatedAt'];
  if (
    typeof timestamp !== 'string' ||
    !ISO.test(timestamp) ||
    Number.isNaN(Date.parse(timestamp)) ||
    new Date(timestamp).toISOString() !== timestamp
  ) {
    throw new Error('invalid snapshot timestamp');
  }
  const fields = [
    row['cashBalanceWld'],
    row['depositBalanceWld'],
    row['unclaimedInterestEstimateWld'],
  ];
  if (fields.some((field) => typeof field !== 'string' || !WLD.test(field))) {
    throw new Error('invalid virtual WLD amount');
  }
  const notice =
    'Current game-only virtual cash/deposit snapshot; not a bank certificate or full financial statement. Unclaimed interest is an estimate, not a payout';
  const header = [
    'Generated at (UTC)',
    'Cash balance (WLD)',
    'Deposit balance (WLD)',
    'Unclaimed interest estimate (WLD)',
    'Scope and limitations',
  ];
  return (
    '\uFEFF' +
    [
      header.map(safeCell).join(','),
      [timestamp, ...(fields as string[]), notice].map(safeCell).join(','),
    ].join('\r\n') +
    '\r\n'
  );
}
