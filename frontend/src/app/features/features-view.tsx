'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Landmark,
  Briefcase,
  Building2,
  Calculator,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  CheckCircle2,
  Flame,
  Layers,
  ShieldCheck,
  Zap,
  BarChart3,
  Coins,
  ArrowRight,
  Eye,
  Activity,
  Award,
  Search,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/components/locale-provider';
import { InArticleAdvertisement, MultiplexAdvertisement } from '@/components/public-advertisement';
import { InvestorProfileQuiz } from '@/components/investor-profile-quiz';

interface FeatureSection {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly badge: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly accentColor: string;
  readonly livePath: string;
  readonly ctaLabel: string;
  readonly description: string;
  readonly steps: readonly {
    readonly num: string;
    readonly title: string;
    readonly desc: string;
    readonly highlight?: string;
  }[];
  readonly callouts: readonly {
    readonly pin: string;
    readonly label: string;
    readonly desc: string;
  }[];
}

const FEATURE_DATA: readonly FeatureSection[] = [
  {
    id: 'stock-exchange',
    title: 'WDX 가상 주식 거래소 & 10-Depth 호가창',
    subtitle: '실시간 체결 엔진과 10단계 매수/매도 잔량 호가창으로 즐기는 실전 모의 주식 투자',
    badge: '실시간 거래소',
    icon: TrendingUp,
    accentColor: 'emerald',
    livePath: '/stocks',
    ctaLabel: '주식 거래소 입장하기',
    description:
      '침팬지 반도체, 월덕 인더스트리, AI 테크놀로지 등 18대 WDX 상장 종목의 실시간 시세를 조회하고, 10단계 호가창을 분석하여 0.1초 만에 지정가 및 시장가 주문을 체결할 수 있습니다.',
    steps: [
      {
        num: '01',
        title: '종목 탐색 및 시장 심리 분석',
        desc: '18대 WDX 상장 종목 중 관심 종목을 선택하고 실시간 AI 감성 지수와 기업 공시 속보를 확인합니다.',
        highlight: '18개 상장사 실시간 공시 연동',
      },
      {
        num: '02',
        title: '10-Depth 호가창 스프레드 확인',
        desc: '매수/매도 10단계 잔량 깊이(Depth)와 누적 체결량을 확인하여 최적의 진입 가격대를 설정합니다.',
        highlight: '실시간 호가 잔량 바 시각화',
      },
      {
        num: '03',
        title: '지정가 및 시장가 원터치 주문',
        desc: '보유 자금에 맞춰 25% / 50% / 100% 퀵 프리셋 버튼을 활용해 0.1초 만에 매수·매도 주문을 체결합니다.',
        highlight: '지정가 & 시장가 즉시 체결',
      },
      {
        num: '04',
        title: '포트폴리오 진단 & 매매일지 기록',
        desc: 'HHI 지수 기반 3섹터 분산 투자를 점검하고 매매 근거와 심리 상태를 거래일지(Trade Diary)에 복기합니다.',
        highlight: '허핀달-허쉬만(HHI) 자산 진단',
      },
    ],
    callouts: [
      { pin: '①', label: '10-Depth 실시간 호가', desc: '매수/매도 10단계 가격대별 물량 잔량을 한눈에 파악' },
      { pin: '②', label: '1초 퀵 주문 패널', desc: '지정가/시장가 슬라이더 및 보유 자금 % 원클릭 베팅' },
      { pin: '③', label: '기업 공시 속보 티커', desc: '신제품 출시, 자사주 소각 등 주가 직결 공시 실시간 브로드캐스트' },
      { pin: '④', label: '자산 집중도 진단기', desc: '3개 섹터 이상 분산 시 보너스 XP 및 리밸런싱 가이드 제공' },
    ],
  },
  {
    id: 'virtual-banking',
    title: '중앙은행 스마트 복리 포켓 & 가상 국채',
    subtitle: '일일 복리로 불어나는 안정적인 이자 수익과 7일·30일·90일 정기 예적금 시스템',
    badge: '안전 자산',
    icon: Landmark,
    accentColor: 'cyan',
    livePath: '/bank',
    ctaLabel: '중앙은행 금고 열기',
    description:
      '중앙은행의 스마트 복리 포켓을 통해 여유 자금을 예치하고 매일 자정에 원금과 누적 이자에 복리로 이자가 붙는 스노우볼 효과를 직접 경험하세요.',
    steps: [
      {
        num: '01',
        title: '예치 기간 및 복리 플랜 선택',
        desc: '7일(연 4.5%), 30일(연 7.2%), 90일(연 12.0%) 중 자금 운용 계획에 맞는 최적의 복리 포켓을 선택합니다.',
        highlight: '최대 연 12.0% 복리 플랜',
      },
      {
        num: '02',
        title: '스마트 포켓 자금 예치',
        desc: '지갑의 여유 WLD를 입력하여 포켓을 개설하면 즉시 일일 복리 이자 카운팅이 시작됩니다.',
        highlight: '언제든 원금 안심 보관',
      },
      {
        num: '03',
        title: '실시간 일일 복리 이자 수령',
        desc: '매일 누적되는 이자를 확인하고 [원클릭 이자 수령] 버튼을 눌러 수익금을 즉시 지갑으로 인출합니다.',
        highlight: '매일 자정 복리 정산 & 즉시 인출',
      },
      {
        num: '04',
        title: '만기 도래 시 자동 원리금 정산',
        desc: '약정 만기 도래 시 원금과 보너스 만기 이자가 자동으로 결산되어 지갑으로 지급됩니다.',
        highlight: '만기 시 원리금 100% 자동 입금',
      },
    ],
    callouts: [
      { pin: '①', label: '실시간 복리 게이지', desc: '현재까지 누적된 이자와 다음 이자 지급까지 남은 시간 카운트다운' },
      { pin: '②', label: '3대 정기 플랜 카드', desc: '7일/30일/90일 약정 기간별 우대 금리 및 만기 예상 수령액 비교' },
      { pin: '③', label: '원클릭 이자 수령', desc: '지갑으로 즉시 이자를 청구하여 주식 투자나 부동산 매수에 재투자' },
    ],
  },
  {
    id: 'career-farming',
    title: '직업 커리어 & 실시간 일일 파밍 루틴',
    subtitle: '5대 전문 직업 수행과 에너지 충전을 통한 안정적인 일일 WLD 현금흐름 창출',
    badge: '일일 수익',
    icon: Briefcase,
    accentColor: 'amber',
    livePath: '/work',
    ctaLabel: '직업 업무 시작하기',
    description:
      '핀테크 개발자, 퀀트 트레이더, 부동산 디벨로퍼 등 5대 전문 직업을 선택하고 업무를 완수하여 기본 급여, 숙련도 XP, 희귀 드랍 아이템을 획득하세요.',
    steps: [
      {
        num: '01',
        title: '적성에 맞는 5대 전문 직업 선택',
        desc: '개발자(안정형), 트레이더(수익형), 디벨로퍼(부동산 특화) 중 원하는 커리어 트랙을 결정합니다.',
        highlight: '5대 전문 직무 라이선스',
      },
      {
        num: '02',
        title: '집중 업무 세션 시작',
        desc: '[업무 시작] 버튼을 클릭하여 정해진 시간 동안 실시간 업무를 수행하고 에너지를 소모합니다.',
        highlight: '에너지 관리 및 자동 업무 완료',
      },
      {
        num: '03',
        title: '급여 및 숙련도 보너스 수령',
        desc: '업무 완료 시 기본 WLD 급여와 함께 커리어 숙련도 XP, 제작 재료 아이템을 일괄 수령합니다.',
        highlight: '급여 + 숙련도 XP 동시 획득',
      },
      {
        num: '04',
        title: '직급 승진 및 파밍 효율 극대화',
        desc: '인턴에서 시작해 주니어, 시니어, 임원까지 승진하여 일일 파밍 수익을 최대 17배까지 증폭시킵니다.',
        highlight: '최대 17배 임원 승진 시스템',
      },
    ],
    callouts: [
      { pin: '①', label: '실시간 업무 타이머', desc: '현재 진행 중인 업무의 잔여 시간과 에너지 소모 상태 모니터링' },
      { pin: '②', label: '직급 승진 프로그레스', desc: '숙련도 달성률에 따른 다음 직급 해금 및 급여 배수 상승' },
      { pin: '③', label: '희귀 재료 드랍 보상', desc: '아이템 상점 및 마켓플레이스 경매에서 고가에 거래되는 재료 획득' },
    ],
  },
  {
    id: 'real-estate',
    title: '가상 부동산 메가시티 랜드 분양 & 임대 수익',
    subtitle: '강남·여의도·판교 등 8대 핵심 상권의 토지를 소유하고 매일 패시브 임대료 수령',
    badge: '패시브 인컴',
    icon: Building2,
    accentColor: 'indigo',
    livePath: '/spaces/real-estate',
    ctaLabel: '가상 랜드 분양소 가기',
    description:
      '메가시티 8대 도시 구역의 랜드와 오피스를 분양받아 소유권을 증명하고, 리모델링과 전시품 인테리어를 통해 Cap Rate(순수익률)를 극대화하세요.',
    steps: [
      {
        num: '01',
        title: '8대 핵심 상권 도시 구역 탐색',
        desc: '강남 테헤란로, 여의도 금융가, 판교 테크노밸리, 성수 아뜰리에 등 입지별 임대 수익률을 분석합니다.',
        highlight: '8대 도시 핵심 상권 지원',
      },
      {
        num: '02',
        title: '원터치 분양 및 P2P 경매 입찰',
        desc: '신규 랜드 부지를 분양받거나 경매장에서 프리미엄 입지의 펜트하우스와 오피스를 낙찰받습니다.',
        highlight: '블록체인 영구 소유권 인증',
      },
      {
        num: '03',
        title: '공간 확장 및 테마 리모델링',
        desc: '바닥 면적 확장과 가구/트로피 전시 슬롯을 늘려 방문자 유입과 임대 가치를 업그레이드합니다.',
        highlight: '인테리어 쇼룸 및 가치 상승',
      },
      {
        num: '04',
        title: '일일 패시브 임대료 자동 수령',
        desc: '입주 기업 및 세입자로부터 매일 자동으로 정산되는 가상 임대료를 수령하여 안정적인 부를 축적합니다.',
        highlight: '매일 자정 패시브 임대료 입금',
      },
    ],
    callouts: [
      { pin: '①', label: '8대 도시 구역 맵', desc: '강남/판교/여의도 등 지역별 평균 Cap Rate와 공실률 실시간 확인' },
      { pin: '②', label: '실시간 임대료 청구함', desc: '보유 부동산에서 발생한 일일 누적 월세를 원클릭으로 지갑 수령' },
      { pin: '③', label: '공간 커스터마이징', desc: '바닥재, 조명, 트로피 진열대를 취향대로 꾸미는 3D 인테리어' },
    ],
  },
  {
    id: 'financial-calculators',
    title: '5대 고수익 금융 계산기 & 1초 바이럴 카드',
    subtitle: '물타기, 복리 이자, 부동산 Cap Rate, 김치프리미엄, 해외주식 양도세를 0.1초 만에 진단',
    badge: '핀테크 도구',
    icon: Calculator,
    accentColor: 'rose',
    livePath: '/tools',
    ctaLabel: '5대 계산기 전체 보기',
    description:
      '엑셀 없이 0.1초 만에 계산되는 고정밀 금융 도구를 활용해 최적의 투자 전략을 세우고, 예쁜 진단서 이미지를 카카오톡/디스코드에 1초 만에 공유하세요.',
    steps: [
      {
        num: '01',
        title: '목적에 맞는 금융 계산기 선택',
        desc: '물타기 평단가, 1억 복리 적금, 부동산 월세 ROE, 김프 차익, 양도세 절세 계산기 중 선택합니다.',
        highlight: '5대 고수요 롱테일 도구 완비',
      },
      {
        num: '02',
        title: '투자 조건 및 실시간 프리셋 적용',
        desc: '삼성전자 -20%, 엔비디아 익절 등 실시간 인기 프리셋을 클릭하거나 본인의 금액을 입력합니다.',
        highlight: '300+개 종목별 롱테일 프리셋',
      },
      {
        num: '03',
        title: '0.1초 즉시 정밀 진단 확인',
        desc: '손익분기점, 레버리지 ROE, 비과세 공제 후 실수령액, 원금 회수 기간 등의 결과를 즉시 분석합니다.',
        highlight: '세후 실수령액 및 ROE 실시간 산출',
      },
      {
        num: '04',
        title: '1초 SNS/오픈채팅 바이럴 공유',
        desc: '[진단서 공유하기] 버튼을 눌러 고화질 카드 이미지를 클립보드에 복사하거나 카카오톡에 바로 전송합니다.',
        highlight: '1080x1080 고화질 캔버스 카드 생성',
      },
    ],
    callouts: [
      { pin: '①', label: '실시간 프리셋 원클릭', desc: '대형주/비트코인/강남오피스 등 인기 시나리오를 0.1초 만에 로드' },
      { pin: '②', label: '핵심 지표 요약 카드', desc: 'ROE, 손익분기 탈출가, 절세 금액을 한눈에 보기 쉽게 시각화' },
      { pin: '③', label: '1초 SNS 공유 버튼', desc: '워터마크 없는 깔끔한 핀테크 진단서 이미지를 원터치 캡처/공유' },
    ],
  },
  {
    id: 'dopamine-arcade',
    title: '도파민 아케이드 미니게임 & 럭키 룰렛',
    subtitle: 'Web Audio 사운드와 하드웨어 가속 연출이 결합된 건전하고 짜릿한 가상 엔터테인먼트',
    badge: '엔터테인먼트',
    icon: Sparkles,
    accentColor: 'amber',
    livePath: '/casino',
    ctaLabel: '아케이드 스테이션 입장',
    description:
      '3릴 클래식 슬롯머신, 3D 카드 플립 하이로우, 매일 무료로 주어지는 일일 럭키 룰렛을 돌려 최대 100배의 대박 잭팟 보상을 획득하세요.',
    steps: [
      {
        num: '01',
        title: '일일 무료 럭키 룰렛 스핀',
        desc: '매일 1회 무료로 주어지는 룰렛을 돌려 보너스 WLD와 경험치를 충전하고 시작합니다.',
        highlight: '매일 24시간 무료 보너스 룰렛',
      },
      {
        num: '02',
        title: '슬롯머신 & 하이로우 종목 선택',
        desc: '레트로 기계식 3릴 슬롯머신이나 연승 배수가 쌓이는 3D 하이로우 게임 중 선택합니다.',
        highlight: 'Web Audio 무의존성 사운드 지원',
      },
      {
        num: '03',
        title: '베팅 칩 설정 및 스핀',
        desc: '100 WLD부터 10,000 WLD까지 원하는 칩을 설정하고 릴을 돌리거나 카드를 예측합니다.',
        highlight: 'CSS/SVG 60fps 잭팟 글로우 연출',
      },
      {
        num: '04',
        title: '잭팟 달성 및 자가 보호 쿨다운',
        desc: '승리 시 화려한 골드 컨페티와 함께 상금을 수령하고, 자가 한도 설정으로 건전한 플레이를 즐깁니다.',
        highlight: '최대 100배 잭팟 & 자가 보호 한도',
      },
    ],
    callouts: [
      { pin: '①', label: '3릴 기계식 슬롯', desc: '체리/세븐/골드바 3개가 일치하면 팡파레와 함께 대박 보상 지급' },
      { pin: '②', label: '하이로우 연속 배수', desc: 'High/Low 연속 적중 시 누적 배수가 기하급수적으로 증가' },
      { pin: '③', label: '사운드 & 음소거 토글', desc: '경쾌한 메탈릭 베팅음과 승리 효과음을 브라우저 내장 오디오로 재생' },
    ],
  },
];

