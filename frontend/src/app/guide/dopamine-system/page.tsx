import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, Shield, Flame, Trophy, Crown, Gavel, Landmark, ChevronRight, CheckCircle2 } from 'lucide-react';
import { canonicalUrl, buildOgImageUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: '도파민 보상 루프 & 지속 가능한 수익화 시스템 가이드 — 월덕 머니버스',
  description:
    'Brawl Stars 스타 드롭, Polymarket 예측 마켓, Duolingo 스트릭 내기, Cookie Clicker 프레스티지 환생 등 10대 글로벌 레퍼런스 기반 가상 경제 도파민 시스템 및 확률 가이드.',
  alternates: { canonical: canonicalUrl('/guide/dopamine-system') },
  openGraph: {
    title: '도파민 보상 루프 & 지속 가능한 수익화 시스템 가이드',
    description:
      '10대 글로벌 레퍼런스 기반 가상 경제 도파민 시스템 및 확률 가이드. 100% 가상 시뮬레이터 현금 환전 불가.',
    url: canonicalUrl('/guide/dopamine-system'),
  },
};

export default function DopamineSystemGuidePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: '월덕 머니버스 도파민 보상 루프 및 지속 가능한 수익화 가이드',
    description:
      '글로벌 탑티어 10대 레퍼런스를 결합한 가상 경제 도파민 보상 시스템과 공정 확률 안내.',
    publisher: {
      '@type': 'Organization',
      name: 'Woldeok Moneyverse',
      url: 'https://easy-scraping.com',
    },
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-4xl space-y-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-amber-400">홈</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/guide" className="hover:text-amber-400">가이드</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-200">도파민 시스템 안내</span>
        </nav>

        {/* Title Header */}
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <Sparkles className="h-6 w-6" />
            </span>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              도파민 보상 루프 & 공정 확률 가이드
            </h1>
          </div>
          <p className="mt-2 text-xs text-slate-400 sm:text-sm leading-relaxed">
            월덕 머니버스는 10대 글로벌 레퍼런스의 검증된 도파민 피드백 루프와 디플레이션 경제 모델을 결합하여 지적 즐거움과 성취감을 제공합니다.
          </p>
        </div>

        {/* Mandatory Legal & Compliance Banner */}
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
            <Shield className="h-5 w-5" />
            <span>100% 가상 시뮬레이터 및 사행성 방지 법적 고지</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            월덕 머니버스 내에서 획득하는 모든 WLD 통화, 주식, 아이템, 유물은 가상 데이터로 현금 환전 및 외부 실제 재화와의 매매가 일체 불가합니다. 본 서비스는 2024년 개정 게임산업진흥에 관한 법률 제33조를 준수하여 확률형 아이템의 모든 획득 확률을 투명하게 공개합니다.
          </p>
        </div>

        {/* 6 Core Systems */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2">
            6대 도파민 피드백 시스템 안내
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* 1. Star Drop */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Sparkles className="h-4 w-4" />
                <span>1. Brawl Stars형 스타 드롭 (5연속 탭)</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                상자를 탭할 때마다 60% 확률로 희귀 ➡️ 초희귀 ➡️ 에픽 ➡️ 신화 ➡️ 전설로 등급이 승급되는 손맛 연출.
              </p>
            </div>

            {/* 2. Prediction */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                <Trophy className="h-4 w-4" />
                <span>2. Polymarket형 경제 예측 마켓</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                운이 아닌 지식과 분석으로 Yes/No 바이너리 지분을 거래하고 체결 시 2% 플랫폼 수수료 소각.
              </p>
            </div>

            {/* 3. Streak Wager */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-500 font-bold text-xs">
                <Flame className="h-4 w-4" />
                <span>3. Duolingo형 7일 스트릭 내기</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                7일 연속 출석 시 200% 즉시 배당 지급 및 10인 주간 승강 리그전.
              </p>
            </div>

            {/* 4. Prestige */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                <Crown className="h-4 w-4" />
                <span>4. Cookie Clicker형 프레스티지(환생)</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                자산 명예 소각을 통해 영구 생산력 배수(x2~x50)와 고대 유물 슬롯을 해금하는 엔드게임.
              </p>
            </div>

            {/* 5. Auction */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Gavel className="h-4 w-4" />
                <span>5. Steam형 P2P 아티팩트 경매장</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                한정판 테마·뱃지·칭호 실시간 호가 경매 및 거래 대금 5% 플랫폼 자동 소각.
              </p>
            </div>

            {/* 6. Co-Saving */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-xs">
                <Landmark className="h-4 w-4" />
                <span>6. Toss형 4인 공동 저축 팟</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                4명이 모여 7일간 완주 시 +5% 보너스 금리 및 황금 상자 잭팟 수령.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="border-t border-slate-800 pt-6 flex flex-wrap gap-3">
          <Link
            href="/prediction"
            className="rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow hover:bg-amber-400"
          >
            실시간 예측 마켓 바로가기
          </Link>
          <Link
            href="/marketplace/auction"
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700"
          >
            P2P 아티팩트 경매장 바로가기
          </Link>
        </div>
      </div>
    </div>
  );
}
