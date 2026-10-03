'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Building2,
  Landmark,
  Zap,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  Share2,
  Coins,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { markOnboardingActionComplete } from '@/lib/onboarding-tracker';
import { playWinSound } from '@/lib/audio-effects';

export type InvestorType = 'conservative' | 'balanced' | 'aggressive' | 'cashflow';

interface QuizOption {
  readonly text: string;
  readonly type: InvestorType;
  readonly subtext: string;
}

interface QuizQuestion {
  readonly id: number;
  readonly title: string;
  readonly subtitle: string;
  readonly options: readonly QuizOption[];
}

const QUIZ_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: 1,
    title: '당신의 주된 자산 증식 목표는 무엇인가요?',
    subtitle: '가장 중요하게 생각하는 투자 철학을 선택하세요.',
    options: [
      {
        text: '원금 100% 안전 보장과 복리 이자',
        subtext: '자산 하락 걱정 없이 매일 확실한 복리 이자만 수령',
        type: 'conservative',
      },
      {
        text: '은행 금리를 뛰어넘는 균형 있는 성장',
        subtext: '안정적인 예금과 우량 주식을 분산하여 꾸준한 우상향',
        type: 'balanced',
      },
      {
        text: '고변동성 텐배거 대박과 초고속 자산 증식',
        subtext: 'AI 테크/반도체 주식 및 공격적인 기회 포착',
        type: 'aggressive',
      },
      {
        text: '일하지 않아도 매일 들어오는 패시브 임대료/배당',
        subtext: '가상 랜드/오피스를 보유하고 자고 있어도 월세 수령',
        type: 'cashflow',
      },
    ],
  },
  {
    id: 2,
    title: '보유 자산이 일시적으로 -10% 하락했을 때 당신의 행동은?',
    subtitle: '시장 변동성에 대처하는 심리적 태도를 파악합니다.',
    options: [
      {
        text: '너무 불안해서 즉시 전액 인출 및 예금 이동',
        subtext: '원금 손실 스트레스를 극도로 기피하는 성향',
        type: 'conservative',
      },
      {
        text: '장기 분산 포트폴리오를 믿고 차분히 관망',
        subtext: '단기 노이즈에 흔들리지 않는 원칙주의 성향',
        type: 'balanced',
      },
      {
        text: '저가 줍줍 바겐세일 찬스로 판단하고 추가 매수',
        subtext: '조정장을 수익 극대화의 기회로 전환하는 공격 성향',
        type: 'aggressive',
      },
      {
        text: '매일 자정에 입금되는 임대료/배당만 유지되면 무관심',
        subtext: '시세 차익보다 현금흐름(Cashflow)을 최우선시하는 성향',
        type: 'cashflow',
      },
    ],
  },
  {
    id: 3,
    title: '하루에 투자 및 자산 관리에 할애할 수 있는 시간은?',
    subtitle: '자신의 라이프스타일에 맞는 운용 주기를 선택하세요.',
    options: [
      {
        text: '하루 10초 복리 이자 확인 및 룰렛만 돌리기',
        subtext: '완전 자동화된 무신경 패시브 관리 선호',
        type: 'conservative',
      },
      {
        text: '하루 1~3분 시세 점검 및 일일 직업 업무 완수',
        subtext: '일일 루틴과 주간 리밸런싱의 조화',
        type: 'balanced',
      },
      {
        text: '실시간 호가창 10-Depth 확인 및 스캘핑/단타',
        subtext: '급등락 종목을 실시간으로 추적하며 적극 운용',
        type: 'aggressive',
      },
      {
        text: '주 1회 부동산 임대 수익 정산 및 건물 증축 관리',
        subtext: '묵직한 실물 자산 위주의 주기적 점검',
        type: 'cashflow',
      },
    ],
  },
];

interface ProfileResult {
  readonly type: InvestorType;
  readonly title: string;
  readonly badge: string;
  readonly description: string;
  readonly tag: string;
  readonly expectedApr: string;
  readonly allocations: readonly {
    readonly name: string;
    readonly ratio: number;
    readonly color: string;
    readonly bgClass: string;
    readonly href: string;
    readonly actionLabel: string;
  }[];
}

