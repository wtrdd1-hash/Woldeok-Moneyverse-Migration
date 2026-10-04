'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Calendar, DollarSign, Plus, Trash2, TrendingUp, Sparkles, AlertCircle, ArrowRight, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PSEO_DIVIDEND_STOCKS, DividendStock } from '@/config/pseo-dividend.config';

interface PortfolioItem {
  ticker: string;
  shares: number;
}

const DEFAULT_PORTFOLIO: PortfolioItem[] = [
  { ticker: 'SCHD', shares: 50 },
  { ticker: 'O', shares: 30 },
  { ticker: '005930', shares: 100 },
];

export function DividendCalendarWidget() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(DEFAULT_PORTFOLIO);
  const [selectedStock, setSelectedStock] = useState<string>('JEPI');
  const [inputShares, setInputShares] = useState<number>(20);
  const [exchangeRate] = useState<number>(1380); // USD/KRW 환율 기준

  // 로컬스토리지 연동
  useEffect(() => {
    try {
      const saved = localStorage.getItem('wdmv_dividend_calendar_portfolio');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPortfolio(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const savePortfolio = (newItems: PortfolioItem[]) => {
    setPortfolio(newItems);
    try {
      localStorage.setItem('wdmv_dividend_calendar_portfolio', JSON.stringify(newItems));
    } catch {
      // ignore
    }
  };

  const addStock = () => {
    if (!selectedStock || inputShares <= 0) return;
    const existingIndex = portfolio.findIndex((p) => p.ticker === selectedStock);
    let updated: PortfolioItem[];
    if (existingIndex >= 0) {
      updated = [...portfolio];
      const target = updated[existingIndex];
      if (target) {
        target.shares += inputShares;
      }
    } else {
      updated = [...portfolio, { ticker: selectedStock, shares: inputShares }];
    }
    savePortfolio(updated);
  };

  const removeStock = (ticker: string) => {
    const updated = portfolio.filter((p) => p.ticker !== ticker);
    savePortfolio(updated);
  };

  // 1월부터 12월까지 각 월별 지급 배당금 계산
  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      totalKrw: 0,
      stocks: [] as { ticker: string; name: string; amountKrw: number }[],
    }));

    portfolio.forEach((item) => {
      const stockInfo = PSEO_DIVIDEND_STOCKS.find((s) => s.ticker === item.ticker);
      if (!stockInfo) return;

      const annualTotal = stockInfo.annualDividend * item.shares;
      const annualKrw = stockInfo.currency === 'USD' ? annualTotal * exchangeRate : annualTotal;
      // 일반 배당소득세율 15.4% 차감 후 세후 금액
      const netAnnualKrw = Math.floor(annualKrw * (1 - 0.154));

      let activeMonths: number[] = [];
      if (stockInfo.frequency === '월') {
        activeMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      } else if (stockInfo.frequency === '분기') {
        // 미국 주식 및 국내 분기배당주 (통상 3, 6, 9, 12월 또는 4, 5, 8, 11월)
        if (stockInfo.exDividendDate.includes('1월') || stockInfo.exDividendDate.includes('4월')) {
          activeMonths = [1, 4, 7, 10];
        } else if (stockInfo.exDividendDate.includes('2월') || stockInfo.exDividendDate.includes('5월')) {
          activeMonths = [2, 5, 8, 11];
        } else {
          activeMonths = [3, 6, 9, 12];
        }
      } else if (stockInfo.frequency === '반기') {
        activeMonths = [6, 12];
      } else {
        // 연배당
        activeMonths = [12];
      }

      const perMonthKrw = Math.floor(netAnnualKrw / activeMonths.length);

      activeMonths.forEach((m) => {
        const monthObj = months[m - 1];
        if (monthObj) {
          monthObj.totalKrw += perMonthKrw;
          monthObj.stocks.push({
            ticker: stockInfo.ticker,
            name: stockInfo.nameKo,
            amountKrw: perMonthKrw,
          });
        }
      });
    });

    return months;
  }, [portfolio, exchangeRate]);

  // 연간 총 세후 수령액
  const annualTotalNet = useMemo(() => {
    return monthlyData.reduce((acc, m) => acc + m.totalKrw, 0);
  }, [monthlyData]);

  // 월평균 수령액
  const monthlyAverage = Math.floor(annualTotalNet / 12);

  // 최대 월 수령액 (차트 높이 기준)
  const maxMonthly = Math.max(...monthlyData.map((m) => m.totalKrw), 1);

  return (
    <Card className="border-border/80 bg-card/90 shadow-sm overflow-hidden" id="dividend-calendar">
      <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border/50 bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="size-5 text-emerald-600 dark:text-emerald-400" />
              <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
                월별 배당 캘린더 &amp; 현금흐름 대시보드
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              보유 주식 수에 따른 1월~12월 세후 실수령 배당금 타임라인 시뮬레이터 (15.4% 배당세 반영)
            </CardDescription>
          </div>
          <Badge variant="outline" className="w-fit text-xs font-mono uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shrink-0">
            Interactive Widget
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        {/* 상단 3대 핵심 메트릭 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl border border-border/80 bg-background/50">
            <span className="text-xs text-muted-foreground font-medium">연간 총 세후 배당금</span>
            <div className="text-xl sm:text-2xl font-mono tabular-nums font-bold text-foreground mt-1 text-emerald-600 dark:text-emerald-400">
              ₩{annualTotalNet.toLocaleString()}
            </div>
          </div>
          <div className="p-4 rounded-xl border border-border/80 bg-background/50">
            <span className="text-xs text-muted-foreground font-medium">월평균 현금 흐름</span>
            <div className="text-xl sm:text-2xl font-mono tabular-nums font-bold text-foreground mt-1">
              ₩{monthlyAverage.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">/월</span>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-border/80 bg-background/50">
            <span className="text-xs text-muted-foreground font-medium">편입 배당 종목 수</span>
            <div className="text-xl sm:text-2xl font-mono tabular-nums font-bold text-foreground mt-1">
              {portfolio.length}개 종목
            </div>
          </div>
        </div>

        {/* 1월~12월 월별 배당금 타임라인 바 차트 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>월별 세후 수령액 (KRW)</span>
            <span>최고 수령월: ₩{maxMonthly.toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 sm:gap-2">
            {monthlyData.map((item) => {
              const heightPercent = Math.max(Math.round((item.totalKrw / maxMonthly) * 100), 12);
              const isCurrentMonth = item.month === new Date().getMonth() + 1;

              return (
                <div
                  key={item.month}
                  className={`flex flex-col items-center justify-end p-2 rounded-xl border transition-all ${
                    isCurrentMonth
                      ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'border-border/60 bg-muted/10 hover:border-border'
                  }`}
                >
                  <div className="w-full flex flex-col items-center justify-end h-28 sm:h-32 mb-2">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${
                        item.totalKrw > 0
                          ? 'bg-emerald-500/80 hover:bg-emerald-400'
                          : 'bg-zinc-200 dark:bg-zinc-800'
                      }`}
                    />
                  </div>

                  <span className={`text-[11px] font-mono font-bold ${isCurrentMonth ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                    {item.month}월
                  </span>

                  <span className="text-[10px] font-mono tabular-nums text-muted-foreground mt-0.5 text-center truncate max-w-full">
                    {item.totalKrw > 0 ? `${Math.round(item.totalKrw / 10000)}만` : '0'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 종목 관리 및 모의 추가 컨트롤 */}
        <div className="pt-4 border-t border-border/60 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              보유 배당주 포트폴리오 구성
            </h4>

            {/* 신규 종목 추가 폼 */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedStock}
                onChange={(e) => setSelectedStock(e.target.value)}
                className="h-9 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground font-medium outline-none"
              >
                {PSEO_DIVIDEND_STOCKS.map((s) => (
                  <option key={s.ticker} value={s.ticker}>
                    {s.nameKo} ({s.ticker}) • {s.dividendYield}%
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  max="100000"
                  value={inputShares}
                  onChange={(e) => setInputShares(Math.max(1, parseInt(e.target.value) || 0))}
                  className="h-9 w-20 rounded-lg border border-border bg-background px-2.5 text-xs font-mono text-foreground text-center outline-none"
                  placeholder="주수"
                />
                <span className="text-xs text-muted-foreground">주</span>
              </div>

              <Button size="sm" onClick={addStock} className="h-9 gap-1 font-semibold">
                <Plus className="size-3.5" />
                추가
              </Button>
            </div>
          </div>

          {/* 현재 등록된 종목 리스트 스트립 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {portfolio.map((item) => {
              const stock = PSEO_DIVIDEND_STOCKS.find((s) => s.ticker === item.ticker);
              if (!stock) return null;

              const annualDivKrw = Math.floor(
                (stock.currency === 'USD'
                  ? stock.annualDividend * item.shares * exchangeRate
                  : stock.annualDividend * item.shares) *
                  (1 - 0.154)
              );

              return (
                <div
                  key={item.ticker}
                  className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card hover:border-border transition-colors text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-foreground truncate">{stock.nameKo}</span>
                      <Badge variant="outline" className="text-[9px] uppercase px-1 py-0 shrink-0">
                        {stock.ticker}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      <span>{item.shares}주</span> •{' '}
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                        연 ₩{annualDivKrw.toLocaleString()}
                      </span>{' '}
                      • <span>{stock.frequency}배당</span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeStock(item.ticker)}
                    className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0"
                    aria-label={`${stock.nameKo} 삭제`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
