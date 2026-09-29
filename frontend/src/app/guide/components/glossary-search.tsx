'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  BookOpen,
  X,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TranslatedText as T } from '@/components/translated-text';

export interface GlossaryTerm {
  id: string;
  termKo: string;
  termEn: string;
  category: 'finance' | 'work' | 'system' | 'all';
  categoryLabel: string;
  summary: string;
  detail: string;
  relatedLink?: {
    href: string;
    label: string;
  };
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 'double-entry',
    termKo: '복식부기 원장',
    termEn: 'Double-Entry Ledger',
    category: 'finance',
    categoryLabel: '금융·투자',
    summary: '차변(Debit)과 대변(Credit)을 항상 100% 일치시켜 재화 유실을 원천 차단하는 회계 시스템.',
    detail:
      '머니버스의 모든 재화 변동(직업 급여, 상점 구매, 이자 지급, 주식 매매)은 두 개 이상의 계정 간에 동일한 금액으로 기록되어, 서버 장애나 동시 요청에서도 WLD가 공중에서 증발하거나 중복 생성되지 않습니다.',
    relatedLink: { href: '/wallet/activity', label: '원장 기록 보기' },
  },
  {
    id: 'idempotency',
    termKo: '멱등성 (Idempotency)',
    termEn: 'Idempotent Transactions',
    category: 'system',
    categoryLabel: '시스템·보안',
    summary: '네트워크 재시도로 동일한 요청이 여러 번 전송되어도 정확히 단 1회만 처리되는 통신 안전장치.',
    detail:
      '모바일 환경에서 인터넷이 끊겨 송금이나 결제 버튼을 여러 번 누르더라도, 클라이언트가 발행한 고유 Idempotency-Key를 통해 단 1건의 트랜잭션만 실행되고 중복 인출이 완벽히 방지됩니다.',
    relatedLink: { href: '/guide', label: '가이드 홈' },
  },
  {
    id: 'orderbook-10d',
    termKo: '10-Depth 실시간 호가창',
    termEn: '10-Depth Orderbook',
    category: 'finance',
    categoryLabel: '금융·투자',
    summary: '최우선 10단계 매수/매도 주문 잔량과 가격을 실시간으로 시각화한 가상 주식 거래소 콘솔.',
    detail:
      '월덕거래소에서 10대 가상 상장사의 실시간 매수/매도 압력 비율과 스프레드를 확인하고 지정가 및 시장가 주문을 60fps 반응 속도로 실행할 수 있습니다.',
    relatedLink: { href: '/stocks', label: '거래소 바로가기' },
  },
  {
    id: 'spread',
    termKo: '스프레드 (Bid-Ask Spread)',
    termEn: 'Bid-Ask Spread',
    category: 'finance',
    categoryLabel: '금융·투자',
    summary: '최우선 매도 호가(Ask)와 최우선 매수 호가(Bid) 간의 가격 차이.',
    detail:
      '스프레드가 좁을수록 거래 유동성이 풍부하여 원하는 가격에 즉시 체결하기 유리하며, 스프레드가 넓을 때는 지정가 주문을 활용해 유리한 가격을 선점하는 것이 좋습니다.',
    relatedLink: { href: '/stocks', label: '호가창 확인' },
  },
  {
    id: 'daily-compound',
    termKo: '일일 복리 이자',
    termEn: 'Daily Compounding Interest',
    category: 'finance',
    categoryLabel: '금융·투자',
    summary: '매일 발생한 이자가 익일 원금에 자동 합산되어 자산이 기하급수적으로 불어나는 저축 구조.',
    detail:
      '가상 은행 복리 예금은 일 단위 0.5% 복리 이자가 누적되며, 사용자가 [누적 이자 정산]을 누르면 원장에 즉시 확정 반영됩니다.',
    relatedLink: { href: '/bank', label: '가상 은행 가기' },
  },
  {
    id: 'treasury-bonds',
    termKo: '가상 국채 (Treasury Bonds)',
    termEn: 'Virtual Treasury Bonds',
    category: 'finance',
    categoryLabel: '금융·투자',
    summary: '7일 또는 30일 만기 시 국고가 확정 고수익 이자를 100% 보증 지급하는 금융 상품.',
    detail:
      '시장 주가 변동 리스크를 회피하고 정해진 만기일에 높은 고정 수익률을 안정적으로 거두고자 할 때 최적의 안전 자산입니다.',
    relatedLink: { href: '/bank', label: '국채 상품 보기' },
  },
  {
    id: 'career-mastery',
    termKo: '직업 마스터리 (EXP)',
    termEn: 'Career Mastery System',
    category: 'work',
    categoryLabel: '직업·경제',
    summary: '작업 완수 시 축적되는 경험치로 레벨이 오르면 최대 2.5배 급여 배수를 획득하는 성장 체계.',
    detail:
      '광부, 농부, 엔지니어 등 8대 전문 직업마다 개별 숙련도 레벨이 존재하며, 숙련도가 높아질수록 상위 난이도 작업과 전직 혜택이 해금됩니다.',
    relatedLink: { href: '/work', label: '잡보드 가기' },
  },
  {
    id: 'daily-cap',
    termKo: '서버 일일 배정 한도',
    termEn: 'Daily Assignment Cap',
    category: 'work',
    categoryLabel: '직업·경제',
    summary: '화폐 과잉 발행과 매크로 어뷰징을 방지하기 위해 작업별로 서버가 강제하는 일일 최대 수주량.',
    detail:
      '각 작업에는 1일당 수행 가능한 최대 횟수와 주간 한도가 설정되어 있어, 건강하고 공정한 가상경제 생태계의 균형을 유지합니다.',
    relatedLink: { href: '/work', label: '작업 한도 확인' },
  },
  {
    id: 'market-sentiment',
    termKo: 'AI 시장 감성 지표 (Greed & Fear)',
    termEn: 'AI Market Sentiment Index',
    category: 'finance',
    categoryLabel: '금융·투자',
    summary: 'AI 뉴스 엔진이 생성한 최신 경제 호재/악재를 0~100점 점수로 종합한 시장 심리 지수.',
    detail:
      '극단적 공포(0~25) 구간에서는 저가 매수 기회를 탐색하고, 극단적 탐욕(76~100) 구간에서는 차익 실현을 고려하는 전문 퀀트 투자 지표로 활용됩니다.',
    relatedLink: { href: '/newspaper', label: 'AI 신문 보기' },
  },
  {
    id: 'stock-dividends',
    termKo: '일일 기업 배당금',
    termEn: 'Corporate Dividends',
    category: 'finance',
    categoryLabel: '금융·투자',
    summary: '가상 주식을 보유한 주주에게 매일 기업 수익의 일부가 지갑으로 환류되는 패시브 소득.',
    detail:
      '주식을 매도하지 않고 장기 보유하기만 해도 매일 자정에 연 8%~14% 수준의 배당금이 자동으로 지급되어 안정적인 현금 흐름을 창출합니다.',
    relatedLink: { href: '/stocks', label: '배당 종목 보기' },
  },
  {
    id: 'mybiz-founding',
    termKo: '마이비즈 법인 창업',
    termEn: 'MyBiz Enterprise Founding',
    category: 'work',
    categoryLabel: '직업·경제',
    summary: '시드머니를 투자해 나만의 가상 회사를 설립하고 매일 운영 이익을 일괄 정산받는 자본가 시스템.',
    detail:
      '소프트웨어, F&B, 물류 등 다양한 업종의 사업체를 인수/설립하고, 상점 부스트 아이템으로 매출을 극대화하여 거대 기업가로 성장할 수 있습니다.',
    relatedLink: { href: '/businesses', label: '게임 사업 가기' },
  },
  {
    id: 'auto-burn',
    termKo: '국고 자동 소각 (Auto-Burn)',
    termEn: 'Treasury Auto-Burn Protocol',
    category: 'system',
    categoryLabel: '시스템·보안',
    summary: '거래 수수료 및 창설비의 일부를 영구 소멸시켜 통화 가치 하락과 인플레이션을 방어하는 장치.',
    detail:
      '주식 수수료(0.05%), 마켓 거래세(2%), 클럽 창설비(10,000 WLD) 등이 국고로 유입된 뒤 일정 비율이 소멸되어 전체 유통 통화량(M0)의 건전성을 보장합니다.',
    relatedLink: { href: '/wallet/activity', label: '소각 내역 확인' },
  },
];

