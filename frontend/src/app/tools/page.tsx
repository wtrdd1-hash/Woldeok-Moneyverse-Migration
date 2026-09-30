import type { Metadata } from 'next';
import Link from 'next/link';
import { Calculator, TrendingUp, Landmark, Sparkles, ArrowRight, ShieldCheck, HelpCircle, Target, Coins } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { DailyAttendanceRoulette } from '@/components/retention/daily-attendance-roulette';
import { DailyPredictionBattle } from '@/components/retention/daily-prediction-battle';
import { ReferralSystem } from '@/components/viral/referral-system';
import { PublicAdvertisement } from '@/components/public-advertisement';

export const metadata: Metadata = {
  title: '금융 & 시뮬레이터 웹 도구 허브 (5대 계산기) | 월덕 머니버스',
  description:
    '설치 없이 브라우저에서 바로 사용하는 5대 금융 계산기: 복리 예금·적금 이자, 주식 물타기·평단가, 목표 자산·FIRE 은퇴 시뮬레이터, 2026 가상자산 22% 세금 계산기, 직업 파밍 루틴을 100% 무료로 이용하세요.',
  keywords: [
    '금융 계산기',
    '복리 계산기',
    '적금 이자 계산기',
    '주식 물타기 계산기',
    '평단가 계산기',
    'FIRE 계산기',
    '은퇴 자금 계산기',
    '가상자산 세금 계산기',
    '코인 양도소득세',
    '가상경제 시뮬레이터',
    '앱테크 파밍 계산기',
  ],
  alternates: {
    canonical: '/tools',
  },
};

const TOOLS = [
  {
    id: 'compound-calculator',
    title: '복리 예금·적금 이자 계산기',
    badge: '인기 1위',
    badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    description: '일 복리, 월 복리, 연 복리 수익을 시뮬레이션하고 만기 수령액과 단리 대비 복리 초과분을 역산합니다.',
    href: '/tools/compound-calculator',
    icon: Landmark,
    iconColor: 'text-amber-500 bg-amber-500/10',
    features: ['일/월/연 복리 비교', '목표액 도달 기간 역산', '이자 소득 시뮬레이션', '가상 은행 5~15% 금리 프리셋'],
  },
  {
    id: 'stock-calculator',
    title: '주식 물타기·평단가 & 수익률 계산기',
    badge: '실전 트레이딩',
    badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
    description: '추가 매수 시 실시간으로 변하는 평단가를 계산하고, 목표 수익률 도달을 위한 매도가를 정밀 산출합니다.',
    href: '/tools/stock-calculator',
    icon: TrendingUp,
    iconColor: 'text-emerald-500 bg-emerald-500/10',
    features: ['추가 매수 물타기 평단가', '목표 수익률 역산 매도가', '10대 가상 종목 실시간 연동', '수수료/세금 공제 계산'],
  },
  {
    id: 'goal-wealth-calculator',
    title: '목표 자산·은퇴·FIRE 달성 계산기',
    badge: '신규 오픈',
    badgeColor: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
    description: '월 저축액과 투자 수익률, 인플레이션을 반영하여 목표 자산 도달 시점과 4% 룰 안전 은퇴 생활비를 계산합니다.',
    href: '/tools/goal-wealth-calculator',
    icon: Target,
    iconColor: 'text-purple-500 bg-purple-500/10',
    features: ['목표 자산 도달 기간 역산', '트리니티 4% 룰 안전 인출액', '은퇴 자금 수명 시뮬레이션', '사회초년생/FIRE족 프리셋'],
  },
  {
    id: 'tax-calculator',
    title: '가상자산·금융투자 세금 계산기',
    badge: '2026 세법',
    badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    description: '가상자산 22% 양도소득세, 해외주식 기본공제 250만 원, 배당소득 15.4% 및 건보료 피부양자 영향을 정밀 계산합니다.',
    href: '/tools/tax-calculator',
    icon: Coins,
    iconColor: 'text-blue-500 bg-blue-500/10',
    features: ['가상자산 22% 단일세율', '손익 통산 및 기본공제 공제', '배당소득 2천만 원 초과 경고', '실전 합법 절세 가이드'],
  },
  {
    id: 'farming-calculator',
    title: '직업별 일일 파밍 수익 시뮬레이터',
    badge: '최적 루틴',
    badgeColor: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
    description: '5대 전문 직업(개발자, 트레이더, 광부, 요리사, 보안관) 숙련도 레벨별 일일 WLD 기대 수익을 계산합니다.',
    href: '/tools/farming-calculator',
    icon: Calculator,
    iconColor: 'text-rose-500 bg-rose-500/10',
    features: ['직업별 숙련도 수익 곡선', '퀘스트/출석 복리 결합', '30일/1년 누적 자산 예측', '최적 업무 분배 가이드'],
  },
];

