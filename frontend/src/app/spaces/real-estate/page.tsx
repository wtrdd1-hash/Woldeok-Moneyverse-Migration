import type { Metadata } from 'next';
import { Building2, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getServerLocale } from '@/lib/locale-server';
import { lookupText } from '@/lib/i18n-dictionary';
import { PersonalSpacesView } from '@/components/personal-spaces-view';
import { RealEstateAuctionClient } from './real-estate-auction-client';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const title = lookupText('가상 부동산 메가시티 랜드마크 경매 & 월세 배당 거래소', locale);
  const desc = lookupText(
    '강남, 여의도, 판교, 한남 등 머니버스 4대 프라임 랜드마크 지분 경매에 참여하고 일일 임대료 월세 배당을 실시간으로 수령하세요.',
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
    <div className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-indigo-500/50 bg-indigo-500/10 text-indigo-500 text-xs font-bold flex items-center gap-1">
            <Sparkles className="size-3.5" />
            <span>메가시티 랜드마크 경매</span>
          </Badge>
          <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center gap-1">
            <ShieldCheck className="size-3.5" />
            <span>실시간 임대료 원자적 배당</span>
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
          <Building2 className="size-7 text-indigo-500" />
          <span>가상 부동산 메가시티 랜드 (Virtual Real Estate & Auctions)</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed [word-break:keep-all]">
          4대 핵심 프라임 랜드마크 지분 경매에 참여하여 건물주가 되고, 상권 거래량에 비례하여 적립되는 일일 임대료(월세)를 실시간으로 수령하세요.
        </p>
      </div>

      {/* 랜드마크 경매 & 월세 배당 인터랙티브 클라이언트 */}
      <RealEstateAuctionClient />

      <hr className="border-border/40" />

      {/* 개인 공간 및 토지 분양 관리 뷰 */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">내 개인 스페이스 & 랜드 분양 포트폴리오</h2>
        <PersonalSpacesView />
      </div>
    </div>
  );
}
