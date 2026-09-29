'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Briefcase,
  Landmark,
  TrendingUp,
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Coins,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TranslatedText as T } from '@/components/translated-text';

export interface RoadmapStep {
  id: string;
  stepNumber: number;
  badge: string;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  description: string;
  descriptionEn: string;
  icon: typeof Sparkles;
  accentColor: string;
  borderHover: string;
  bgLight: string;
  actionUrl: string;
  actionLabel: string;
  checkpoints: {
    label: string;
    labelEn: string;
    tip: string;
  }[];
  previewData: {
    title: string;
    metricLabel: string;
    metricValue: string;
    subLabel: string;
    subValue: string;
    tag: string;
    highlight: string;
  };
}

const ROADMAP_STEPS: RoadmapStep[] = [
  {
    id: 'step-1',
    stepNumber: 1,
    badge: 'START · 1분 소요',
    title: '계정 로그인 & 첫 출석 체크',
    titleEn: 'Sign In & First Daily Check-in',
    subtitle: 'Discord 또는 Google로 간편하게 시작하고 초기 시드머니 획득',
    subtitleEn: 'Quick OAuth login and claim your initial seed WLD',
    description:
      '별도의 비밀번호 생성 없이 평소 사용하던 Discord나 Google 계정으로 3초 만에 로그인할 수 있습니다. 최초 1회 이용약관 동의 후 출석 체크 퀘스트와 황금오리 피버를 통해 매일 초기 활동 자금을 안전하게 수령하세요.',
    descriptionEn:
      'Log in within 3 seconds using your Discord or Google account. Agree to terms and claim daily check-in rewards and Golden Duck fever.',
    icon: Sparkles,
    accentColor: 'text-amber-500',
    borderHover: 'hover:border-amber-500/40',
    bgLight: 'bg-amber-500/10 text-amber-500',
    actionUrl: '/quests',
    actionLabel: '출석 퀘스트 바로가기',
    checkpoints: [
      {
        label: '우측 상단 [로그인] 버튼 클릭 (Discord/Google)',
        labelEn: 'Click [Sign In] on the top right (Discord/Google)',
        tip: '비밀번호를 기억할 필요 없이 안전한 OAuth 세션으로 보호됩니다.',
      },
      {
        label: '최초 1회 서비스 이용약관 및 개인정보 처리방침 동의',
        labelEn: 'Agree to Terms of Service & Privacy Policy once',
        tip: '동의 완료 즉시 복식부기 가상 지갑 원장이 자동 생성됩니다.',
      },
      {
        label: '[퀘스트] 메뉴에서 오늘 출석 완료하고 WLD 수령',
        labelEn: 'Complete daily check-in in [Quests] and receive WLD',
        tip: '연속 출석 스트릭 달성 시 황금 룰렛 보너스 티켓이 추가 지급됩니다.',
      },
    ],
    previewData: {
      title: '일일 출석 & 피버 현황',
      metricLabel: '출석 완료 기본 보상',
      metricValue: '+1,000 WLD',
      subLabel: '피버 룰렛 보너스',
      subValue: '최대 5,000 WLD',
      tag: '즉시 수령 가능',
      highlight: '7일 연속 출석 시 스타 드롭 5연속 탭 기회 제공!',
    },
  },
  {
    id: 'step-2',
    stepNumber: 2,
    badge: 'CORE · 3분 소요',
    title: '8대 전문 직업 배정 & 첫 일거리',
    titleEn: 'Choose Profession & Complete First Task',
    subtitle: '광부, 농부, 엔지니어, 트레이더 등 특화 직업을 선택하고 급여 수령',
    subtitleEn: 'Select among 8 professions and earn career wages and EXP',
    description:
      '머니버스 경제의 메인 엔진인 잡보드(/work)에서 내 성향에 맞는 전문 직업을 선택하세요. 각 작업마다 최소 수행 시간과 서버 일일 배정 한도가 적용되며, 숙련도 레벨이 오르면 최대 2.5배 급여 보너스를 획득합니다.',
    descriptionEn:
      'Choose a specialized career on the Work Board. Tasks have cooldowns and limits; level up mastery for up to 2.5x wage multipliers.',
    icon: Briefcase,
    accentColor: 'text-indigo-500',
    borderHover: 'hover:border-indigo-500/40',
    bgLight: 'bg-indigo-500/10 text-indigo-500',
    actionUrl: '/work',
    actionLabel: '잡보드(직업) 바로가기',
    checkpoints: [
      {
        label: '잡보드 상단 8개 직업군 중 원하는 분야 자유 선택',
        labelEn: 'Select from 8 career options on the Work Board',
        tip: '광부(자원), 농부(생산), 엔지니어(기술), 트레이더(금융) 등 언제든 전직 가능!',
      },
      {
        label: '원하는 난이도의 작업 수주 후 최소 대기 시간 충족',
        labelEn: 'Accept a task and wait for the duration timer',
        tip: '창을 닫거나 다른 메뉴를 둘러보아도 백그라운드 타이머가 유지됩니다.',
      },
      {
        label: '작업 완료 버튼을 눌러 WLD 급여 및 직업 EXP 즉시 정산',
        labelEn: 'Click Complete to claim WLD salary and career EXP',
        tip: '숙련도 레벨이 오르면 일일 급여 한도(최대 4,000만 WLD)가 함께 상향됩니다.',
      },
    ],
    previewData: {
      title: '직업 마스터리 콘솔',
      metricLabel: '1회 작업 기본 급여',
      metricValue: '2,500 ~ 50,000 WLD',
      subLabel: '일일 최대 수령 한도',
      subValue: '40,000,000 WLD',
      tag: '숙련도 배수 적용',
      highlight: 'Lv.5 달성 시 고급 전직 퀘스트 및 상위 도구 해금!',
    },
  },
  {
    id: 'step-3',
    stepNumber: 3,
    badge: 'GROWTH · 패시브 수익',
    title: '가상 은행 복리 저축 & 만기 국채',
    titleEn: 'Virtual Bank Compound Savings & Bonds',
    subtitle: '모은 WLD를 은행에 예치해 매일 불어나는 복리 이자와 국채 수익 실현',
    subtitleEn: 'Deposit idle funds to earn daily compound interest and bond yields',
    description:
      '활동으로 번 WLD를 지갑에 그냥 두지 마세요! 가상 은행(/bank) 복리 예금에 넣어두면 일 단위로 이자가 자동 누적되며 언제든 원클릭으로 정산할 수 있습니다. 여유 자금은 7일/30일 만기 고수익 가상 국채에 투자하세요.',
    descriptionEn:
      'Put surplus WLD into Bank Daily Compound Savings. Earn daily compounding interest and claim anytime. Invest in 7-day or 30-day bonds.',
    icon: Landmark,
    accentColor: 'text-emerald-500',
    borderHover: 'hover:border-emerald-500/40',
    bgLight: 'bg-emerald-500/10 text-emerald-500',
    actionUrl: '/bank',
    actionLabel: '가상 은행 포털 가기',
    checkpoints: [
      {
        label: '가상 은행 [복리 정기예금] 탭에서 여유 WLD 예치',
        labelEn: 'Deposit surplus WLD in Bank Compound Savings tab',
        tip: '원금과 누적 이자가 매일 복리로 불어나 자산 증식 속도가 빨라집니다.',
      },
      {
        label: '언제든 [누적 이자 정산] 버튼을 눌러 원장에 이자 반영',
        labelEn: 'Click [Claim Interest] anytime to post to ledger',
        tip: '중도 인출 수수료가 전혀 없으므로 필요할 때 즉시 출금할 수 있습니다.',
      },
      {
        label: '7일 / 30일 만기 가상 국채 상품 가입으로 확정 고수익 확보',
        labelEn: 'Subscribe to 7-day / 30-day Treasury Bonds',
        tip: '국고가 100% 지급 보증하므로 시장 하락장에서도 안전한 피난처가 됩니다.',
      },
    ],
    previewData: {
      title: '은행 복리 예금 & 국채 현황',
      metricLabel: '일일 복리 예상 이율',
      metricValue: '연 15.0% ~ 24.0%',
      subLabel: '30일 만기 국채 수익률',
      subValue: '확정 +8.5%',
      tag: '100% 원금 보장',
      highlight: '복리 효과로 1년 예치 시 원금 대비 약 1.3배 이상 자동 증식!',
    },
  },
  {
    id: 'step-4',
    stepNumber: 4,
    badge: 'EXPANSION · 고수익 투자',
    title: '가상 주식 매매 & 호가창 분석',
    titleEn: 'Stock Exchange & Orderbook Trading',
    subtitle: '10대 가상 상장사 주식을 실시간 호가로 매매하고 매일 기업 배당 획득',
    subtitleEn: 'Trade 10 virtual equities with real-time 10-depth orderbooks',
    description:
      '월덕거래소(/stocks)에서는 10대 가상 기업의 실시간 틱 차트와 10-Depth 호가창을 통해 전문적인 트레이딩을 경험할 수 있습니다. AI 뉴스 시장 감성 지표(Greed & Fear)를 참고하여 저평가 우량주를 매수하고 매일 주주 배당금을 수령하세요.',
    descriptionEn:
      'Trade 10 virtual equities with candlestick charts and 10-depth orderbooks. Leverage AI market sentiment to capture dividends and capital gains.',
    icon: TrendingUp,
    accentColor: 'text-cyan-500',
    borderHover: 'hover:border-cyan-500/40',
    bgLight: 'bg-cyan-500/10 text-cyan-500',
    actionUrl: '/stocks',
    actionLabel: '월덕거래소 바로가기',
    checkpoints: [
      {
        label: '10대 상장 종목(WDG, WDT, CHIPS, SPACE 등) 차트 분석',
        labelEn: 'Analyze charts for 10 listed equities',
        tip: 'AI 경제 신문(/newspaper)의 호재/악재 기사가 실시간 주가에 직접 반영됩니다.',
      },
      {
        label: '10-Depth 호가창에서 지정가 / 시장가 주문 실행',
        labelEn: 'Execute Limit / Market orders on 10-depth orderbook',
        tip: '매수/매도 잔량 압력 게이지를 통해 단기 지지선과 저항선을 파악하세요.',
      },
      {
        label: '보유 주식 포트폴리오를 구성하고 일일 배당금 수령',
        labelEn: 'Build stock portfolio and receive daily dividends',
        tip: '주식을 보유하기만 해도 매일 자정에 기업 이익의 일부가 배당금으로 지급됩니다.',
      },
    ],
    previewData: {
      title: '월덕거래소 라이브 콘솔',
      metricLabel: '시장 평균 연간 배당률',
      metricValue: '8.5% ~ 14.2%',
      subLabel: '실시간 호가 Depth',
      subValue: '10-Depth 틱 스트림',
      tag: 'AI 감성 연동',
      highlight: 'AI 신문 호재 발생 시 600ms 플래시 펄스 상승 랠리 전개!',
    },
  },
  {
    id: 'step-5',
    stepNumber: 5,
    badge: 'MOGUL · 최종 도약',
    title: '기업 창업 & 클럽/협동조합 영지',
    titleEn: 'Found Businesses & Build Guilds',
    subtitle: '직접 가상 사업체를 설립해 대표가 되거나 클럽 협동 펀딩으로 영지 개척',
    subtitleEn: 'Found startups to collect CEO dividends and wage guild wars',
    description:
      '축적한 자본으로 나만의 스타트업이나 상거래 법인을 설립(/businesses)해 매일 법인 배당금을 챙기는 머니버스의 대표 자본가가 되어보세요. 뜻이 맞는 유저들과 클럽(/clubs)을 창설하여 영지 공성전과 대규모 협동 프로젝트에 도전할 수 있습니다.',
    descriptionEn:
      'Found your own startup to collect CEO dividends. Form clubs with other players to participate in territory battles and cooperative funding.',
    icon: Building2,
    accentColor: 'text-purple-500',
    borderHover: 'hover:border-purple-500/40',
    bgLight: 'bg-purple-500/10 text-purple-500',
    actionUrl: '/businesses',
    actionLabel: '게임 사업 둘러보기',
    checkpoints: [
      {
        label: '마이비즈(/businesses)에서 시드 투자 후 나만의 법인 창업',
        labelEn: 'Found virtual enterprise under MyBiz',
        tip: '소프트웨어, F&B, 물류, 콘텐츠 등 다양한 업종의 사업체를 운영할 수 있습니다.',
      },
      {
        label: '매일 원클릭 [수익 일괄 정산]으로 기업 운영 이익금 회수',
        labelEn: 'One-click daily revenue settlement',
        tip: '상점에서 사업 부스트 아이템을 적용하면 일일 매출이 20%~50% 폭증합니다.',
      },
      {
        label: '클럽·협동조합(/clubs)을 창설하여 길드 영지 쟁탈전 참전',
        labelEn: 'Found a club/guild and join territory wars',
        tip: '길드원들과 협동 펀딩을 달성하면 클럽 캔버스 및 특별 배당 혜택이 주어집니다.',
      },
    ],
    previewData: {
      title: '엔터프라이즈 & 클럽 대시보드',
      metricLabel: '사업체 일일 패시브 매출',
      metricValue: '+150,000 WLD/일',
      subLabel: '클럽 협동 펀딩 배당',
      subValue: '추가 +15% 버프',
      tag: '대표 자본가 등극',
      highlight: '시즌 랭킹 상위권 진입 시 명예의 전당 등재 및 한정판 트로피 지급!',
    },
  },
];

