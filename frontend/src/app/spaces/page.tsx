import type { Metadata } from 'next';
import { Sparkles, Home, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getServerLocale } from '@/lib/locale-server';
import { lookupText } from '@/lib/i18n-dictionary';
import { PersonalSpacesView } from '@/components/personal-spaces-view';
import { PublicAdvertisement } from '@/components/public-advertisement';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const title = lookupText('가상 부동산 & 개인 공간 (Personal Spaces)', locale);
  const desc = lookupText(
    '인증된 서버의 개인 공간 보유 내역을 조회합니다. 가상 부동산 거래와 임대료 정산은 검증 전까지 중단됩니다.',
    locale
  );

  return {
    title: `${title} | Woldeok Moneyverse`,
    robots: { index: false, follow: false },
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
            <ShieldAlert className="size-3.5" />
            <span>인증된 서버 조회 전용</span>
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
          <Home className="size-7 text-amber-500" />
          <span>개인 공간 & 메가시티 랜드 (Personal Spaces)</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed [word-break:keep-all]">
          서버에서 확인된 회원별 공간만 표시합니다. 브라우저 저장 데이터는 실제 소유권이 아닙니다.
          임대료 수령과 WLD 차감 기능은 검증된 금융 원장 계약이 마련될 때까지 제공하지 않습니다.
        </p>
      </div>

      <PersonalSpacesView />

      {/* 스폰서드 디스플레이 광고 */}
      <PublicAdvertisement className="my-6" />
    </div>
  );
}
