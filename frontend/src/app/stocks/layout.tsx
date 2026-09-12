import type { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getServerLocale } from '@/lib/locale-server';

export default async function StocksLayout({ children }: { readonly children: ReactNode }) {
  const locale = await getServerLocale();
  const isEn = locale === 'en';

  return (
    <div className="grid gap-4">
      <nav aria-label={isEn ? 'Virtual stock tools' : '가상 주식 도구'} className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm"><Link href="/stocks">{isEn ? 'Market' : '거래소'}</Link></Button>
        <Button asChild variant="outline" size="sm"><Link href="/stocks/compare">{isEn ? 'Compare stocks' : '종목 비교'}</Link></Button>
        <Button asChild variant="outline" size="sm"><Link href="/stocks/alerts">{isEn ? 'Alerts' : '조건부 알림'}</Link></Button>
      </nav>
      {children}
    </div>
  );
}
