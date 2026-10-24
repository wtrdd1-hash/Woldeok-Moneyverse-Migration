import type { Metadata } from 'next';
import { Building2, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getServerLocale } from '@/lib/locale-server';
import { lookupText } from '@/lib/i18n-dictionary';
import { VerifiedSpacesLoader } from '../verified-spaces-loader';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const title = lookupText('가상 부동산 경매 중단 · 실제 소유 공간 조회', locale);
  const desc = lookupText(
    '랜드마크 경매와 월세 수령은 검증된 금융 원장 연동 전까지 중단됩니다. 실제 소유 공간 기록만 조회할 수 있습니다.',
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

export default async function RealEstatePage() {
  const verifiedSpaces = await VerifiedSpacesLoader();
  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-indigo-500/50 bg-indigo-500/10 text-indigo-500 text-xs font-bold flex items-center gap-1">
            <Sparkles className="size-3.5" />
            <span>메가시티 랜드마크 경매</span>
          </Badge>
          <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center gap-1">
            <ShieldCheck className="size-3.5" />
            <span>미검증 금융 기능 중단</span>
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
          <Building2 className="size-7 text-indigo-500" />
          <span>실제 소유 공간 및 경매 서비스 상태</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed [word-break:keep-all]">
          경매 및 월세 지급 기능은 중단되었습니다. 실제 PostgreSQL 소유 기록만 확인할 수 있습니다.
        </p>
      </div>

      <div role="status" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
        경매 및 월세 지급 기능은 중단되었습니다. 원장 기반 입찰·배당 영수증이 검증되기 전에는 WLD를 차감하거나 지급했다고 표시하지 않습니다.
      </div>

      <hr className="border-border/40" />

      {/* 개인 공간 및 토지 분양 관리 뷰 */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">내 실제 소유 공간 조회</h2>
        {verifiedSpaces}
      </div>
    </div>
  );
}
