import { isWldAmount } from '@moneyverse/contract';
import type { WalletTransactionView } from './wallet.service';

const HEADERS = [
  'scope (recent 50 max)', 'occurred_at_utc', 'transaction_id', 'type',
  'label', 'direction', 'net_wld', 'cash_delta_wld', 'bank_delta_wld',
];

/** A spreadsheet is an untrusted execution surface, even for server-generated labels. */
function cell(raw: string): string {
  const normalized = raw.replace(/[\p{Cc}\p{Cf}]+/gu, ' ').trim();
  // Numeric strings are allowed; arbitrary leading formula operators are not.
  // Very large numeric strings are explicitly text to avoid spreadsheet rounding.
  const numeric = isWldAmount(normalized);
  const unsafe = /^[=+\-@]/.test(normalized) && !numeric;
  const longInteger = numeric && normalized.replace(/^-/, '').length > 15;
  const safe = unsafe || longInteger ? `'${normalized}` : normalized;
  return `"${safe.replace(/"/g, '""')}"`;
}

function amount(value: string, field: string): string {
  if (!isWldAmount(value)) throw new TypeError(`${field} must be a canonical WLD amount`);
  return value;
}

/** Read-only owner ledger projection, never a full historical account statement. */
export function walletStatementCsv(rows: readonly WalletTransactionView[]): string {
  if (rows.length > 50) throw new RangeError('wallet statement is limited to recent 50 transactions');
  const lines = rows.map((row) => {
    const net = amount(row.netAmount, 'net amount');
    const cash = row.cashDelta;
    const bank = row.bankDelta;
    if ((cash === undefined) !== (bank === undefined)) {
      throw new Error('wallet pocket projection is incomplete');
    }
    if (cash !== undefined && bank !== undefined) {
      amount(cash, 'cash pocket amount');
      amount(bank, 'bank pocket amount');
      if (BigInt(cash) + BigInt(bank) !== BigInt(net)) {
        throw new Error('wallet pocket projection does not match owner net amount');
      }
    }
    const date = new Date(row.occurredAt);
    if (Number.isNaN(date.valueOf())) throw new Error('wallet transaction timestamp is invalid');
    return [
      'recent 50 max', date.toISOString(), row.transactionId, row.type,
      row.label, row.direction, net, cash ?? 'Unavailable', bank ?? 'Unavailable',
    ].map(cell).join(',');
  });
  return '\uFEFF' + [HEADERS.map(cell).join(','), ...lines].join('\r\n');
}