export function OnboardingRoadmap() {
  const [activeTab, setActiveTab] = useState<string>('step-1');
  const fallbackStep: RoadmapStep = ROADMAP_STEPS[0]!;
  const currentStep: RoadmapStep = ROADMAP_STEPS.find((s) => s.id === activeTab) ?? fallbackStep;
  const StepIcon = currentStep.icon;

  return (
    <div className="space-y-6">
      {/* 5-Step Horizontal Tab Navigator (320px Responsive Scrollable) */}
      <div className="flex gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar sm:grid sm:grid-cols-5 sm:gap-2.5">
        {ROADMAP_STEPS.map((step) => {
          const isActive = activeTab === step.id;
          const Icon = step.icon;
          return (
            <button
              key={step.id}
              onClick={() => setActiveTab(step.id)}
              className={cn(
                'group relative flex min-w-[140px] flex-1 items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all duration-200 outline-none sm:min-w-0 sm:flex-col sm:items-start sm:p-3',
                isActive
                  ? 'border-primary/60 bg-primary/10 shadow-sm ring-1 ring-primary/30'
                  : 'border-border/70 bg-card/60 hover:border-border hover:bg-card/90 text-muted-foreground',
              )}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={cn(
                    'grid size-6 place-items-center rounded-lg text-xs font-black transition-colors',
                    isActive ? 'bg-primary text-primary-foreground shadow-xs' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {step.stepNumber}
                </span>
                <span className="hidden text-[10px] font-bold uppercase tracking-wider text-muted-foreground lg:inline-block">
                  STEP {step.stepNumber}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className={cn('text-xs font-bold leading-tight line-clamp-1', isActive ? 'text-foreground font-black' : 'text-foreground/80')}>
                  {step.title.split('&')[0]}
                </div>
                <div className="mt-0.5 text-[10px] text-muted-foreground line-clamp-1">
                  {step.badge.split('·')[0]}
                </div>
              </div>
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Roadmap Step Detail Card (Bento Grid 2-Col) */}
      <div className="rounded-2xl border border-border/80 bg-card/95 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          {/* Left Column: Detailed Step Explanation & Checkpoints */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-extrabold', currentStep.bgLight)}>
                  <StepIcon className="size-3.5" />
                  <span>{currentStep.badge}</span>
                </span>
                <Badge variant="outline" className="text-[11px] font-semibold border-border">
                  단계 0{currentStep.stepNumber} / 05
                </Badge>
              </div>

              <h3 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                <T korean={currentStep.title} english={currentStep.titleEn} />
              </h3>

              <p className="text-sm font-semibold text-primary/90 [word-break:keep-all]">
                <T korean={currentStep.subtitle} english={currentStep.subtitleEn} />
              </p>

              <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground [word-break:keep-all]">
                <T korean={currentStep.description} english={currentStep.descriptionEn} />
              </p>
            </div>

            {/* Checkpoints Box */}
            <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-foreground">
                <CheckCircle2 className="size-4 text-emerald-500" />
                <span><T korean="이 단계의 핵심 실행 체크포인트" english="Key Action Checkpoints" /></span>
              </div>
              <div className="space-y-2.5">
                {currentStep.checkpoints.map((cp, idx) => (
                  <div key={idx} className="space-y-0.5 rounded-lg bg-background/60 p-2.5 text-xs border border-border/40">
                    <div className="flex items-start gap-2 font-bold text-foreground">
                      <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-primary/20 text-[10px] font-black text-primary">
                        {idx + 1}
                      </span>
                      <span><T korean={cp.label} english={cp.labelEn} /></span>
                    </div>
                    <div className="pl-6 text-[11px] text-muted-foreground [word-break:keep-all]">
                      💡 {cp.tip}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step Action Button & Navigation Link */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button asChild size="lg" className="min-h-[44px] font-bold shadow-sm">
                <Link href={currentStep.actionUrl}>
                  <span>{currentStep.actionLabel}</span>
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              {currentStep.stepNumber < 5 && (
                <Button
                  variant="outline"
                  size="lg"
                  className="min-h-[44px] font-semibold text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    const nextId = `step-${currentStep.stepNumber + 1}`;
                    setActiveTab(nextId);
                  }}
                >
                  <span><T korean="다음 단계 보기" english="View Next Step" /></span>
                  <ChevronRight className="ml-1 size-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Right Column: FinTech Mockup Preview Card */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-white shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400">
                    {currentStep.previewData.title}
                  </span>
                </div>
                <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-bold">
                  {currentStep.previewData.tag}
                </Badge>
              </div>

              <div className="space-y-4 pt-4">
                <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3.5">
                  <div className="text-[11px] font-medium text-zinc-400">
                    {currentStep.previewData.metricLabel}
                  </div>
                  <div className="mt-1 font-mono text-2xl font-black text-emerald-400">
                    {currentStep.previewData.metricValue}
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3.5">
                  <div className="text-[11px] font-medium text-zinc-400">
                    {currentStep.previewData.subLabel}
                  </div>
                  <div className="mt-1 font-mono text-lg font-bold text-amber-300">
                    {currentStep.previewData.subValue}
                  </div>
                </div>

                <div className="rounded-xl border border-primary/20 bg-primary/10 p-3 text-xs text-primary-foreground/90 flex items-start gap-2">
                  <Zap className="size-4 shrink-0 text-amber-400 mt-0.5" />
                  <span className="leading-relaxed [word-break:keep-all]">
                    {currentStep.previewData.highlight}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Safety & Ledger Note */}
            <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-secondary/30 p-3 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
              <span>
                <T
                  korean="모든 활동 보상과 금융 이자는 PostgreSQL 복식부기 원장에 안전하게 영구 보존됩니다."
                  english="All activity payouts and interest are immutably stored in the PostgreSQL ledger."
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
