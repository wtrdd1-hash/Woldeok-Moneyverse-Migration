'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, BookOpen, Calculator, DollarSign, TrendingUp, Sparkles, X, ChevronRight, CornerDownLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GLOSSARY_TERMS } from '@/config/pseo-glossary.config';
import { PSEO_DIVIDEND_STOCKS } from '@/config/pseo-dividend.config';
import { POPULAR_STOCKS_DATASET } from '@/config/pseo-stocks.config';
import { PSEO_LOAN_PRESETS } from '@/config/pseo-loan.config';
import { SALARY_PRESETS } from '@/config/pseo-salary.config';

export interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'glossary' | 'dividend' | 'stock' | 'loan' | 'salary' | 'tool';
  categoryLabel: string;
  url: string;
  badge?: string;
}

interface SearchAutocompletePopoverProps {
  placeholder?: string;
  className?: string;
  onSelect?: (item: SearchItem) => void;
  autoFocus?: boolean;
}

export function SearchAutocompletePopover({
  placeholder = '금융 용어, 주식 계산기, 배당주, 연봉, 대출 검색...',
  className = '',
  onSelect,
  autoFocus = false,
}: SearchAutocompletePopoverProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 전체 검색 인덱스 데이터베이스 사전 구축 (메모이제이션)
  const searchIndex = useMemo<SearchItem[]>(() => {
    const items: SearchItem[] = [];

    // 1. 50대 금융 용어사전
    GLOSSARY_TERMS.forEach((term) => {
      items.push({
        id: `glossary-${term.slug}`,
        title: term.termKo,
        subtitle: `${term.termEn} • ${term.category} • ${term.keyTakeawayKo}`,
        category: 'glossary',
        categoryLabel: '용어사전',
        url: `/guide/glossary/${term.slug}`,
        badge: term.category,
      });
    });

    // 2. 60대 배당주 계산기
    PSEO_DIVIDEND_STOCKS.forEach((stock) => {
      items.push({
        id: `dividend-${stock.ticker}`,
        title: `${stock.nameKo} (${stock.ticker})`,
        subtitle: `배당수익률 ${stock.dividendYield}% • 연간 배당금 ${stock.annualDividend}${stock.currency === 'USD' ? '$' : '원'} • ${stock.frequency}배당`,
        category: 'dividend',
        categoryLabel: '배당주',
        url: `/tools/dividend-tax-calculator/${stock.ticker}`,
        badge: `${stock.dividendYield}%`,
      });
    });

    // 3. 인기 주식 물타기 계산기
    POPULAR_STOCKS_DATASET.forEach((stock) => {
      items.push({
        id: `stock-${stock.ticker}`,
        title: `${stock.nameKo} 물타기 계산기`,
        subtitle: `${stock.market} • 기준가 ₩${stock.basePrice.toLocaleString()} • 목표 평단가 탈출 시뮬레이션`,
        category: 'stock',
        categoryLabel: '주식계산기',
        url: `/tools/stock-calculator/${stock.ticker}`,
        badge: stock.market,
      });
    });

    // 4. 50대 대출이자 프리셋
    PSEO_LOAN_PRESETS.slice(0, 30).forEach((loan) => {
      items.push({
        id: `loan-${loan.slug}`,
        title: loan.title,
        subtitle: `금리 연 ${loan.annualRate}% • ${loan.termYears}년 • ${loan.repaymentType === 'EQUAL_PI' ? '원리금균등' : '원금균등'}`,
        category: 'loan',
        categoryLabel: '대출이자',
        url: `/tools/loan-interest-calculator/${loan.slug}`,
        badge: `${loan.annualRate}%`,
      });
    });

    // 5. 50대 연봉 실수령액 프리셋
    SALARY_PRESETS.slice(0, 20).forEach((salary) => {
      items.push({
        id: `salary-${salary.slug}`,
        title: `${salary.displayTitle} 실수령액`,
        subtitle: `예상 월 실수령액 ₩${Math.round(salary.monthlyNet / 10000).toLocaleString()}만원 • 4대보험 및 근로소득세 공제표`,
        category: 'salary',
        categoryLabel: '연봉계산기',
        url: `/tools/salary-calculator/${salary.slug}`,
        badge: '실수령',
      });
    });

    // 6. 핵심 금융 도구
    items.push(
      {
        id: 'tool-retirement',
        title: '퇴직금 계산기',
        subtitle: '입사일/퇴사일 및 최근 3개월 급여 기반 법정 퇴직금 0초 산출',
        category: 'tool',
        categoryLabel: '절세도구',
        url: '/tools/retirement-calculator',
      },
      {
        id: 'tool-pension',
        title: '연금저축 & IRP 세액공제 계산기',
        subtitle: '연 900만원 납입 시 최대 148.5만원 연말정산 환급금 시뮬레이션',
        category: 'tool',
        categoryLabel: '절세도구',
        url: '/tools/pension-tax-calculator',
      },
      {
        id: 'tool-isa',
        title: 'ISA 비과세 만기 계산기',
        subtitle: '일반형 200만 / 서민형 400만 비과세 한도 및 9.9% 분리과세 절세액 산출',
        category: 'tool',
        categoryLabel: '절세도구',
        url: '/tools/isa-calculator',
      },
      {
        id: 'tool-dividend-hub',
        title: '월별 배당 캘린더 대시보드',
        subtitle: '보유 종목별 1~12월 세후 실수령액 및 월평균 현금흐름 캘린더',
        category: 'tool',
        categoryLabel: '배당도구',
        url: '/tools/dividend-tax-calculator',
      },
      {
        id: 'tool-capital-gains',
        title: '해외주식 250만 양도소득세 계산기',
        subtitle: '미국 주식 250만원 기본공제 및 22% 양도소득세 손익통산 시뮬레이터',
        category: 'tool',
        categoryLabel: '절세도구',
        url: '/tools/capital-gains-tax-calculator',
      },
      {
        id: 'tool-youth-leap',
        title: '청년도약계좌 5년 만기 계산기',
        subtitle: '정부기여금 월 최대 3.3만원 + 비과세 은행 이자 5,000만원 모으기',
        category: 'tool',
        categoryLabel: '청년재테크',
        url: '/tools/youth-leap-calculator',
      }
    );

    return items;
  }, []);

  // 검색어에 따른 필터링 (최대 8개 추천)
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // 검색어가 없을 때는 인기 추천 키워드 6개 노출
      return searchIndex.slice(0, 6);
    }

    return searchIndex
      .filter((item) => {
        return (
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.categoryLabel.toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [searchIndex, query]);

  // 바깥 영역 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 키보드 조작 핸들러
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(filteredResults.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % Math.max(filteredResults.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = filteredResults[selectedIndex];
      if (target) {
        handleSelect(target);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (item: SearchItem) => {
    setIsOpen(false);
    setQuery('');
    if (onSelect) {
      onSelect(item);
    } else {
      router.push(item.url);
    }
  };

  const getCategoryBadgeClass = (category: SearchItem['category']) => {
    switch (category) {
      case 'glossary':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'dividend':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'stock':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'loan':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'salary':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
      default:
        return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300';
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* 인풋 필드 */}
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-11 min-h-[44px] w-full rounded-xl border border-border/80 bg-background/95 pl-10 pr-9 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-all shadow-xs focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-3 p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
            aria-label="검색어 지우기"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* 실시간 자동완성 추천 팝오버 */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[380px] overflow-y-auto rounded-2xl border border-border/80 bg-popover/98 p-2 shadow-xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95">
          <div className="px-2.5 py-1.5 text-[11px] font-bold text-muted-foreground flex items-center justify-between border-b border-border/50 mb-1">
            <span>{query ? `'${query}' 실시간 검색 추천` : '인기 금융 키워드 & 계산기'}</span>
            <span className="hidden sm:inline font-mono text-[10px] text-muted-foreground/60">
              [↑/↓ 이동 • Enter 선택]
            </span>
          </div>

          {filteredResults.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              일치하는 금융 용어나 계산기를 찾을 수 없습니다.
            </div>
          ) : (
            <div className="space-y-1">
              {filteredResults.map((item, index) => {
                const isSelected = index === selectedIndex;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`group flex items-center justify-between p-2.5 rounded-xl text-left cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-primary/10 text-foreground'
                        : 'hover:bg-muted/50 text-foreground/90'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold truncate group-hover:text-primary transition-colors">
                          {item.title}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[9px] uppercase font-mono px-1.5 py-0 shrink-0 ${getCategoryBadgeClass(
                            item.category
                          )}`}
                        >
                          {item.categoryLabel}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 text-muted-foreground group-hover:text-primary">
                      {isSelected ? (
                        <CornerDownLeft className="size-3.5 text-primary" />
                      ) : (
                        <ChevronRight className="size-3.5" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
