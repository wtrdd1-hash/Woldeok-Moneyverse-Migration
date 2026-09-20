'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/components/locale-provider';
import type { TransactionView } from './sides';

export function ExportLedgerCsvButton({
  transactions,
}: {
  readonly transactions: readonly TransactionView[];
}) {
  const { locale } = useLocale();
  const isEn = locale === 'en';

  const exportCsv = () => {
    if (transactions.length === 0) return;

    const headers = isEn
      ? ['Date', 'Transaction ID', 'Direction', 'Description', 'Amount (WLD)']
      : ['일시', '거래ID', '구분', '내역', '금액(WLD)'];

    const rows = transactions.map((t) => [
      new Date(t.occurredAt).toISOString(),
      t.transactionId,
      t.direction === 'in' ? (isEn ? 'Deposit' : '입금') : t.direction === 'out' ? (isEn ? 'Withdraw' : '출금') : (isEn ? 'Transfer' : '이체'),
      `"${t.label.replace(/"/g, '""')}"`,
      `${t.direction === 'out' ? '-' : '+'}${t.netAmount}`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moneyverse-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
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
      <span>{isEn ? 'Export CSV' : 'CSV 장부 다운로드'}</span>
    </Button>
  );
}
