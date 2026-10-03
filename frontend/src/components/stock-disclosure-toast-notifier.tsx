'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Megaphone, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { CORPORATE_DISCLOSURES, type CorporateDisclosure } from '@/config/stock-disclosures.config';
import { useLocale } from '@/components/locale-provider';

interface StockDisclosureToastNotifierProps {
  readonly onSelectDisclosure?: (disclosure: CorporateDisclosure) => void;
}

export function StockDisclosureToastNotifier({ onSelectDisclosure }: StockDisclosureToastNotifierProps) {
  const { locale } = useLocale();
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;

    // 1.8초 뒤 첫 번째 중요 속보 토스트 알림 브로드캐스트
    const timer = setTimeout(() => {
      const topNews = CORPORATE_DISCLOSURES[0];
      if (!topNews) return;

      const isPositive = topNews.impactDirection === 'up';

      toast.custom(
        (t) => (
          <div className="flex w-full max-w-md items-start gap-3 rounded-xl border border-primary/20 bg-background/95 p-4 shadow-xl backdrop-blur-md dark:bg-card/95">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                isPositive
                  ? 'bg-rose-500/10 text-rose-500 dark:bg-rose-950/40'
                  : 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-950/40'
              }`}
            >
              {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold text-muted-foreground">
                  <Megaphone className="h-3 w-3 text-primary" />
                  {topNews.symbol}
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {locale === 'en' ? 'Live Disclosure' : locale === 'ja' ? '適時開示速報' : locale === 'zh' ? '实时公告速报' : '실시간 기업공시'}
                </span>
                <span
                  className={`ml-auto font-mono text-xs font-bold ${
                    isPositive ? 'text-rose-500' : 'text-emerald-500'
                  }`}
                >
                  {topNews.expectedImpactPct}
                </span>
              </div>
              <p className="text-xs font-semibold text-foreground line-clamp-1">{topNews.title}</p>
              <p className="text-[11px] text-muted-foreground line-clamp-1">{topNews.summary}</p>
              {onSelectDisclosure && (
                <div className="pt-1">
                  <button
                    onClick={() => {
                      toast.dismiss(t);
                      onSelectDisclosure(topNews);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                  >
                    <span>
                      {locale === 'en' ? 'View Details' : locale === 'ja' ? '詳細を見る' : locale === 'zh' ? '查看详情' : '공시 전문 확인'}
                    </span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ),
        {
          duration: 6000,
          position: 'top-right',
        }
      );
    }, 1800);

    return () => clearTimeout(timer);
  }, [locale, onSelectDisclosure]);

  return null;
}
