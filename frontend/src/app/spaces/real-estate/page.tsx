import { Metadata } from 'next';
import { Building2, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getServerLocale } from '@/lib/locale-server';
import { lookupText } from '@/lib/i18n-dictionary';
import { PersonalSpacesView } from '@/components/personal-spaces-view';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const title = lookupText('가상 부동산 메가시티 랜드 분양 거래소', locale);
  const desc = lookupText(
    '강남, 여의도, 판교, 한남 등 머니버스 8대 메가시티 도시 구역의 토지 랜드 분양 및 가상 부동산 임대 포트폴리오를 관리하세요.',
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

export default async function RealEstatePage() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-indigo-500/50 bg-indigo-500/10 text-indigo-500 text-xs font-bold flex items-center gap-1">
            <Sparkles className="size-3.5" />
            <span>메가시티 랜드마크 분양</span>
          </Badge>
          <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center gap-1">
            <ShieldCheck className="size-3.5" />
            <span>실시간 임대료 원자적 배당</span>
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
          <Building2 className="size-7 text-indigo-500" />
          <span>가상 부동산 메가시티 랜드 (Virtual Real Estate)</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed [word-break:keep-all]">
          8대 핵심 도시 구역의 토지 및 프라임 빌딩을 소유하고, 구역별 프리미엄 임대 수익률 배당을 실시간으로 수령하세요.
        </p>
      </div>

      <PersonalSpacesView />
    </div>
  );
}
