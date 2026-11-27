'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/components/locale-provider';
import { pick } from '@/lib/copy';
import type { Locale } from '@/lib/locale';
import { COPY } from './copy';
import { isCanonicalWld, pocketBreakdown, type TransactionView } from './sides';

const HEADERS = [
  COPY.csvDate, COPY.csvTransactionId, COPY.csvDirection, COPY.csvDescription, COPY.csvAmount,
  COPY.csvCashDelta, COPY.csvBankDelta,
] as const;

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
  locale: Locale,
): string {
  const headers = HEADERS.map((copy) => pick(locale, copy));
  const rows = transactions.map((t) => {
    const pockets = pocketBreakdown(t);
    const timestamp = new Date(t.occurredAt);
    const direction = pick(
      locale,
      t.direction === 'in' ? COPY.csvDeposit : t.direction === 'out' ? COPY.csvWithdraw : COPY.csvTransfer,
    );
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

  const exportCsv = () => {
    if (transactions.length === 0) return;
    const csvContent = ledgerCsvContent(transactions, locale);
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
      <span>{pick(locale, COPY.exportCsv)}</span>
    </Button>
  );
}
