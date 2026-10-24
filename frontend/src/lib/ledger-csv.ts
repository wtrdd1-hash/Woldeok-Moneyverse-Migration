import { isCanonicalWld, pocketBreakdown, type TransactionView } from '@/app/wallet/sides';

const headersEn = [
  'Date', 'Transaction ID', 'Direction', 'Description', 'Amount (WLD)',
  'Cash delta (WLD)', 'Bank delta (WLD)',
];
const headersKo = [
  '일시', '거래ID', '구분', '내역', '금액(WLD)',
  '현금 증감(WLD)', '은행 증감(WLD)',
];

/** CSV is a spreadsheet input, not a trusted data channel. */
function csvCell(value: string): string {
  const normalized = value.replace(/\p{Cc}+/gu, ' ').trim();
  const safe = /^[=+\-@]/.test(normalized) && !isCanonicalWld(normalized)
    ? `'${normalized}`
    : normalized;
  return `"${safe.replace(/"/g, '""')}"`;
}

function signedAmount(value: string): string {
  if (!isCanonicalWld(value)) throw new Error('Noncanonical WLD amount');
  return value;
}

/**
 * The wallet API returns at most the requested recent rows, not a complete
 * ledger. Missing owner-scoped pocket projections are unavailable, never zero.
 */
export function ledgerCsvContent(
  transactions: readonly TransactionView[],
  isEn: boolean,
): string {
  const headers = isEn ? headersEn : headersKo;
  const rows = transactions.map((t) => {
    const pockets = pocketBreakdown(t);
    const timestamp = new Date(t.occurredAt);
    const direction = t.direction === 'in'
      ? (isEn ? 'Deposit' : '입금')
      : t.direction === 'out'
        ? (isEn ? 'Withdraw' : '출금')
        : (isEn ? 'Transfer' : '이체');
    return [
      Number.isNaN(timestamp.valueOf()) ? 'Unavailable' : timestamp.toISOString(),
      t.transactionId,
      direction,
      t.label,
      signedAmount(t.netAmount),
      pockets?.cashDelta ?? 'Unavailable',
      pockets?.bankDelta ?? 'Unavailable',
    ].map(csvCell).join(',');
  });
  return '\uFEFF' + [headers.map(csvCell).join(','), ...rows].join('\r\n');
}

