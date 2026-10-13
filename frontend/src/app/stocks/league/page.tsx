import type { Metadata } from 'next';
import { Trophy, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getServerLocale } from '@/lib/locale-server';
import { lookupText } from '@/lib/i18n-dictionary';
import { StocksLeagueClient } from './stocks-league-client';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const title = lookupText('가상 주식 실시간 카피 트레이딩 리그 & 고래 리더보드', locale);
  const desc = lookupText(
    '상위 1위 수익률 +184% 고래 트레이더들의 실시간 매매 내역을 투명하게 확인하고 원클릭으로 1:1 자동 추종 카피 트레이딩을 시작하세요.',
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

export default async function StocksLeaguePage() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-amber-500/50 bg-amber-500/10 text-amber-500 text-xs font-bold flex items-center gap-1">
            <Trophy className="size-3.5" />
            <span>고래 챔피언십 리그</span>
          </Badge>
          <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center gap-1">
            <Sparkles className="size-3.5" />
            <span>원클릭 1:1 자동 카피 트레이딩</span>
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
          <TrendingUp className="size-7 text-indigo-500" />
          <span>가상 주식 카피 트레이딩 리그 (Whale League)</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed [word-break:keep-all]">
          검증된 상위 고래 트레이더들의 포트폴리오와 실시간 체결을 추종하세요. 수익 실현 시에만 1%의 성공 보수가 기여금으로 정산됩니다.
        </p>
      </div>

      <StocksLeagueClient />
    </div>
  );
}
