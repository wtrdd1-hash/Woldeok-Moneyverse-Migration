import type { Metadata } from 'next';
import { Bot, Sparkles, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getServerLocale } from '@/lib/locale-server';
import { lookupText } from '@/lib/i18n-dictionary';
import { AdvisorClient } from './advisor-client';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const title = lookupText('AI 금융 어드바이저 덕이 — 포트폴리오 진단 & 리밸런싱', locale);
  const desc = lookupText(
    '가상 주식, 부동산 지분, 대한민국 국채, 예금 자산을 AI가 실시간 종합 분석하여 건전성 점수와 맞춤형 리밸런싱 전략을 제시합니다.',
    locale
  );

  return {
    title: `${title} | Woldeok Moneyverse`,
    description: desc,
    openGraph: {
      title,
      description: desc,
      type: 'website',
    },
  };
}

export default async function AdvisorPage() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-indigo-500/50 bg-indigo-500/10 text-indigo-500 text-xs font-bold flex items-center gap-1">
            <Bot className="size-3.5" />
            <span>AI 금융 비서</span>
          </Badge>
          <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center gap-1">
            <ShieldCheck className="size-3.5" />
            <span>샤프 지수 1.84 포트폴리오</span>
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
          <Sparkles className="size-7 text-indigo-500" />
          <span>AI 금융 어드바이저 '덕이' (Portfolio AI)</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed [word-break:keep-all]">
          보유 자산 배분 비중, 샤프 지수, 최대 낙폭(MDD)을 실시간 분석하고, 덕이와의 1:1 대화를 통해 최적의 리밸런싱 전략을 도출하세요.
        </p>
      </div>

      <AdvisorClient />
    </div>
  );
}
