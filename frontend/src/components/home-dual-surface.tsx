'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Calculator,
  TrendingUp,
  Landmark,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Layers,
  Flame,
  Coins,
  Target,
  Percent,
  CheckCircle2,
  ExternalLink,
  PiggyBank,
  Compass,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PublicAdvertisement, InArticleAdvertisement } from '@/components/public-advertisement';

// ============================================================================
// 19대 실전 금융 계산기 카탈로그 (카테고리별 정밀 분류)
// ============================================================================
export interface CalculatorTool {
  readonly id: string;
  readonly title: string;
  readonly category: 'stock' | 'tax' | 'income' | 'crypto';
  readonly categoryLabel: string;
  readonly badge: string;
  readonly badgeColor: string;
  readonly description: string;
  readonly href: string;
  readonly icon: React.ElementType;
  readonly iconColor: string;
  readonly highlight: string;
}

export const FINANCIAL_CALCULATORS: readonly CalculatorTool[] = [
  // 1. 주식 · 투자
  {
    id: 'stock-calculator',
    title: '주식 물타기 · 평단가 & 수익률 계산기',
    category: 'stock',
    categoryLabel: '주식 · 투자',
    badge: '실전 트레이딩 1위',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    description: '추가 매수 시 최종 평단가를 1초 만에 산출하고, 원금 회복 및 목표 수익률을 위한 탈출 매도가를 계산합니다.',
    href: '/tools/stock-calculator',
    icon: TrendingUp,
    iconColor: 'text-emerald-400 bg-emerald-500/10',
    highlight: '추가 매수 물타기 · 탈출 단가 역산',
  },
  {
    id: 'dividend-tax-calculator',
    title: '배당소득세 & 금융종합과세 2천만원 계산기',
    category: 'stock',
    categoryLabel: '주식 · 투자',
    badge: '배당 투자 필수',
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    description: '국내(15.4%) 및 미국(15%) 주식 배당금 실수령액과 연 2,000만원 초과 시 종합과세 소진율을 정밀 산출합니다.',
    href: '/tools/dividend-tax-calculator',
    icon: Coins,
    iconColor: 'text-amber-400 bg-amber-500/10',
    highlight: '국내/미국 배당세 15.4% · 2천만원 한도',
  },
  {
    id: 'capital-gains-tax-calculator',
    title: '해외주식 양도소득세 22% 절세 계산기',
    category: 'stock',
    categoryLabel: '주식 · 투자',
    badge: '서학개미 필수',
    badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    description: '연간 250만 원 기본공제 및 손익 통산을 반영하여 22% 양도소득세와 합법적 연말 절세 매도 전략을 제시합니다.',
    href: '/tools/capital-gains-tax-calculator',
    icon: Landmark,
    iconColor: 'text-blue-400 bg-blue-500/10',
    highlight: '250만원 기본공제 · 손익통산 절세',
  },
  {
    id: 'quant-studio',
    title: '주식 퀀트 백테스팅 & 포트폴리오 스튜디오',
    category: 'stock',
    categoryLabel: '주식 · 투자',
    badge: '고급 알고리즘',
    badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    description: 'DCA 적립식 매수 및 리밸런싱 전략의 과거 5~10년 최대 낙폭(MDD)과 연평균 복리 수익률(CAGR)을 시뮬레이션합니다.',
    href: '/tools/quant-studio',
    icon: Layers,
    iconColor: 'text-purple-400 bg-purple-500/10',
    highlight: 'CAGR/MDD 백테스트 · 리밸런싱',
  },
  {
    id: 'kimchi-premium-calculator',
    title: '비트코인 김치프리미엄 & 차익거래 계산기',
    category: 'stock',
    categoryLabel: '주식 · 투자',
    badge: '실시간 프리미엄',
    badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    description: '업비트와 바이낸스 간 실시간 환율 기반 김치프리미엄(%) 및 해외 송금 아비트라지 차익을 계산합니다.',
    href: '/tools/kimchi-premium-calculator',
    icon: Percent,
    iconColor: 'text-cyan-400 bg-cyan-500/10',
    highlight: '업비트-바이낸스 프리미엄 실시간 역산',
  },

  // 2. 절세 · 부동산
  {
    id: 'pension-tax-calculator',
    title: '연금저축 · IRP 세액공제 최대 148만원 환급기',
    category: 'tax',
    categoryLabel: '절세 · 부동산',
    badge: '13월의 월급 1위',
    badgeColor: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
    description: '총급여 기준 16.5%/13.2% 세액공제율과 연 900만원 한도 연말정산 최대 환급금 및 10년 복리 절세액을 계산합니다.',
    href: '/tools/pension-tax-calculator',
    icon: Landmark,
    iconColor: 'text-teal-400 bg-teal-500/10',
    highlight: '최대 148.5만원 환급 · 과세이연',
  },
  {
    id: 'isa-calculator',
    title: 'ISA 개인종합자산관리계좌 비과세 계산기',
    category: 'tax',
    categoryLabel: '절세 · 부동산',
    badge: '만능 비과세',
    badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    description: '일반형(200만) · 서민형(400만) 비과세 한도와 초과분 9.9% 분리과세로 일반 계좌(15.4%) 대비 절세 차액을 비교합니다.',
    href: '/tools/isa-calculator',
    icon: ShieldCheck,
    iconColor: 'text-indigo-400 bg-indigo-500/10',
    highlight: '최대 400만원 비과세 · 9.9% 분리과세',
  },
  {
    id: 'loan-interest-calculator',
    title: '주택담보대출 · 신용대출 이자 계산기',
    category: 'tax',
    categoryLabel: '절세 · 부동산',
    badge: '대출 비교 1위',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    description: '원리금균등, 원금균등, 만기일시 상환방식별 총 이자와 월 상환액, 중도상환 수수료 면제 시점을 시각화합니다.',
    href: '/tools/loan-interest-calculator',
    icon: Landmark,
    iconColor: 'text-emerald-400 bg-emerald-500/10',
    highlight: '원리금균등 vs 원금균등 총이자 비교',
  },
  {
    id: 'real-estate-calculator',
    title: '부동산 DSR 40% & 취득세 · 중개수수료 계산기',
    category: 'tax',
    categoryLabel: '절세 · 부동산',
    badge: '내집마련 필수',
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    description: '연소득 대비 DSR 40% 대출 가능 한도, 주택 가격별 취득세 1~3% 및 법정 부동산 중개수수료를 원스톱 계산합니다.',
    href: '/tools/real-estate-calculator',
    icon: Target,
    iconColor: 'text-amber-400 bg-amber-500/10',
    highlight: 'DSR 40% 대출 한도 · 취득세 자동 산출',
  },
  {
    id: 'gift-tax-calculator',
    title: '10년 합산 증여세 & 공제 한도 절세 계산기',
    category: 'tax',
    categoryLabel: '절세 · 부동산',
    badge: '합법 절세',
    badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    description: '배우자 6억, 성인 자녀 5천만 원 등 10년 주기 증여재산공제 한도와 10~50% 누진세율 및 분할 증여 절세액을 계산합니다.',
    href: '/tools/gift-tax-calculator',
    icon: PiggyBank,
    iconColor: 'text-rose-400 bg-rose-500/10',
    highlight: '10년 증여공제 · 10~50% 누진세율',
  },
  {
    id: 'tax-calculator',
    title: '종합소득세 & 2026 금융소득 세금 계산기',
    category: 'tax',
    categoryLabel: '절세 · 부동산',
    badge: '종소세 5월 대비',
    badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    description: '사업소득, 프리랜서 3.3%, 이자/배당 금융소득 2천만원 초과 합산 과세액과 표준 세액공제를 비교합니다.',
    href: '/tools/tax-calculator',
    icon: Calculator,
    iconColor: 'text-blue-400 bg-blue-500/10',
    highlight: '6~45% 누진세율 · 건보료 영향 분석',
  },

  // 3. 소득 · 은퇴
  {
    id: 'fire-calculator',
    title: 'FIRE 조기은퇴 4% 룰 & 25배 목표자산 계산기',
    category: 'income',
    categoryLabel: '소득 · 은퇴',
    badge: 'HOT 조기은퇴',
    badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    description: '트리니티 스터디 4% 안전 인출률을 적용하여 5대 FIRE 유형(Lean, Regular, Fat)별 목표 은퇴자금과 은퇴 나이를 산출합니다.',
    href: '/tools/fire-calculator',
    icon: Flame,
    iconColor: 'text-rose-400 bg-rose-500/10',
    highlight: '트리니티 4% 룰 · 5대 FIRE 목표 자산',
  },
  {
    id: 'salary-calculator',
    title: '2026 연봉별 실수령액 & 4대보험 공제표',
    category: 'income',
    categoryLabel: '소득 · 은퇴',
    badge: '직장인 1위',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    description: '2026년 최신 국민연금, 건강보험, 고용보험 요율과 근로소득세 간이세액표를 반영한 연봉별 월 실수령액을 즉시 계산합니다.',
    href: '/tools/salary-calculator',
    icon: Calculator,
    iconColor: 'text-emerald-400 bg-emerald-500/10',
    highlight: '연봉 2,400만~1억5천 50개 구간 실수령액',
  },
  {
    id: 'youth-leap-calculator',
    title: '청년도약계좌 5년 5,000만원 만기 계산기',
    category: 'income',
    categoryLabel: '소득 · 은퇴',
    badge: '청년 1위',
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    description: '월 최대 70만원 납입 시 정부기여금(월 최대 3.3만원)과 6.0% 비과세 이자 혜택을 합산하여 최종 5,000만원 만기 수령액을 역산합니다.',
    href: '/tools/youth-leap-calculator',
    icon: Coins,
    iconColor: 'text-amber-400 bg-amber-500/10',
    highlight: '정부기여금 매칭 · 6.0% 비과세 이자',
  },
  {
    id: 'retirement-calculator',
    title: '직장인 퇴직금 실수령액 & IRP 절세 계산기',
    category: 'income',
    categoryLabel: '소득 · 은퇴',
    badge: '퇴직 필수',
    badgeColor: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
    description: '근속연수와 최근 3개월 평균임금을 바탕으로 법정 퇴직금과 퇴직소득세, IRP 이전 시 30~40% 감면 혜택을 계산합니다.',
    href: '/tools/retirement-calculator',
    icon: PiggyBank,
    iconColor: 'text-teal-400 bg-teal-500/10',
    highlight: '법정 퇴직금 원천징수 · IRP 30% 감면',
  },
  {
    id: 'goal-wealth-calculator',
    title: '목표 자산 1억 · 10억 모으기 달성 계산기',
    category: 'income',
    categoryLabel: '소득 · 은퇴',
    badge: '종잣돈 모으기',
    badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    description: '월 저축액과 연평균 투자 수익률, 인플레이션을 반영하여 종잣돈 1억 및 10억 달성 소요 기간을 역산합니다.',
    href: '/tools/goal-wealth-calculator',
    icon: Target,
    iconColor: 'text-purple-400 bg-purple-500/10',
    highlight: '1억/10억 도달 기간 역산 · 월 저축액 추천',
  },

  // 4. 코인 · 가상경제
  {
    id: 'crypto-apy-calculator',
    title: '크립토 스테이킹 APY · APR 복리 변환기',
    category: 'crypto',
    categoryLabel: '코인 · 가상경제',
    badge: 'DeFi 1위',
    badgeColor: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
    description: '스테이킹 단리(APR)와 복리(APY) 상호 변환 및 일일 자동 재예치(Auto-compound)에 따른 1년 실질 수익을 시뮬레이션합니다.',
    href: '/tools/crypto-apy-calculator',
    icon: Coins,
    iconColor: 'text-teal-400 bg-teal-500/10',
    highlight: 'APR ↔ APY 변환 · 일일 재예치 복리',
  },
  {
    id: 'compound-calculator',
    title: '복리 적금 · 예금 72법칙 이자 계산기',
    category: 'crypto',
    categoryLabel: '코인 · 가상경제',
    badge: '인기 1위',
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    description: '원금이 2배가 되는 72법칙과 일/월/연 단위 복리 이자 그래프를 시뮬레이션하여 단리 대비 초과 수익을 역산합니다.',
    href: '/tools/compound-calculator',
    icon: Landmark,
    iconColor: 'text-amber-400 bg-amber-500/10',
    highlight: '72법칙 원금 2배 기간 · 일/월복리',
  },
  {
    id: 'farming-calculator',
    title: '직업별 일일 파밍 수익 시뮬레이터',
    category: 'crypto',
    categoryLabel: '코인 · 가상경제',
    badge: '가상경제 특화',
    badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    description: '개발자, 트레이더, 광부, 요리사 등 전문 직업군 숙련도별 일일 WLD 기대 급여 및 시간당 효율을 계산합니다.',
    href: '/tools/farming-calculator',
    icon: Calculator,
    iconColor: 'text-rose-400 bg-rose-500/10',
    highlight: '직업군 숙련도별 WLD 시급 분석',
  },
];

