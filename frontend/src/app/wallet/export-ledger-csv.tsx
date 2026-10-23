'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/components/locale-provider';
import { isCanonicalWld, pocketBreakdown, type TransactionView } from './sides';

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

export function ExportLedgerCsvButton({
  transactions,
}: {
  readonly transactions: readonly TransactionView[];
}) {
  const { locale } = useLocale();
  const isEn = locale === 'en';

  const exportCsv = () => {
    if (transactions.length === 0) return;
    const csvContent = ledgerCsvContent(transactions, isEn);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moneyverse-ledger-recent-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={exportCsv}
      disabled={transactions.length === 0}
      className="min-h-9 flex items-center gap-1.5 text-xs"
    >
      <Download className="size-3.5" aria-hidden />
      <span>{isEn ? 'Export recent CSV' : '최근 거래 CSV 다운로드'}</span>
    </Button>
  );
}
