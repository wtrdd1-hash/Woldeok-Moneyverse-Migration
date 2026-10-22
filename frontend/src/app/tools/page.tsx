import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Calculator,
  TrendingUp,
  Landmark,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Target,
  Coins,
  Flame,
  PieChart,
  Percent,
  Banknote,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DailyAttendanceRoulette } from '@/components/retention/daily-attendance-roulette';
import { DailyPredictionBattle } from '@/components/retention/daily-prediction-battle';
import { ReferralSystem } from '@/components/viral/referral-system';
import { PublicAdvertisement } from '@/components/public-advertisement';
import { PublicSitemapSubmitBox } from '@/components/public-sitemap-submit-box';
import { NationalTreasuryBalanceSimulator } from '@/components/economy/national-treasury-balance-simulator';
import { MegaJackpotLotteryDashboard } from '@/components/economy/mega-jackpot-lottery-dashboard';
import { TaylorRuleLendingMarginMonitor } from '@/components/economy/taylor-rule-lending-margin-monitor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getServerLocale } from '@/lib/locale-server';
import { canonicalUrl } from '@/lib/seo';

const TOOLS_META_BY_LOCALE = {
  en: {
    title: 'Financial Calculators & Simulation Tools | Woldeok Moneyverse',
    description: 'Explore free financial calculators and virtual-economy simulations, including compound interest, stock averaging, retirement planning, salary and tax estimates.',
    canonical: '/en/tools',
  },
  ko: {
    title: '금융 계산기·경제 시뮬레이터 도구 모음 | 월덕 머니버스',
    description: '복리·주식 평단가·연봉 실수령액·대출·은퇴·세금 추정과 가상경제 시뮬레이션을 브라우저에서 이용하세요. 실제 금융 정보와 게임 내 WLD 예시를 구분해 확인할 수 있습니다.',
    canonical: '/tools',
  },
  ja: {
    title: '金融計算・経済シミュレーションツール | ウォルドクマネーバース',
    description: '複利、株式平均取得単価、退職資金などの金融計算と仮想経済シミュレーションを確認できます。',
    canonical: '/ja/tools',
  },
  zh: {
    title: '金融计算与经济模拟工具 | 沃尔德克金融元宇宙',
    description: '提供复利、股票平均成本、退休目标等金融计算和虚拟经济模拟工具。',
    canonical: '/zh/tools',
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const meta = TOOLS_META_BY_LOCALE[locale] ?? TOOLS_META_BY_LOCALE.en;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: canonicalUrl(meta.canonical),
      languages: {
        'ko-KR': canonicalUrl('/tools'),
        'en-US': canonicalUrl('/en/tools'),
        'ja-JP': canonicalUrl('/ja/tools'),
        'zh-CN': canonicalUrl('/zh/tools'),
        'x-default': canonicalUrl('/tools'),
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonicalUrl(meta.canonical),
    },
  };
}

