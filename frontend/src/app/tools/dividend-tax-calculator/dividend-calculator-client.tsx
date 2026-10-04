'use client';

import React, { useState, useMemo } from 'react';
import { Coins, AlertTriangle, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react';
import { CalculatorSaveAction } from '@/components/calculator-save-action';

type MarketType = 'DOMESTIC' | 'US' | 'ISA';

export function DividendCalculatorClient() {
  const [dividendAmount, setDividendAmount] = useState<number>(15000000); // 1,500만원 기본
  const [marketType, setMarketType] = useState<MarketType>('DOMESTIC');

  const calculation = useMemo(() => {
    const gross = dividendAmount;
    if (gross <= 0) {
      return {
        taxAmount: 0,
        netAmount: 0,
        taxRate: 0,
        isComprehensiveTax: false,
        excessAmount: 0,
        utilizationRate: 0,
      };
    }

    let taxRate = 0.154; // 국내 기본 15.4%
    if (marketType === 'US') {
      taxRate = 0.15; // 미국 현지 15%
    } else if (marketType === 'ISA') {
      taxRate = 0.099; // ISA 초과분 9.9% 분리과세
    }

    // 2,000만원 금융소득종합과세 기준
    const limit = 20000000;
    const isComprehensiveTax = gross > limit && marketType !== 'ISA';
    const excessAmount = isComprehensiveTax ? gross - limit : 0;
    const utilizationRate = Math.min(100, Math.round((gross / limit) * 100));

    // 기본 원천징수 세액
    let baseTax = Math.floor(gross * taxRate);
    if (marketType === 'ISA') {
      // ISA 비과세 한도 200만원 차감
      const taxable = Math.max(0, gross - 2000000);
      baseTax = Math.floor(taxable * 0.099);
    }

    const netAmount = gross - baseTax;

    return {
      taxAmount: baseTax,
      netAmount,
      taxRate: Math.round(taxRate * 1000) / 10,
      isComprehensiveTax,
      excessAmount,
      utilizationRate,
    };
  }, [dividendAmount, marketType]);

  const presetDividends = [
    { label: '500만', value: 5000000 },
    { label: '1,000만', value: 10000000 },
    { label: '1,500만', value: 15000000 },
    { label: '2,000만', value: 20000000 },
    { label: '3,000만', value: 30000000 },
    { label: '5,000만', value: 50000000 },
  ];

  return (
    <div className="space-y-6">
      {/* 주식/계좌 유형 선택 */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-zinc-900 border border-zinc-800 rounded-xl">
        <button
          onClick={() => setMarketType('DOMESTIC')}
          className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
            marketType === 'DOMESTIC'
              ? 'bg-emerald-500 text-zinc-950 shadow-md font-bold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          국내 주식 (15.4%)
        </button>
        <button
          onClick={() => setMarketType('US')}
          className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
            marketType === 'US'
              ? 'bg-emerald-500 text-zinc-950 shadow-md font-bold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          미국 주식 (15.0%)
        </button>
        <button
          onClick={() => setMarketType('ISA')}
          className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
            marketType === 'ISA'
              ? 'bg-emerald-500 text-zinc-950 shadow-md font-bold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          ISA 계좌 (비과세/9.9%)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 입력 카드 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-zinc-300">연간 세전 배당금 총액</label>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {(dividendAmount / 10000).toLocaleString()}만 원
              </span>
            </div>
            <div className="relative mb-2">
              <input
                type="number"
                value={dividendAmount}
                onChange={(e) => setDividendAmount(Math.max(0, Number(e.target.value)))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <span className="absolute right-4 top-2.5 text-xs text-zinc-500">원</span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {presetDividends.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setDividendAmount(p.value)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    dividendAmount === p.value
                      ? 'bg-zinc-700 text-white border border-zinc-600'
                      : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2,000만원 종합과세 한도 게이지 */}
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-medium">금융소득 2,000만원 한도 소진율</span>
              <span className={`font-mono font-bold ${calculation.utilizationRate >= 100 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {calculation.utilizationRate}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  calculation.utilizationRate >= 100 ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${calculation.utilizationRate}%` }}
              />
            </div>
            <div className="text-[11px] text-zinc-500 flex justify-between">
              <span>0원</span>
              <span>2,000만원 (종합과세 기준선)</span>
            </div>
          </div>
        </div>

        {/* 결과 카드 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs text-zinc-400 font-medium block mb-1">통장 입금 실수령 배당금</span>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400 mb-1">
              {calculation.netAmount.toLocaleString()}원
            </div>
            <div className="text-xs text-zinc-400">
              세전 대비 실수령률: <span className="font-mono text-zinc-200 font-semibold">{dividendAmount > 0 ? ((calculation.netAmount / dividendAmount) * 100).toFixed(1) : 0}%</span>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-zinc-800 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">원천징수 세금 합계</span>
              <span className="font-mono text-rose-400 font-bold">
                -{calculation.taxAmount.toLocaleString()}원
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">적용 원천징수 세율</span>
              <span className="font-mono text-zinc-300 font-semibold">
                {calculation.taxRate}%
              </span>
            </div>

            {/* 종합과세 판정 박스 */}
            {calculation.isComprehensiveTax ? (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-bold block">금융소득종합과세 대상입니다</span>
                  2,000만원 초과분({calculation.excessAmount.toLocaleString()}원)은 5월 종합소득세 신고 시 타 소득과 합산 과세됩니다.
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[11px]">
                  연간 2,000만원 이하로 <strong>분리과세 종결</strong>됩니다 (추가 신고 불필요).
                </span>
              </div>
            )}
          </div>

          {/* 1초 저장 및 관심등록 연동 */}
          <div className="pt-2">
            <CalculatorSaveAction
              scenario={{
                type: 'stock',
                title: `배당소득세 ${(dividendAmount / 10000).toLocaleString()}만원 (${marketType === 'DOMESTIC' ? '국내' : marketType === 'US' ? '미국' : 'ISA'})`,
                badge: calculation.isComprehensiveTax ? '종합과세' : '분리과세',
                primaryMetric: {
                  label: '실수령 배당금',
                  value: `${calculation.netAmount.toLocaleString()}원`,
                },
                secondaryMetric: {
                  label: '원천징수 세금',
                  value: `${calculation.taxAmount.toLocaleString()}원`,
                },
                details: {
                  세전배당금: `${(dividendAmount / 10000).toLocaleString()}만원`,
                  원천징수세율: `${calculation.taxRate}%`,
                  종합과세대상: calculation.isComprehensiveTax ? '해당' : '제외',
                  한도소진율: `${calculation.utilizationRate}%`,
                },
                sourceUrl: '/tools/dividend-tax-calculator',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