interface HomeDualSurfaceProps {
  readonly children: React.ReactNode; // 기존 Bento Cockpit 및 가상 거래소 원본 JSX
}

export function HomeDualSurface({ children }: HomeDualSurfaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  // URL 파라미터가 'exchange'이면 가상 거래소 탭, 없거나 'tools'이면 금융 계산기 탭(기본)
  const [activeTab, setActiveTab] = React.useState<'tools' | 'exchange'>(
    tabParam === 'exchange' ? 'exchange' : 'tools'
  );

  const [filterCategory, setFilterCategory] = React.useState<'all' | 'stock' | 'tax' | 'income' | 'crypto'>('all');

  // 미니 인라인 즉석 복리 계산기 상태 (1초 데모 체험용)
  const [quickPrincipal, setQuickPrincipal] = React.useState<number>(10000000); // 1,000만원
  const [quickRate, setQuickRate] = React.useState<number>(7); // 연 7%
  const [quickYears, setQuickYears] = React.useState<number>(5); // 5년

  const quickResult = React.useMemo(() => {
    // 월복리 계산 공식: P * (1 + r/12)^(12 * t)
    const r = quickRate / 100;
    const n = 12;
    const finalAmount = quickPrincipal * Math.pow(1 + r / n, n * quickYears);
    const totalInterest = finalAmount - quickPrincipal;
    const simpleInterest = quickPrincipal * r * quickYears;
    const compoundBonus = totalInterest - simpleInterest;
    return {
      finalAmount: Math.round(finalAmount),
      totalInterest: Math.round(totalInterest),
      compoundBonus: Math.round(compoundBonus),
    };
  }, [quickPrincipal, quickRate, quickYears]);

  // 탭 변경 시 상태 및 URL 동기화
  const handleTabChange = (newTab: 'tools' | 'exchange') => {
    setActiveTab(newTab);
    const url = new URL(window.location.href);
    if (newTab === 'exchange') {
      url.searchParams.set('tab', 'exchange');
    } else {
      url.searchParams.delete('tab');
    }
    window.history.replaceState({}, '', url.toString());
  };

  const filteredTools = React.useMemo(() => {
    if (filterCategory === 'all') return FINANCIAL_CALCULATORS;
    return FINANCIAL_CALCULATORS.filter((tool) => tool.category === filterCategory);
  }, [filterCategory]);

  return (
    <div className="space-y-6">
      {/* =========================================================================
          🔥 DUAL TRACK MASTER SWITCHER (고대비 듀얼 탭 스위처)
          ========================================================================= */}
      <div className="rounded-3xl border border-[#222738] bg-[#0E1117] p-2.5 sm:p-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* TAB 1: 실전 금융 계산기 허브 (기본) */}
          <button
            type="button"
            onClick={() => handleTabChange('tools')}
            className={`group relative flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl text-left transition-all duration-300 ${
              activeTab === 'tools'
                ? 'bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent border border-emerald-500/50 shadow-[0_0_24px_rgba(0,245,155,0.15)]'
                : 'border border-transparent hover:border-[#222738] hover:bg-[#121622]'
            }`}
          >
            <div
              className={`grid size-11 shrink-0 place-items-center rounded-2xl transition-colors ${
                activeTab === 'tools'
                  ? 'bg-[#00F59B] text-black font-black shadow-md'
                  : 'bg-[#181E2C] text-zinc-400 group-hover:text-zinc-200'
              }`}
            >
              <Calculator className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold text-zinc-100">
                  실전 금융 계산기 허브
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-[#00F59B] border border-emerald-500/30">
                  1초 무료 · 19종
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate mt-0.5">
                복리·물타기·양도세·연봉·청년도약 무로그인 즉시 계산
              </p>
            </div>
            {activeTab === 'tools' && (
              <span className="hidden sm:flex size-2 rounded-full bg-[#00F59B] animate-pulse" />
            )}
          </button>

          {/* TAB 2: 가상 주식 거래소 & 디스코드 경제 */}
          <button
            type="button"
            onClick={() => handleTabChange('exchange')}
            className={`group relative flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl text-left transition-all duration-300 ${
              activeTab === 'exchange'
                ? 'bg-gradient-to-r from-blue-500/20 via-blue-500/10 to-transparent border border-blue-500/50 shadow-[0_0_24px_rgba(59,130,246,0.15)]'
                : 'border border-transparent hover:border-[#222738] hover:bg-[#121622]'
            }`}
          >
            <div
              className={`grid size-11 shrink-0 place-items-center rounded-2xl transition-colors ${
                activeTab === 'exchange'
                  ? 'bg-blue-500 text-black font-black shadow-md'
                  : 'bg-[#181E2C] text-zinc-400 group-hover:text-zinc-200'
              }`}
            >
              <TrendingUp className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold text-zinc-100">
                  가상 주식 거래소 & 디스코드 경제
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-blue-400 border border-blue-500/30">
                  모의투자 10-Depth
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate mt-0.5">
                실시간 10단 호가창 · 직업 파밍 · 암시장 경매 · 1:1 아레나
              </p>
            </div>
            {activeTab === 'exchange' && (
              <span className="hidden sm:flex size-2 rounded-full bg-blue-400 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: 실전 금융 계산기 허브 (검색자 1초 유입 & 고단가 광고 수익화)
          ========================================================================= */}
      {activeTab === 'tools' && (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
          {/* Top Quick Hook: 1초 인라인 복리 계산기 & 애드센스 고단가 광고 슬롯 */}
          <section className="relative overflow-hidden rounded-3xl border border-[#222738] bg-[#0E1117] p-5 sm:p-7 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#222738]/80">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-amber-400" />
                <h2 className="text-sm font-bold text-zinc-100">
                  1초 즉석 복리 시뮬레이터 (로그인 없이 바로 계산)
                </h2>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                ⚡ 100% 무료 · 즉시 결과
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 items-center">
              {/* Left Controls (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-300 mb-1.5">
                    <span>초기 원금</span>
                    <span className="font-mono text-[#00F59B]">{quickPrincipal.toLocaleString()}원</span>
                  </div>
                  <input
                    type="range"
                    min={1000000}
                    max={100000000}
                    step={1000000}
                    value={quickPrincipal}
                    onChange={(e) => setQuickPrincipal(Number(e.target.value))}
                    className="w-full accent-[#00F59B] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-zinc-400 mt-1">
                    <span>100만원</span>
                    <span>5,000만원</span>
                    <span>1억원</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-zinc-300 mb-1.5">
                      <span>연 기대 수익률</span>
                      <span className="font-mono text-amber-400">{quickRate}%</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={30}
                      step={0.5}
                      value={quickRate}
                      onChange={(e) => setQuickRate(Number(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400 mt-1">
                      <span>1% (안전자산)</span>
                      <span>30% (주식/코인)</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-zinc-300 mb-1.5">
                      <span>거치 기간</span>
                      <span className="font-mono text-blue-400">{quickYears}년</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={30}
                      step={1}
                      value={quickYears}
                      onChange={(e) => setQuickYears(Number(e.target.value))}
                      className="w-full accent-blue-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400 mt-1">
                      <span>1년</span>
                      <span>30년</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Verdict Box (5 cols) */}
              <div className="lg:col-span-5 rounded-2xl border border-[#222738] bg-[#121622] p-5 space-y-3">
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  {quickYears}년 후 만기 예상 수령액 (월복리)
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-black text-[#00F59B] tabular-nums">
                  {quickResult.finalAmount.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-zinc-400">원</span>
                </div>
                <div className="pt-2 border-t border-[#222738] space-y-1.5 text-xs">
                  <div className="flex justify-between text-zinc-300">
                    <span className="text-zinc-400">순수 복리 이자</span>
                    <span className="font-mono font-bold text-zinc-100">
                      +{quickResult.totalInterest.toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span className="text-zinc-400">단리 대비 초과 수익</span>
                    <span className="font-mono font-bold text-amber-400">
                      +{quickResult.compoundBonus.toLocaleString()}원
                    </span>
                  </div>
                </div>
                <Button
                  asChild
                  className="w-full h-9 rounded-xl font-bold text-xs bg-emerald-500/20 text-[#00F59B] border border-emerald-500/30 hover:bg-emerald-500/30"
                >
                  <Link href="/tools/compound-calculator">
                    상세 72법칙 & 세후 수령액 계산기 열기
                    <ArrowRight className="size-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* 계산기 결과 직하단 고단가 애드센스 광고 슬롯 */}
            <div className="mt-5 pt-4 border-t border-[#222738]/80">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-2">
                <span>SPONSORED FINANCE · 맞춤형 금융 혜택</span>
                <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-[9px]">AD</span>
              </div>
              <InArticleAdvertisement className="min-h-[90px] rounded-2xl overflow-hidden bg-[#121622]/50 border border-[#222738]" />
            </div>
          </section>

          {/* CPA 제휴 배너 & 가상 주식 거래소 1만 WLD 보너스 유입 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Banner 1: 비대면 증권 계좌 제휴 배너 */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-[#0E1526] to-[#0A0D14] p-5 sm:p-6 shadow-xs">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[11px] font-mono font-bold text-blue-400 border border-blue-500/30">
                    <Coins className="size-3" /> 증권사 비대면 계좌 개설
                  </span>
                  <Badge className="bg-blue-500 text-black text-[10px] font-black">
                    수수료 평생 우대
                  </Badge>
                </div>
                <h3 className="text-base font-extrabold text-zinc-100 group-hover:text-blue-400 transition-colors">
                  국내 · 미국주식 실전 거래 시작하기
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  국내주식 수수료 평생 우대 및 미국주식 환전 우대 95% 혜택. 비대면 3분 계좌 개설 완료 시 주식 쿠폰 즉시 지급.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#222738] flex items-center justify-between text-xs font-bold text-blue-400">
                <span>증권사 공식 비대면 이벤트 확인</span>
                <ExternalLink className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* Banner 2: 가상 주식 거래소 1만 WLD 즉시 지급 유입 배너 */}
            <button
              type="button"
              onClick={() => handleTabChange('exchange')}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-[#0E1D19] to-[#0A0D14] p-5 sm:p-6 shadow-xs text-left cursor-pointer"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-mono font-bold text-[#00F59B] border border-emerald-500/30">
                    <Sparkles className="size-3" /> 신규 가입 혜택
                  </span>
                  <Badge className="bg-[#00F59B] text-black text-[10px] font-black">
                    10,000 WLD 무료
                  </Badge>
                </div>
                <h3 className="text-base font-extrabold text-zinc-100 group-hover:text-[#00F59B] transition-colors">
                  모의투자 10단 호가창 즉시 체험 (+1만 WLD)
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  실제 돈 0원, 위험 0%. 회원가입 시 즉시 10,000 WLD를 지급받아 10대 가상 기업의 실시간 10단 호가창에서 주식 모의투자를 경험하세요.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#222738] flex items-center justify-between text-xs font-bold text-[#00F59B]">
                <span>가상 주식 거래소 탭으로 즉시 이동</span>
                <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>

          {/* 19종 금융 계산기 카테고리 필터 & 대화형 카드 그리드 */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-zinc-100">
                  전체 금융 계산기 카탈로그 (19종)
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  궁금한 계산기를 클릭하면 회원가입 없이 1초 만에 무료로 이용할 수 있습니다.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5 bg-[#0E1117] p-1 rounded-2xl border border-[#222738]">
                {[
                  { key: 'all', label: '전체 (19)' },
                  { key: 'stock', label: '주식·투자 (5)' },
                  { key: 'tax', label: '절세·부동산 (6)' },
                  { key: 'income', label: '소득·은퇴 (5)' },
                  { key: 'crypto', label: '코인·가상경제 (3)' },
                ].map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setFilterCategory(cat.key as any)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      filterCategory === cat.key
                        ? 'bg-[#00F59B] text-black shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#181E2C]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 19종 카드 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.id}
                    href={tool.href}
                    className="group relative flex flex-col justify-between rounded-3xl border border-[#222738] bg-[#0E1117] hover:border-[#00F59B]/50 hover:bg-[#121622] p-5 transition-all shadow-xs active:scale-[0.99]"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className={`p-2.5 rounded-2xl ${tool.iconColor}`}>
                          <Icon className="size-5" />
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${tool.badgeColor}`}
                        >
                          {tool.badge}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-sm sm:text-base font-extrabold text-zinc-100 group-hover:text-[#00F59B] transition-colors leading-snug">
                          {tool.title}
                        </h3>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                          {tool.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#222738]/60 text-[11px] font-mono font-medium text-emerald-400/90 flex items-center gap-1.5">
                        <CheckCircle2 className="size-3 text-[#00F59B] shrink-0" />
                        <span className="truncate">{tool.highlight}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#222738]/60 flex items-center justify-between text-xs font-bold text-[#00F59B]">
                      <span>1초 무료 계산하기</span>
                      <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* 하단 고단가 멀티플렉스 애드센스 슬롯 */}
          <div className="rounded-3xl border border-[#222738] bg-[#0E1117] p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#222738]/70 text-xs font-bold text-zinc-400">
              <span>추천 금융 콘텐츠 & 스폰서</span>
              <span className="font-mono text-[10px]">SPONSORED</span>
            </div>
            <div className="pt-4">
              <PublicAdvertisement variant="multiplex" className="min-h-[140px] rounded-2xl" />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: 가상 주식 거래소 & 디스코드 경제 (기존 모든 기능 100% 온전히 보존)
          ========================================================================= */}
      {activeTab === 'exchange' && (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
          {children}
        </div>
      )}
    </div>
  );
}