const CATEGORIES = [
  { id: 'all', label: '전체 보기' },
  { id: 'finance', label: '금융·투자' },
  { id: 'work', label: '직업·경제' },
  { id: 'system', label: '시스템·보안' },
] as const;

export function GlossarySearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'finance' | 'work' | 'system'>('all');
  const [expandedTermId, setExpandedTermId] = useState<string | null>(null);

  const filteredTerms = useMemo(() => {
    return GLOSSARY_TERMS.filter((term) => {
      const matchCategory = selectedCategory === 'all' || term.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        term.termKo.toLowerCase().includes(q) ||
        term.termEn.toLowerCase().includes(q) ||
        term.summary.toLowerCase().includes(q) ||
        term.detail.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [searchQuery, selectedCategory]);

  const toggleExpand = (id: string) => {
    setExpandedTermId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      aria-labelledby="glossary-search-heading"
      className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm sm:p-8"
    >
      <div className="flex flex-col gap-2 pb-6 border-b border-border/60 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-500 mb-2">
            <BookOpen className="size-3.5" />
            <span>INTERACTIVE FINTECH GLOSSARY</span>
          </div>
          <h2 id="glossary-search-heading" className="text-2xl font-black tracking-tight sm:text-3xl">
            <T korean="핀테크 & 게임 핵심 용어 사전" english="FinTech & Gaming Terminology" />
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 [word-break:keep-all]">
            <T
              korean="복식부기, 멱등성, 10-Depth 호가 등 머니버스 가상경제를 움직이는 핵심 개념을 키워드로 빠르게 검색해 보세요."
              english="Search essential concepts that power the Moneyverse virtual economy."
            />
          </p>
        </div>

        <Badge variant="outline" className="self-start sm:self-auto font-mono text-xs border-amber-500/40 bg-amber-500/5 text-amber-500">
          총 {GLOSSARY_TERMS.length}개 핵심 용어 수록
        </Badge>
      </div>

      {/* Search Bar & Category Filter Tabs */}
      <div className="space-y-4 pt-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="용어 검색 (예: 복식부기, 멱등성, 호가, 배당, 소각...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 min-h-[44px] rounded-xl border-border/70 bg-background text-sm font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="검색어 지우기"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtered Terms Accordion Grid */}
      <div className="grid gap-3 pt-6 sm:grid-cols-2">
        {filteredTerms.length > 0 ? (
          filteredTerms.map((term) => {
            const isExpanded = expandedTermId === term.id;
            return (
              <div
                key={term.id}
                className={cn(
                  'rounded-2xl border p-4 transition-all duration-200',
                  isExpanded
                    ? 'border-primary/60 bg-primary/5 shadow-sm ring-1 ring-primary/20'
                    : 'border-border/70 bg-card/60 hover:border-border hover:bg-card/90',
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleExpand(term.id)}
                  className="flex w-full items-start justify-between text-left outline-none"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-foreground">
                        {term.termKo}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        ({term.termEn})
                      </span>
                    </div>
                    <Badge variant="outline" className="mt-1.5 text-[10px] font-semibold border-border/60">
                      {term.categoryLabel}
                    </Badge>
                  </div>
                  <ChevronDown
                    className={cn(
                      'size-4 text-muted-foreground transition-transform duration-200 mt-1',
                      isExpanded && 'rotate-180 text-primary',
                    )}
                  />
                </button>

                <p className="mt-2 text-xs text-muted-foreground leading-relaxed [word-break:keep-all]">
                  {term.summary}
                </p>

                {isExpanded && (
                  <div className="mt-3 border-t border-border/60 pt-3 text-xs text-foreground/90 space-y-3 animate-in fade-in-50 duration-150">
                    <p className="leading-relaxed text-muted-foreground [word-break:keep-all]">
                      {term.detail}
                    </p>
                    {term.relatedLink && (
                      <Button asChild variant="outline" size="sm" className="h-7 text-xs font-semibold">
                        <Link href={term.relatedLink.href}>
                          <span>{term.relatedLink.label}</span>
                          <ExternalLink className="ml-1 size-3" />
                        </Link>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-xs text-muted-foreground">
            검색어와 일치하는 용어가 없습니다. 다른 키워드로 검색해 보세요.
          </div>
        )}
      </div>
    </section>
  );
}