export function FeaturesView() {
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<string>('stock-exchange');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const filteredFeatures = FEATURE_DATA.filter((feature) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      feature.title.toLowerCase().includes(query) ||
      feature.subtitle.toLowerCase().includes(query) ||
      feature.description.toLowerCase().includes(query) ||
      feature.badge.toLowerCase().includes(query) ||
      feature.steps.some((s) => s.title.toLowerCase().includes(query) || s.desc.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-16 py-6 sm:py-10">
      {/* 1. 히어로 섹션 */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-zinc-950 p-6 sm:p-10 shadow-2xl">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>2026 머니버스 공식 기능 & 사용법 가이드</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl font-sans">
            실제 화면으로 보는 <br className="hidden sm:inline" />
            <span className="text-emerald-400">6대 핀테크 가상 경제</span> 완벽 조작법
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl">
            가상 주식 거래소부터 중앙은행 복리 예금, 직업 파밍, 부동산 메가시티, 5대 계산기까지!
            실제 화면 스크린샷과 단계별 가이드로 1분 만에 마스터하고 나만의 금융 제국을 건설하세요.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              onClick={() => scrollToSection('stock-exchange')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold h-11 px-5 shadow-lg shadow-emerald-950/40"
            >
              기능별 사용법 살펴보기
              <ChevronRight className="ml-1.5 h-4 w-4" />
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 h-11 px-5"
            >
              <Link href="/roadmap">
                초·중·후반 로드맵 보기
                <ArrowUpRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* 실시간 가이드 검색 바 */}
        <div className="mt-8 border-t border-zinc-800/80 pt-6 space-y-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="궁금한 기능이나 키워드를 검색하세요 (예: 호가창, 복리, 랜드, 계산기)"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 pl-10 pr-10 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* 퀵 앵커 스크롤 바 */}
          <div className="flex flex-wrap gap-2">
            {FEATURE_DATA.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all border ${
                    isActive
                      ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-sm'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 hover:bg-zinc-850'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.badge}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. 6대 핵심 기능 상세 섹션 */}
      <div className="space-y-20">
        {filteredFeatures.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <section
              key={feature.id}
              id={feature.id}
              className="scroll-mt-24 space-y-6 rounded-2xl border border-zinc-800/90 bg-zinc-950 p-6 sm:p-8 shadow-xl"
            >
              {/* 기능 헤더 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Icon className="w-5 h-5" />
                    </span>
                    <Badge variant="outline" className="text-xs border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                      Feature 0{index + 1}
                    </Badge>
                    <span className="text-xs text-zinc-400 font-medium">| {feature.badge}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans">
                    {feature.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {feature.subtitle}
                  </p>
                </div>

                <Button
                  asChild
                  className="shrink-0 bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-emerald-500/30 font-semibold h-10 px-4"
                >
                  <Link href={feature.livePath}>
                    {feature.ctaLabel}
                    <ArrowRight className="ml-1.5 w-4 h-4" />
                  </Link>
                </Button>
              </div>

              {/* 실사형 UI 목업 프레임 & 핵심 조작 포인트 (Callout) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* 좌측: 실사형 UI 인터페이스 스크린샷 목업 (7열) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="relative rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-4 sm:p-5 shadow-2xl overflow-hidden">
                    {/* 브라우저 상단 마크 */}
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                        <span className="ml-2 text-[11px] font-mono text-zinc-400">
                          easy-scraping.com{feature.livePath}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        LIVE PREVIEW
                      </span>
                    </div>

                    {/* 인터페이스별 실사형 시각화 */}
                    {feature.id === 'stock-exchange' && (
                      <div className="space-y-3 font-mono text-xs">
                        <div className="flex justify-between items-center bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                          <div>
                            <span className="text-zinc-200 font-bold">WDX-TEC 침팬지 반도체</span>
                            <span className="text-[10px] text-zinc-400 block">AI 고대역폭 메모리 설계</span>
                          </div>
                          <div className="text-right">
                            <span className="text-emerald-400 font-bold text-sm">74,200 WLD</span>
                            <span className="text-[10px] text-emerald-400 block">+4.8% ▲</span>
                          </div>
                        </div>

                        {/* 10-Depth 호가창 미니 뷰 */}
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="space-y-1 bg-rose-950/20 p-2.5 rounded-lg border border-rose-900/30">
                            <div className="text-[10px] text-rose-400 font-bold mb-1">매도 호가 잔량 (Ask)</div>
                            <div className="flex justify-between text-rose-300">
                              <span>74,500</span> <span className="text-zinc-400">1,240주</span>
                            </div>
                            <div className="flex justify-between text-rose-300">
                              <span>74,400</span> <span className="text-zinc-400">2,890주</span>
                            </div>
                            <div className="flex justify-between text-rose-300 font-bold">
                              <span>74,300</span> <span className="text-zinc-300">4,150주</span>
                            </div>
                          </div>
                          <div className="space-y-1 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-900/30">
                            <div className="text-[10px] text-emerald-400 font-bold mb-1">매수 호가 잔량 (Bid)</div>
                            <div className="flex justify-between text-emerald-300 font-bold">
                              <span>74,200</span> <span className="text-zinc-300">5,420주</span>
                            </div>
                            <div className="flex justify-between text-emerald-300">
                              <span>74,100</span> <span className="text-zinc-400">3,120주</span>
                            </div>
                            <div className="flex justify-between text-emerald-300">
                              <span>74,000</span> <span className="text-zinc-400">8,900주</span>
                            </div>
                          </div>
                        </div>

                        {/* 퀵 주문 바 */}
                        <div className="flex gap-2 pt-1">
                          <button className="flex-1 bg-emerald-600/90 text-white font-bold py-2 rounded-lg text-center text-xs">
                            지정가 매수 (74,200)
                          </button>
                          <button className="flex-1 bg-rose-600/90 text-white font-bold py-2 rounded-lg text-center text-xs">
                            지정가 매도
                          </button>
                        </div>
                      </div>
                    )}

                    {feature.id === 'virtual-banking' && (
                      <div className="space-y-3 font-mono text-xs">
                        <div className="p-3.5 rounded-lg bg-cyan-950/30 border border-cyan-900/40 flex justify-between items-center">
                          <div>
                            <span className="text-xs font-bold text-cyan-300">30일 스마트 복리 포켓</span>
                            <span className="text-[10px] text-zinc-400 block">연 7.2% 일일 복리 이자</span>
                          </div>
                          <div className="text-right">
                            <span className="text-base font-bold text-white">5,000,000 WLD</span>
                            <span className="text-[10px] text-cyan-400 block">원금 예치 중</span>
                          </div>
                        </div>

                        <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-2">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-zinc-400">누적 수령 이자</span>
                            <span className="text-emerald-400 font-bold">+29,589 WLD</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-zinc-400">다음 복리 정산까지</span>
                            <span className="text-zinc-300">03시간 42분 남음</span>
                          </div>
                          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-cyan-500 h-full w-3/4 rounded-full" />
                          </div>
                        </div>

                        <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded-lg text-center text-xs">
                          일일 복리 이자 즉시 수령 (+29,589 WLD)
                        </button>
                      </div>
                    )}

                    {feature.id === 'career-farming' && (
                      <div className="space-y-3 font-mono text-xs">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-amber-950/30 border border-amber-900/40">
                          <div>
                            <span className="text-xs font-bold text-amber-300">핀테크 수석 개발자 (Senior)</span>
                            <span className="text-[10px] text-zinc-400 block">기본 시급 12,500 WLD</span>
                          </div>
                          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40">Lv.14 임원 승진권</Badge>
                        </div>

                        <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-2">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-zinc-400">현재 업무: 알고리즘 백테스팅</span>
                            <span className="text-amber-400 font-bold">진행 중 (85%)</span>
                          </div>
                          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full w-[85%] rounded-full animate-pulse" />
                          </div>
                          <div className="flex justify-between text-[10px] text-zinc-400">
                            <span>에너지 소모: 15 / 100</span>
                            <span>보상: 37,500 WLD + 150 XP</span>
                          </div>
                        </div>

                        <button className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-lg text-center text-xs">
                          업무 완료 & 급여 일괄 수령
                        </button>
                      </div>
                    )}

                    {feature.id === 'real-estate' && (
                      <div className="space-y-3 font-mono text-xs">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-indigo-950/30 border border-indigo-900/40">
                          <div>
                            <span className="text-xs font-bold text-indigo-300">강남 테헤란로 프라임 오피스 #104</span>
                            <span className="text-[10px] text-zinc-400 block">Cap Rate 연 7.2% | 공실률 0%</span>
                          </div>
                          <span className="text-xs font-bold text-emerald-400">+65,000 WLD/일</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                          <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800">
                            <span className="text-[10px] text-zinc-400 block">소유 랜드</span>
                            <span className="font-bold text-white">4개 구역</span>
                          </div>
                          <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800">
                            <span className="text-[10px] text-zinc-400 block">월 예상 임대료</span>
                            <span className="font-bold text-emerald-400">195만 WLD</span>
                          </div>
                          <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800">
                            <span className="text-[10px] text-zinc-400 block">자산 평가액</span>
                            <span className="font-bold text-white">3,200만 WLD</span>
                          </div>
                        </div>

                        <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg text-center text-xs">
                          오늘의 임대료 수령하기 (+65,000 WLD)
                        </button>
                      </div>
                    )}

                    {feature.id === 'financial-calculators' && (
                      <div className="space-y-3 font-mono text-xs">
                        <div className="p-3.5 rounded-lg bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-800">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-zinc-200">삼성전자 -20% 물타기 진단</span>
                            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40">손익분기 -8.4%</Badge>
                          </div>
                          <div className="text-2xl font-bold text-emerald-400 mt-1.5">평단가 68,500원</div>
                          <p className="text-[10px] text-zinc-400">추가 매수 50주 시 평단가 6,500원 인하</p>
                        </div>

                        <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-[11px] space-y-1">
                          <div className="flex justify-between">
                            <span className="text-zinc-400">필요 추가 매수금</span>
                            <span className="text-white font-bold">3,000,000원</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">탈출 필요 상승률</span>
                            <span className="text-emerald-400 font-bold">+8.4% 반등 시 본전</span>
                          </div>
                        </div>

                        <button className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 rounded-lg text-center text-xs flex items-center justify-center gap-1.5">
                          <span>카카오톡/디스코드 진단서 1초 공유</span>
                        </button>
                      </div>
                    )}

                    {feature.id === 'dopamine-arcade' && (
                      <div className="space-y-3 font-mono text-xs">
                        <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-900/30 text-center">
                          <span className="text-[10px] text-amber-400 font-bold tracking-wider uppercase block">
                            ★ 3-REEL CLASSIC JACKPOT ★
                          </span>
                          <div className="flex justify-center gap-3 my-2 text-2xl font-extrabold text-amber-300">
                            <span className="p-2 bg-zinc-950 rounded border border-amber-500/40 shadow-inner">7️⃣</span>
                            <span className="p-2 bg-zinc-950 rounded border border-amber-500/40 shadow-inner">7️⃣</span>
                            <span className="p-2 bg-zinc-950 rounded border border-amber-500/40 shadow-inner">7️⃣</span>
                          </div>
                          <span className="text-xs font-bold text-emerald-400">JACKPOT! 100배 보너스 당첨</span>
                        </div>

                        <div className="flex gap-2">
                          <button className="flex-1 bg-amber-600 text-white font-bold py-2 rounded-lg text-center text-xs">
                            스핀 돌리기 (1,000 WLD)
                          </button>
                          <button className="px-3 bg-zinc-800 text-zinc-300 font-bold py-2 rounded-lg text-xs">
                            사운드 ON
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 우측: 핵심 조작 포인트 콜아웃 (5열) */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="text-xs font-bold text-zinc-300 flex items-center gap-1.5 mb-2">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span>핵심 조작 포인트 (Key Interaction):</span>
                  </div>

                  {feature.callouts.map((callout) => (
                    <div
                      key={callout.pin}
                      className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-colors space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-emerald-400">{callout.pin}</span>
                        <span className="text-xs font-bold text-zinc-200">{callout.label}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 pl-5 leading-relaxed">{callout.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 단계별 사용 방법 (How-to 4단계 가이드) */}
              <div className="border-t border-zinc-800/80 pt-6">
                <div className="text-xs font-bold text-zinc-300 flex items-center gap-1.5 mb-4">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>단계별 마스터 가이드 (Step-by-Step Tutorial):</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {feature.steps.map((step) => (
                    <div
                      key={step.num}
                      className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 flex flex-col justify-between space-y-2 hover:border-zinc-700 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-xs font-extrabold text-emerald-400">
                            STEP {step.num}
                          </span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600" />
                        </div>
                        <div className="text-xs font-bold text-zinc-100 mb-1">{step.title}</div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">{step.desc}</p>
                      </div>

                      {step.highlight && (
                        <div className="pt-2 border-t border-zinc-800/60 text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          <span>{step.highlight}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* 인아티클 네이티브 광고 */}
      <InArticleAdvertisement className="my-8" />

      {/* 2.5. AI 맞춤형 투자 성향 진단기 */}
      <InvestorProfileQuiz />

      {/* 3. 자주 묻는 질문 (FAQ) 아코디언 */}
      <Card className="border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-xl space-y-6">
        <CardHeader className="p-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <CardTitle className="text-xl font-bold text-white">
              자주 묻는 질문 (FAQ & Troubleshooting)
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-zinc-400">
            머니버스 핀테크 기능 이용 중 가장 많이 묻는 핵심 질문을 확인하세요.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-1.5">
            <h3 className="font-bold text-zinc-200">Q. WLD 가상 자산은 어떻게 충전하거나 얻나요?</h3>
            <p className="text-zinc-400 leading-relaxed">
              [직업] 메뉴에서 일일 업무를 수행하거나, [중앙은행] 복리 포켓 이자 수령, [가상 부동산] 임대료 청구, [카지노] 일일 럭키 룰렛 스핀을 통해 매일 무료로 지속 획득할 수 있습니다.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-1.5">
            <h3 className="font-bold text-zinc-200">Q. 주식 호가창 체결은 실제 유저 간 거래인가요?</h3>
            <p className="text-zinc-400 leading-relaxed">
              네, 머니버스 WDX 거래소는 1,700명 이상의 활성 회원과 유동성 조성 AI(Market Maker)가 상호작용하는 10-Depth 실시간 오더북 호가 엔진으로 구동됩니다.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-1.5">
            <h3 className="font-bold text-zinc-200">Q. 5대 계산기는 회원가입 없이 무료로 쓸 수 있나요?</h3>
            <p className="text-zinc-400 leading-relaxed">
              네! 물타기, 복리, 부동산 월세, 김프, 양도세 계산기 모두 완전 무료이며, 비회원도 제한 없이 즉시 계산하고 SNS 바이럴 카드를 공유할 수 있습니다.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-1.5">
            <h3 className="font-bold text-zinc-200">Q. 가상 부동산을 구매하면 영구 소유가 되나요?</h3>
            <p className="text-zinc-400 leading-relaxed">
              네, 분양받거나 낙찰받은 랜드 및 오피스는 계정에 영구 귀속되며, 매일 자정에 패시브 임대료가 자동으로 원장에 누적됩니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 멀티플렉스 추천 광고 */}
      <MultiplexAdvertisement className="mt-12" />
    </div>
  );
}
