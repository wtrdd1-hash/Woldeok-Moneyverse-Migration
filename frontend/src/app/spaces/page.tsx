import type { Metadata } from 'next';
import { Sparkles, Home, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getServerLocale } from '@/lib/locale-server';
import { lookupText } from '@/lib/i18n-dictionary';
import { VerifiedSpacesLoader } from './verified-spaces-loader';
import { PublicAdvertisement } from '@/components/public-advertisement';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const title = lookupText('실제 소유 공간 조회 (Personal Spaces)', locale);
  const desc = lookupText(
    '회원별 실제 개인 공간 소유 기록을 확인합니다. 미검증 분양 및 임대료 정산 기능은 중단되어 있습니다.',
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

export default async function PersonalSpacesPage() {
  const verifiedSpaces = await VerifiedSpacesLoader();
  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-amber-500/50 bg-amber-500/10 text-amber-500 text-xs font-bold flex items-center gap-1">
            <Sparkles className="size-3.5" />
            <span>회원별 소유 공간 조회</span>
          </Badge>
          <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center gap-1">
            <ShieldCheck className="size-3.5" />
            <span>회원별 소유권 조회</span>
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
          <Home className="size-7 text-amber-500" />
          <span>내 실제 소유 공간 (Personal Spaces)</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed [word-break:keep-all]">
          회원별 실제 공간 기록을 확인할 수 있습니다. 미검증 부동산 매입·임대료 수령은 지원하지 않습니다.
        </p>
      </div>

      {verifiedSpaces}

      {/* 스폰서드 디스플레이 광고 */}
      <PublicAdvertisement className="my-6" />
    </div>
  );
}