const PROFILES: Record<InvestorType, ProfileResult> = {
  conservative: {
    type: 'conservative',
    title: '🛡️ 철통 방어 복리 수호자',
    badge: '안정형 (Conservative Sentinel)',
    tag: '원금 보장 & 무손실',
    expectedApr: '연 7.2% ~ 12.0%',
    description: '원금 손실 리스크를 0%에 가깝게 통제하며, 중앙은행 스마트 복리 포켓과 무위험 가상 국채를 통해 매일 밤 확실한 이자를 수확하는 가장 견고한 투자 전략입니다.',
    allocations: [
      {
        name: '중앙은행 스마트 복리 포켓 (30일/90일)',
        ratio: 70,
        color: '#10b981',
        bgClass: 'bg-emerald-500',
        href: '/bank',
        actionLabel: '복리 금고 예치하기',
      },
      {
        name: '가상 국채 & 안정 통화 포트폴리오',
        ratio: 20,
        color: '#06b6d4',
        bgClass: 'bg-cyan-500',
        href: '/bank',
        actionLabel: '국채 매수하기',
      },
      {
        name: 'WDX 고배당 가치주',
        ratio: 10,
        color: '#8b5cf6',
        bgClass: 'bg-purple-500',
        href: '/stocks',
        actionLabel: '배당주 포트폴리오 보기',
      },
    ],
  },
  balanced: {
    type: 'balanced',
    title: '⚖️ 스마트 올라운드 다이나모',
    badge: '균형성장형 (Balanced Dynamo)',
    tag: '우량주 + 복리 황금비',
    expectedApr: '연 18.5% ~ 28.0%',
    description: '안정적인 복리 이자로 하방을 방어하면서, WDX 대표 우량주와 메가시티 랜드에 분산 투자하여 시장 평균을 압도하는 복리 우상향을 달성하는 정석적인 전략입니다.',
    allocations: [
      {
        name: 'WDX 대표 우량주 (침팬지반도체, AI테크)',
        ratio: 40,
        color: '#f59e0b',
        bgClass: 'bg-amber-500',
        href: '/stocks',
        actionLabel: '10-Depth 호가 거래소 입장',
      },
      {
        name: '중앙은행 스마트 복리 포켓',
        ratio: 40,
        color: '#10b981',
        bgClass: 'bg-emerald-500',
        href: '/bank',
        actionLabel: '복리 포켓 열기',
      },
      {
        name: '가상 부동산 메가시티 리츠',
        ratio: 20,
        color: '#3b82f6',
        bgClass: 'bg-blue-500',
        href: '/spaces/real-estate',
        actionLabel: '부동산 랜드 확인',
      },
    ],
  },
  aggressive: {
    type: 'aggressive',
    title: '🚀 폭풍 성장 공격형 알파',
    badge: '공격투자형 (Aggressive Alpha)',
    tag: '텐배거 급등주 & 고수익',
    expectedApr: '연 45.0% ~ 120%+',
    description: '단기 급등 잠재력을 지닌 신성장 WDX 종목에 집중 투자하며, 5대 계산기의 정밀 물타기/익절가 분석과 아케이드 럭키 스핀을 전략적으로 활용해 초고속 자산 팽창을 노립니다.',
    allocations: [
      {
        name: 'WDX 고변동성 급등 성장주 & 테마주',
        ratio: 60,
        color: '#ef4444',
        bgClass: 'bg-rose-500',
        href: '/stocks',
        actionLabel: '급등주 호가창 실시간 매수',
      },
      {
        name: '비상금 복리 포켓 (익절 수익금 안착)',
        ratio: 20,
        color: '#10b981',
        bgClass: 'bg-emerald-500',
        href: '/bank',
        actionLabel: '수익금 금고 이체',
      },
      {
        name: '도파민 아케이드 & 럭키 룰렛',
        ratio: 20,
        color: '#ec4899',
        bgClass: 'bg-pink-500',
        href: '/casino',
        actionLabel: '아케이드 행운 도전',
      },
    ],
  },
  cashflow: {
    type: 'cashflow',
    title: '👑 패시브 인컴 캐시플로우 제국',
    badge: '현금흐름형 (Cashflow Sovereign)',
    tag: '매일 자정 월세 수령',
    expectedApr: '일 0.3% (연 109.5% 복리)',
    description: '시세 차익의 불확실성을 배제하고, 강남/판교의 알짜 가상 랜드 및 오피스를 보유하여 매일 자정 계좌로 꽂히는 무한 패시브 임대료를 구축하는 건물주 전략입니다.',
    allocations: [
      {
        name: '강남/판교 가상 메가시티 랜드 & 오피스',
        ratio: 50,
        color: '#8b5cf6',
        bgClass: 'bg-purple-500',
        href: '/spaces/real-estate',
        actionLabel: '강남 빌딩/랜드 분양받기',
      },
      {
        name: '중앙은행 30일/90일 확정 복리 포켓',
        ratio: 30,
        color: '#10b981',
        bgClass: 'bg-emerald-500',
        href: '/bank',
        actionLabel: '임대료 복리 재투자',
      },
      {
        name: 'WDX 고배당 가치주 & 리츠',
        ratio: 20,
        color: '#f59e0b',
        bgClass: 'bg-amber-500',
        href: '/stocks',
        actionLabel: '배당주 매수하기',
      },
    ],
  },
};

