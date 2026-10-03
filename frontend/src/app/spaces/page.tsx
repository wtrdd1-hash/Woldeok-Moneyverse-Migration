import { Metadata } from 'next';
import { Sparkles, Home, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getServerLocale } from '@/lib/locale-server';
import { lookupText } from '@/lib/i18n-dictionary';
import { PersonalSpacesView } from '@/components/personal-spaces-view';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const title = lookupText('가상 부동산 & 개인 공간 (Personal Spaces)', locale);
  const desc = lookupText(
    '머니버스 8대 메가시티 가상 부동산 분양 및 7대 개인 룸 인테리어 쇼룸. 실시간 부동산 임대료 수익 정산과 공간 확장을 경험하세요.',
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

export default async function PersonalSpacesPage() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-amber-500/50 bg-amber-500/10 text-amber-500 text-xs font-bold flex items-center gap-1">
            <Sparkles className="size-3.5" />
            <span>가상 부동산 분양 & 개인 공간 시스템</span>
          </Badge>
          <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center gap-1">
            <ShieldCheck className="size-3.5" />
            <span>공인 소유권 등기 원장 연동</span>
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
          <Home className="size-7 text-amber-500" />
          <span>개인 공간 & 메가시티 랜드 (Personal Spaces)</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed [word-break:keep-all]">
          7대 개인 공간(스타터 룸부터 불멸의 레거시 홀까지)과 8대 도시 구역 랜드마크를 소유하세요.
          공간 인테리어 확장 및 리모델링에 따라 매초 실시간 가상 부동산 임대료(Rent Yield)가 누적됩니다.
        </p>
      </div>

      <PersonalSpacesView />
    </div>
  );
}
