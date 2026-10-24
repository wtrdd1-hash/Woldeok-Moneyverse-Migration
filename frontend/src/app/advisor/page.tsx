import type { Metadata } from 'next';
import { Bot, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { requireMember } from '@/lib/session';
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
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description: desc,
      type: 'website',
    },
  };
}

export default async function AdvisorPage() {
  await requireMember();
  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-indigo-500/50 bg-indigo-500/10 text-indigo-500 text-xs font-bold flex items-center gap-1">
            <Bot className="size-3.5" />
            <span>AI 금융 비서</span>
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
          <Sparkles className="size-7 text-indigo-500" />
          <span>AI 금융 어드바이저 '덕이' (Portfolio AI)</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed [word-break:keep-all]">
          로그인한 회원의 서버 진단 결과와 가상 자산 관련 상담을 확인할 수 있습니다. 실제 거래 체결은 지원하지 않습니다.
        </p>
      </div>

      <AdvisorClient />
    </div>
  );
}
