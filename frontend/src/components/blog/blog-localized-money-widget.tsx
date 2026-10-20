'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { MONEY_COUNTRIES, formatCountryMoney, moneyCountryForLocale } from '@/lib/country-money';

type Locale = 'ko' | 'en' | 'ja' | 'zh';
const COPY = {
  ko: {title:'복리 예시 계산기', amount:'초기 원금', rate:'가정한 연이율', years:'적립 기간(년)', result:'예상 만기 금액', details:'예시 계산이며 확정 수익이 아닙니다.', more:'계산기에서 자세히 보기'},
  en: {title:'Compound interest example',amount:'Starting balance',rate:'Assumed annual rate',years:'Number of years',result:'Estimated ending balance',details:'Illustrative calculation, not a guaranteed return.',more:'Open full calculator'},
  ja: {title:'複利の試算',amount:'当初の元金',rate:'想定年利',years:'運用年数',result:'想定される最終金額',details:'計算例であり、将来の利益を保証するものではありません。',more:'計算ツールを開く'},
  zh: {title:'复利收益试算',amount:'初始本金',rate:'假设年利率',years:'计算年数',result:'预计期末金额',details:'仅为示例计算，不保证实际收益。',more:'打开完整计算器'},
} as const;

export function BlogLocalizedMoneyWidget({locale,href}:{locale:Locale;href:string}) {
  const t=COPY[locale];
  const country=moneyCountryForLocale(locale);
  const [amount,setAmount]=useState<number>(MONEY_COUNTRIES[country].principal / 10);
  const [rate,setRate]=useState(4);
  const [years,setYears]=useState(10);
  const result=useMemo(()=>amount*Math.pow(1+rate/100,years),[amount,rate,years]);
  return (
    <section aria-label={t.title} className="my-8 rounded-xl border border-border bg-card p-5 space-y-4">
      <h2 className="text-lg font-semibold">{t.title} ({MONEY_COUNTRIES[country].currency})</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1 text-sm">{t.amount}
          <input type="number" value={amount} min={1} max={1e12} step={100}
            onChange={e=>setAmount(Math.max(0,Number(e.currentTarget.value)))}
            className="min-w-0 rounded-lg border border-border bg-background p-2" />
        </label>
        <label className="grid gap-1 text-sm">{t.rate} (%)
          <input type="number" value={rate} min={0} max={30} step={0.1}
            onChange={e=>setRate(Math.min(30,Math.max(0,Number(e.currentTarget.value))))}
            className="min-w-0 rounded-lg border border-border bg-background p-2" />
        </label>
        <label className="grid gap-1 text-sm">{t.years}
          <input type="number" value={years} min={1} max={50} step={1}
            onChange={e=>setYears(Math.min(50,Math.max(1,Number(e.currentTarget.value))))}
            className="min-w-0 rounded-lg border border-border bg-background p-2" />
        </label>
      </div>
      <p aria-live="polite" className="font-semibold">{t.result}: {Number.isFinite(result) ? formatCountryMoney(result,country) : '—'}</p>
      <p className="text-xs text-muted-foreground">{t.details}</p>
      <Link href={href} className="text-sm font-semibold text-primary underline underline-offset-4">{t.more}</Link>
    </section>
  );
}