const TOOLS = [
  {
    id: 'compound-calculator',
    category: 'savings',
    title: '복리 예금·적금 이자 계산기',
    badge: '인기 1위',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    description: '일 복리, 월 복리, 연 복리 수익을 시뮬레이션하고 만기 수령액과 단리 대비 복리 초과분을 역산합니다.',
    href: '/tools/compound-calculator',
    icon: Landmark,
    features: ['일/월/연 복리 비교', '목표액 도달 기간 역산', '이자 소득 시뮬레이션'],
  },
  {
    id: 'stock-calculator',
    category: 'investment',
    title: '주식 물타기·평단가 & 수익률 계산기',
    badge: '실전 트레이딩',
    badgeColor: 'bg-primary/10 text-primary border-primary/30',
    description: '추가 매수 시 실시간으로 변하는 평단가를 계산하고, 목표 수익률 도달을 위한 매도가를 정밀 산출합니다.',
    href: '/tools/stock-calculator',
    icon: TrendingUp,
    features: ['추가 매수 물타기 평단가', '목표 수익률 역산 매도가', '10대 종목 실시간 연동'],
  },
  {
    id: 'fire-calculator',
    category: 'savings',
    title: 'FIRE 조기은퇴·경제적 자유 시뮬레이터',
    badge: '조기은퇴',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    description: '트리니티 스터디 4% 안전 인출률과 인플레이션 실질 복리를 적용하여 목표 자산과 은퇴 가능 나이를 계산합니다.',
    href: '/tools/fire-calculator',
    icon: Flame,
    features: ['트리니티 4% 안전 인출률', '5대 FIRE 유형 비교', '은퇴 도달 나이 실시간 역산'],
  },
  {
    id: 'loan-interest-calculator',
    category: 'tax',
    title: '대출이자 & 원리금 상환 계산기',
    badge: '대출 필수',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    description: '원리금균등, 원금균등, 만기일시 상환방식별 총 이자와 월 상환액을 한눈에 비교합니다.',
    href: '/tools/loan-interest-calculator',
    icon: Percent,
    features: ['원리금균등 vs 원금균등 비교', '월별 상환 스케줄 시각화', '중도상환수수료 계산'],
  },
  {
    id: 'dividend-tax-calculator',
    category: 'investment',
    title: '배당소득세 계산기 (국내 · 미국주식)',
    badge: '배당 투자',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    description: '국내 및 미국 주식 배당금의 15.4% 원천징수 실수령액과 2,000만원 초과 시 금융종합과세 여부를 계산합니다.',
    href: '/tools/dividend-tax-calculator',
    icon: Coins,
    features: ['국내 15.4% vs 미국 15.0%', '2,000만원 한도 소진율', '실수령 배당금 산출'],
  },
  {
    id: 'salary-calculator',
    category: 'tax',
    title: '연봉별 실수령액 & 4대보험 공제 계산기',
    badge: '직장인 1위',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    description: '2026년 최신 4대 보험 요율과 근로소득세 간이세액표를 반영한 연봉별 월 실수령액을 확인합니다.',
    href: '/tools/salary-calculator',
    icon: Calculator,
    features: ['4대보험 1원 단위 산출', '비과세 식대 20만원 자동 반영', '부양가족별 공제'],
  },
  {
    id: 'crypto-apy-calculator',
    category: 'investment',
    title: '크립토 스테이킹 APY/APR 복리 계산기',
    badge: 'DeFi',
    badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    description: '스테이킹 및 DeFi 유동성 풀의 단리(APR)와 복리(APY)를 상호 변환하고 자동 재예치 복리를 계산합니다.',
    href: '/tools/crypto-apy-calculator',
    icon: Banknote,
    features: ['APR ↔ APY 상호 변환', '매일/매주/매월 재예치 복리', '일별/월별 수령액 정밀 산출'],
  },
  {
    id: 'goal-wealth-calculator',
    category: 'savings',
    title: '목표 자산·은퇴·목돈 모으기 계산기',
    badge: '목표 달성',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    description: '월 저축액과 투자 수익률, 인플레이션을 반영하여 목표 자산 도달 시점과 4% 룰 안전 은퇴 생활비를 계산합니다.',
    href: '/tools/goal-wealth-calculator',
    icon: Target,
    features: ['목표 자산 도달 기간 역산', '트리니티 4% 룰 안전 인출액', '사회초년생 프리셋'],
  },
  {
    id: 'isa-calculator',
    category: 'tax',
    title: 'ISA 개인종합자산관리계좌 비과세 계산기',
    badge: '만능 절세',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    description: '일반형(200만)과 서민형(400만) 비과세 한도 및 초과분 9.9% 분리과세로 일반 계좌 대비 절세액을 비교합니다.',
    href: '/tools/isa-calculator',
    icon: ShieldCheck,
    features: ['일반형 vs 서민형 비과세', '초과분 9.9% 저율 분리과세', '금융소득종합과세 방어'],
  },
  {
    id: 'pension-tax-calculator',
    category: 'tax',
    title: '연금저축 & IRP 세액공제 환급 계산기',
    badge: '13월의 월급',
    badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    description: '총급여 5,500만 원 기준 16.5%/13.2% 공제율과 연 900만 원 한도 최대 148만 5천 원 환급금을 산출합니다.',
    href: '/tools/pension-tax-calculator',
    icon: Landmark,
    features: ['총급여 구간별 세액공제율', '연금저축 600만 + IRP 300만 한도', '10년 누적 절세액 시뮬레이션'],
  },
];