export default function ToolsHubPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '월덕 머니버스 금융 & 시뮬레이터 5대 도구 허브',
    description: '설치 없이 바로 사용하는 5대 금융 웹 계산기 및 가상경제 시뮬레이터 모음',
    url: 'https://easy-scraping.com/tools',
    hasPart: TOOLS.map((t) => ({
      '@type': 'WebApplication',
      name: t.title,
      description: t.description,
      url: `https://easy-scraping.com${t.href}`,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
    })),
  };

  return (
    <div className="container max-w-5xl py-8 space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header Banner */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-500">
          <Sparkles className="size-3.5" />
          <span>100% 무료 · 무설치 5대 금융 웹 툴킷</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          금융 & 시뮬레이터 웹 도구 허브
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          복리 예금, 주식 평단가, 은퇴 FIRE 목표 자산, 가상자산 22% 세금, 직업 파밍 기대 수익까지 — 복잡한 금융 수식을 브라우저에서 몇 번의 입력만으로 실시간 시각화하세요.
        </p>
      </div>

      {/* Tool Cards Grid (5-Tools Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card key={tool.id} className="relative flex flex-col justify-between overflow-hidden border-border/80 bg-card/60 backdrop-blur-sm transition-all hover:border-amber-500/50 hover:shadow-lg">
              <CardHeader className="space-y-3 pb-4">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl ${tool.iconColor}`}>
                    <Icon className="size-5" />
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${tool.badgeColor}`}>
                    {tool.badge}
                  </span>
                </div>
                <CardTitle className="text-base sm:text-lg font-bold">{tool.title}</CardTitle>
                <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {tool.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <div className="size-1 rounded-full bg-amber-500" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={tool.href}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>계산기 바로 시작</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Public Advertisement Slot */}
      <PublicAdvertisement />

      {/* Daily Retention: Attendance & Lucky Roulette */}
      <div className="space-y-6">
        <DailyAttendanceRoulette />
      </div>

      {/* Daily Retention: UP / DOWN Prediction Battle */}
      <div className="space-y-6">
        <DailyPredictionBattle />
      </div>

      {/* Viral Referral System */}
      <div className="space-y-6">
        <ReferralSystem />
      </div>

      {/* FAQ & Guide Section for SEO Richness */}
      <div className="rounded-2xl border border-border/70 bg-muted/20 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-foreground font-bold text-base">
          <HelpCircle className="size-5 text-amber-500" />
          <span>자주 묻는 질문 (FAQ)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div className="space-y-1.5">
            <p className="font-semibold text-foreground">Q. 로그인이 필요한가요?</p>
            <p className="leading-relaxed">아닙니다. 5대 계산 도구는 비회원 및 게스트 사용자도 제한 없이 무료로 즉시 사용할 수 있습니다.</p>
          </div>
          <div className="space-y-1.5">
            <p className="font-semibold text-foreground">Q. 가상경제 WLD 수치와 현실 통화 계산이 호환되나요?</p>
            <p className="leading-relaxed">네, 원화(KRW) 및 WLD 단위 모두 자유롭게 입력하여 이자율, 목표 자산, 주식 수익률, 양도소득세를 직관적으로 시뮬레이션할 수 있습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