export function InvestorProfileQuiz() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<InvestorType[]>([]);
  const [resultType, setResultType] = useState<InvestorType | null>(null);
  const [simulatedSeed, setSimulatedSeed] = useState<number>(100000);

  const handleSelectOption = (type: InvestorType) => {
    const nextAnswers = [...answers, type];
    setAnswers(nextAnswers);

    if (currentStep + 1 < QUIZ_QUESTIONS.length) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // 3문항 완료 -> 최빈값 계산
      const counts: Record<InvestorType, number> = {
        conservative: 0,
        balanced: 0,
        aggressive: 0,
        cashflow: 0,
      };
      nextAnswers.forEach((ans) => {
        counts[ans] = (counts[ans] || 0) + 1;
      });

      let topType: InvestorType = 'balanced';
      let maxCount = -1;
      (Object.keys(counts) as InvestorType[]).forEach((t) => {
        const count = counts[t] ?? 0;
        if (count > maxCount) {
          maxCount = count;
          topType = t;
        }
      });

      setResultType(topType);

      // 온보딩 트래커 보너스 연동 (+20,000 WLD)
      const res = markOnboardingActionComplete('take_quiz');
      if (res.isNewlyCompleted) {
        playWinSound();
        toast.success('🎉 AI 투자 성향 진단 완료! 온보딩 퀘스트 보너스 획득!', {
          description: '퀘스트 서랍에서 20,000 WLD 보너스를 즉시 수령하세요.',
        });
      }
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers([]);
    setResultType(null);
  };

  const handleShare = () => {
    if (!resultType) return;
    const profile = PROFILES[resultType];
    const text = `[머니버스 AI 투자 성향 진단 결과]\n나의 투자 페르소나: ${profile.title} (${profile.badge})\n예상 기대 수익률: ${profile.expectedApr}\n지금 무료로 진단받고 20,000 WLD 받으세요: https://easy-scraping.com/roadmap#quiz`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success('📋 진단 결과가 클립보드에 복사되었습니다!', {
        description: '친구들에게 공유하고 나의 투자 성향을 자랑하세요.',
      });
    }
  };

  return (
    <Card id="quiz" className="relative overflow-hidden border-zinc-800 bg-zinc-950/90 shadow-2xl backdrop-blur-md">
      <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <CardHeader className="p-6 sm:p-8 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI 맞춤형 투자 성향 진단기 & 1초 포트폴리오</span>
          </div>

          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs">
            🎁 진단 완료 시 +20,000 WLD 퀘스트 지급
          </Badge>
        </div>

        <CardTitle className="text-xl sm:text-2xl font-bold text-white tracking-tight pt-2">
          {resultType ? '나만의 맞춤형 핀테크 자산 배분 포트폴리오' : '30초 만에 찾는 나의 최적 머니버스 투자 페르소나'}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-zinc-400">
          {resultType
            ? '당신의 성향에 맞춰 수학적으로 계산된 최적의 자산 배분 비중입니다. 버튼을 눌러 즉시 시작하세요.'
            : '어떤 기능부터 시작해야 할지 고민되시나요? 3가지 질문에 답하면 당신에게 꼭 맞는 공략법을 즉시 설계해 드립니다.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 sm:p-8 pt-2">
        {!resultType ? (
          <div className="space-y-6">
            {/* 프로그레스 바 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-400 font-mono">
                <span>질문 {currentStep + 1} / {QUIZ_QUESTIONS.length}</span>
                <span>{Math.round(((currentStep + 1) / QUIZ_QUESTIONS.length) * 100)}% 완료</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-primary transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* 현재 질문 */}
            {(() => {
              const activeQuestion = (QUIZ_QUESTIONS[currentStep] ?? QUIZ_QUESTIONS[0]) as QuizQuestion;
              return (
                <>
                  <div className="space-y-2">
                    <h3 className="text-base sm:text-lg font-bold text-white font-sans">
                      Q{activeQuestion.id}. {activeQuestion.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400">
                      {activeQuestion.subtitle}
                    </p>
                  </div>

                  {/* 보기 리스트 */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {activeQuestion.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(opt.type)}
                        className="group relative flex flex-col items-start justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 text-left transition-all hover:border-primary/50 hover:bg-zinc-850 hover:shadow-lg active:scale-[0.98]"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-300 group-hover:bg-primary group-hover:text-black">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="text-sm font-semibold text-zinc-100 group-hover:text-primary">
                              {opt.text}
                            </span>
                          </div>
                          <p className="pl-7 text-xs text-zinc-400 leading-relaxed">
                            {opt.subtext}
                          </p>
                        </div>
                        <div className="mt-3 flex w-full items-center justify-end text-[11px] font-medium text-zinc-500 group-hover:text-primary">
                          <span>선택하기</span>
                          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          /* 진단 결과 화면 */
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* 결과 헤더 */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-emerald-400">
                    {PROFILES[resultType].badge}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                    {PROFILES[resultType].title}
                  </h3>
                </div>
                <Badge className="bg-primary/20 text-primary border-primary/30 text-xs px-3 py-1 font-mono">
                  기대 수익률: {PROFILES[resultType].expectedApr}
                </Badge>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed">
                {PROFILES[resultType].description}
              </p>
            </div>

            {/* 자산 배분 비중 시각화 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-zinc-200">
                  📊 추천 자산 배분 비율 (Asset Allocation)
                </h4>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span>시드머니:</span>
                  <select
                    value={simulatedSeed}
                    onChange={(e) => setSimulatedSeed(Number(e.target.value))}
                    className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-primary font-mono"
                  >
                    <option value={100000}>10만 WLD (초반)</option>
                    <option value={1000000}>100만 WLD (중반)</option>
                    <option value={10000000}>1,000만 WLD (고수)</option>
                    <option value={100000000}>1억 WLD (건물주)</option>
                  </select>
                </div>
              </div>

              {/* 멀티 컬러 프로그레스 바 */}
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-zinc-800">
                {PROFILES[resultType].allocations.map((alloc, idx) => (
                  <div
                    key={idx}
                    className={`h-full ${alloc.bgClass} transition-all`}
                    style={{ width: `${alloc.ratio}%` }}
                    title={`${alloc.name}: ${alloc.ratio}%`}
                  />
                ))}
              </div>

              {/* 배분 상세 카드 그리드 */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {PROFILES[resultType].allocations.map((alloc, idx) => {
                  const allocatedAmount = Math.round((simulatedSeed * alloc.ratio) / 100);
                  return (
                    <div
                      key={idx}
                      className="flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4 space-y-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-300">
                            {alloc.name}
                          </span>
                          <span className="font-mono text-xs font-bold" style={{ color: alloc.color }}>
                            {alloc.ratio}%
                          </span>
                        </div>
                        <div className="font-mono text-lg font-extrabold text-white">
                          {allocatedAmount.toLocaleString()} <span className="text-xs text-zinc-400 font-normal">WLD</span>
                        </div>
                      </div>

                      <Link href={alloc.href} className="w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs font-semibold border-zinc-700 hover:border-primary hover:text-primary transition-colors"
                        >
                          <span>{alloc.actionLabel}</span>
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 하단 리셋 및 공유 버튼 */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/80 pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs text-zinc-400 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                <span>성향 다시 진단하기</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="border-zinc-800 text-xs font-semibold hover:border-primary"
                >
                  <Share2 className="h-3.5 w-3.5 mr-1.5" />
                  <span>진단 결과 공유하기</span>
                </Button>

                <Link href="/roadmap">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/50"
                  >
                    <span>실전 3단계 로드맵 따라하기</span>
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