export default async function ToolsHubPage() {
  const locale = await getServerLocale();
  const isKorean = locale === 'ko';
  const copy = {
    en: { badge: 'Financial Calculators & Simulation', heading: 'Financial Tools Hub', description: 'Explore compound interest, stock averaging, retirement planning, salary, loans and tax estimates.' },
    ko: { badge: '실전 금융 계산기 & 시뮬레이터', heading: '실전 금융 웹 계산기 10선', description: '복리·주식 평단가·대출이자·배당소득세·연봉 실수령액을 직관적인 차트와 함께 1초 만에 무료로 시뮬레이션하세요.' },
    ja: { badge: '金融計算・シミュレーション', heading: '金融計算ツールハブ', description: '複利、株式の平均取得単価、退職資金、給与、ローン、税金の試算ツールです。' },
    zh: { badge: '金融计算与模拟工具', heading: '金融工具中心', description: '复利、股票平均成本、退休、薪资、贷款和税费估算工具。' },
  }[locale];

  return (
    <div className="min-h-screen pb-24 space-y-8">
      {/* 1. 상단 대형 토스형 헤더 */}
      <div className="toss-card p-6 sm:p-8 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
          <Sparkles className="size-3.5" />
          <span>{copy.badge}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {copy.heading}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
          {copy.description}
        </p>
      </div>

      {/* 2. 탭 기반 계산기 분류 (전체, 자산/복리, 주식/투자, 대출/세금, 거시경제/시뮬레이터) */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="flex flex-wrap h-auto p-1 bg-muted/60 rounded-2xl gap-1 max-w-2xl">
          <TabsTrigger value="all" className="rounded-xl text-xs sm:text-sm font-semibold h-10 px-4">
            전체 10종
          </TabsTrigger>
          <TabsTrigger value="savings" className="rounded-xl text-xs sm:text-sm font-semibold h-10 px-4">
            자산·복리
          </TabsTrigger>
          <TabsTrigger value="investment" className="rounded-xl text-xs sm:text-sm font-semibold h-10 px-4">
            주식·투자
          </TabsTrigger>
          <TabsTrigger value="tax" className="rounded-xl text-xs sm:text-sm font-semibold h-10 px-4">
            대출·세금
          </TabsTrigger>
          <TabsTrigger value="macro" className="rounded-xl text-xs sm:text-sm font-semibold h-10 px-4">
            거시경제 랩
          </TabsTrigger>
        </TabsList>

        {/* 탭: 전체 10종 카드 그리드 */}
        <TabsContent value="all" className="space-y-6 focus-visible:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {TOOLS.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </TabsContent>

        {/* 탭: 자산·복리 */}
        <TabsContent value="savings" className="space-y-6 focus-visible:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {TOOLS.filter((t) => t.category === 'savings').map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </TabsContent>

        {/* 탭: 주식·투자 */}
        <TabsContent value="investment" className="space-y-6 focus-visible:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {TOOLS.filter((t) => t.category === 'investment').map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </TabsContent>

        {/* 탭: 대출·세금 */}
        <TabsContent value="tax" className="space-y-6 focus-visible:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {TOOLS.filter((t) => t.category === 'tax').map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </TabsContent>

        {/* 탭: 거시경제 랩 & 리텐션 이벤트 */}
        <TabsContent value="macro" className="space-y-6 focus-visible:outline-none">
          <NationalTreasuryBalanceSimulator />
          <MegaJackpotLotteryDashboard />
          <TaylorRuleLendingMarginMonitor />
          <DailyAttendanceRoulette />
          <DailyPredictionBattle />
          <ReferralSystem />
        </TabsContent>
      </Tabs>

      {/* 스폰서 광고 슬롯 */}
      <PublicAdvertisement />

      {/* 자주 묻는 질문 FAQ (토스형 아코디언 스타일) */}
      <div className="toss-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-foreground font-bold text-base">
          <HelpCircle className="size-5 text-primary" />
          <span>자주 묻는 질문 (FAQ)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div className="p-4 rounded-xl bg-muted/20 space-y-1.5 border border-border/40">
            <p className="font-bold text-foreground">Q. 로그인이 필요한가요?</p>
            <p className="leading-relaxed">아닙니다. 모든 계산 도구는 비회원 및 게스트 사용자도 제한 없이 무료로 즉시 사용할 수 있습니다.</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/20 space-y-1.5 border border-border/40">
            <p className="font-bold text-foreground">Q. 계산 결과를 공유할 수 있나요?</p>
            <p className="leading-relaxed">네, 각 계산기 내의 공유 버튼을 누르면 인스타그램/디스코드용 예쁜 요약 카드 이미지 및 클립보드 텍스트로 즉시 복사됩니다.</p>
          </div>
        </div>
      </div>

      {/* 사이트맵 등록 */}
      <PublicSitemapSubmitBox />
    </div>
  );
}

function ToolCard({ tool }: { readonly tool: typeof TOOLS[0] }) {
  const Icon = tool.icon;
  return (
    <div className="toss-card p-6 flex flex-col justify-between space-y-5 group hover:border-primary/50 transition-all">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            <Icon className="size-5" />
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${tool.badgeColor}`}>
            {tool.badge}
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
            {tool.title}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {tool.description}
          </p>
        </div>

        <ul className="space-y-1 text-xs text-muted-foreground/80 pt-1">
          {tool.features.map((feat, idx) => (
            <li key={idx} className="flex items-center gap-1.5">
              <div className="size-1 rounded-full bg-primary" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <Button asChild className="h-12 rounded-2xl btn-toss font-bold text-xs w-full shadow-sm">
        <Link href={tool.href} className="flex items-center justify-center gap-1.5">
          <span>계산기 시작하기</span>
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}
