'use client';

import Link from 'next/link';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/components/locale-provider';

export { ledgerCsvContent } from '@/lib/ledger-csv';

export function ExportLedgerCsvButton() {
  const { locale } = useLocale();
  const isEn = locale === 'en';
  return (
    <Button asChild variant="outline" size="sm" className="min-h-9 text-xs">
      <Link href={'/api/wallet/export?lang=' + (isEn ? 'en' : 'ko')} prefetch={false}>
        <Download className="size-3.5" aria-hidden />
        <span>{isEn ? 'Download verified recent CSV (50 max)' : '검증된 최근 거래 CSV 다운로드 (최대 50건)'}</span>
      </Link>
    </Button>
  );
}
