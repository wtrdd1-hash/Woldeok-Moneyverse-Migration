'use client';

import React, { useState, useMemo } from 'react';
import { useLocale } from '@/components/locale-provider';
import { localeLabel } from '@/lib/locale';
import { t, getCurrencyConfig } from '@/lib/translations';
import { Coins, AlertTriangle, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react';
import { CalculatorSaveAction } from '@/components/calculator-save-action';

type MarketType = 'DOMESTIC' | 'US' | 'ISA';

export function DividendCalculatorClient() {
  const { locale } = useLocale();
  const curr = getCurrencyConfig(locale);

  // 로케일별 기본 연간 배당금 (USD $15,000, JPY ¥1,500,000, CNY 100,000, KRW 15,000,000)
  const defaultDividend = locale === 'en' ? 15000 : (locale === 'ja' ? 1500000 : (locale === 'zh' ? 100000 : 15000000));
  const [dividendAmount, setDividendAmount] = useState<number>(defaultDividend);
  const [marketType, setMarketType] = useState<MarketType>('DOMESTIC');

  const calculation = useMemo(() => {
    const gross = dividendAmount;
    // 종합과세 기준선 (한국 2,000만원 / 글로벌 환산)
    const limit = locale === 'en' ? 20000 : (locale === 'ja' ? 2000000 : (locale === 'zh' ? 120000 : 20000000));

    if (gross <= 0) {
      return {
        taxAmount: 0,
        netAmount: 0,
        taxRate: 0,
        isComprehensiveTax: false,
        excessAmount: 0,
        utilizationRate: 0,
        limit,
      };
    }
    let taxRate = 0.154; // 한국 15.4% / 글로벌 표준
    if (marketType === 'US') {
      taxRate = 0.15; // 미국 현지 15%
    } else if (marketType === 'ISA') {
      taxRate = 0.099; // 비과세/우대 계좌
    }

    const isComprehensiveTax = gross > limit && marketType !== 'ISA';
    const excessAmount = isComprehensiveTax ? gross - limit : 0;
    const utilizationRate = Math.min(100, Math.round((gross / limit) * 100));

    // 기본 원천징수 세액
    let baseTax = Math.floor(gross * taxRate);
    if (marketType === 'ISA') {
      const exemptLimit = locale === 'en' ? 2000 : (locale === 'ja' ? 200000 : (locale === 'zh' ? 12000 : 2000000));
      const taxable = Math.max(0, gross - exemptLimit);
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
      limit,
    };
  }, [dividendAmount, marketType, locale]);

  const presetDividends = locale === 'en'
    ? [
        { label: '$5K', value: 5000 },
        { label: '$10K', value: 10000 },
        { label: '$15K', value: 15000 },
        { label: '$20K', value: 20000 },
        { label: '$30K', value: 30000 },
        { label: '$50K', value: 50000 },
      ]
    : locale === 'ja'
    ? [
        { label: '50万円', value: 500000 },
        { label: '100万円', value: 1000000 },
        { label: '150万円', value: 1500000 },
        { label: '200万円', value: 2000000 },
        { label: '300万円', value: 3000000 },
        { label: '500万円', value: 5000000 },
      ]
    : locale === 'zh'
    ? [
        { label: '3万', value: 30000 },
        { label: '5万', value: 50000 },
        { label: '10万', value: 100000 },
        { label: '12万', value: 120000 },
        { label: '20万', value: 200000 },
        { label: '30万', value: 300000 },
      ]
    : [
        { label: '500만', value: 5000000 },
        { label: '1,000만', value: 10000000 },
        { label: '1,500만', value: 15000000 },
        { label: '2,000만', value: 20000000 },
        { label: '3,000만', value: 30000000 },
        { label: '5,000만', value: 50000000 },
      ];

  const marketLabels = {
    DOMESTIC: localeLabel(locale, '국내 주식 (15.4%)', 'Domestic (15.4%)', '国内株式 (15.4%)', '国内股票 (15.4%)'),
    US: localeLabel(locale, '미국 주식 (15.0%)', 'US Stocks (15.0%)', '米国株式 (15.0%)', '美股股息 (15.0%)'),
    ISA: localeLabel(locale, 'ISA 계좌 (비과세/9.9%)', 'Tax-Advantaged (0%/9.9%)', '非課税・優遇口座 (0%/9.9%)', '免税/优惠账户 (0%/9.9%)'),
  };

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
          {marketLabels.DOMESTIC}
        </button>
        <button
          onClick={() => setMarketType('US')}
          className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
            marketType === 'US'
              ? 'bg-emerald-500 text-zinc-950 shadow-md font-bold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          {marketLabels.US}
        </button>
        <button
          onClick={() => setMarketType('ISA')}
          className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
            marketType === 'ISA'
              ? 'bg-emerald-500 text-zinc-950 shadow-md font-bold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          {marketLabels.ISA}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 입력 카드 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-zinc-300">
                {localeLabel(locale, '연간 세전 배당금 총액', 'Annual Gross Dividend Amount', '年間税引前配当総額', '年度税前分红总额')}
              </label>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {curr.symbol}{dividendAmount.toLocaleString()}
              </span>
            </div>
            <div className="relative mb-2">
              <span className="absolute left-3.5 top-2.5 text-xs text-zinc-500 font-mono">{curr.symbol}</span>
              <input
                type="number"
                value={dividendAmount}
                onChange={(e) => setDividendAmount(Math.max(0, Number(e.target.value)))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-4 py-2.5 text-sm font-mono text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
              />
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

          {/* 종합과세 한도 게이지 */}
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-medium">
                {localeLabel(locale, '금융소득 종합과세 한도 소진율', 'Tax Threshold Utilization', '総合課税基準額 消化率', '综合课税起征点占比')}
              </span>
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
              <span>{curr.symbol}0</span>
              <span>{curr.symbol}{calculation.limit.toLocaleString()} ({localeLabel(locale, '종합과세 기준선', 'Bracket Threshold', '基準ライン', '综合课税线')})</span>
            </div>
          </div>
        </div>

        {/* 결과 카드 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs text-zinc-400 font-medium block mb-1">
              {localeLabel(locale, '통장 입금 실수령 배당금', 'Net Dividend Received (After-Tax)', '税引後 手取り配当金', '税后实得净分红')}
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400 mb-1">
              {curr.symbol}{calculation.netAmount.toLocaleString()}
            </div>
            <div className="text-xs text-zinc-400">
              {localeLabel(locale, '세전 대비 실수령률:', 'Effective Payout Ratio:', '税引後 実質手取り率:', '税后实得占比:')}{' '}
              <span className="font-mono text-zinc-200 font-semibold">{dividendAmount > 0 ? ((calculation.netAmount / dividendAmount) * 100).toFixed(1) : 0}%</span>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-zinc-800 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">
                {localeLabel(locale, '원천징수 세금 합계', 'Withheld Tax Deduction', '源泉徴収 税額合計', '代扣代缴税金合计')}
              </span>
              <span className="font-mono text-rose-400 font-bold">
                -{curr.symbol}{calculation.taxAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">
                {localeLabel(locale, '적용 원천징수 세율', 'Applied Withholding Rate', '適用 源泉徴収税率', '适用代扣代缴税率')}
              </span>
              <span className="font-mono text-zinc-300 font-semibold">
                {calculation.taxRate}%
              </span>
            </div>

            {/* 종합과세 판정 박스 */}
            {calculation.isComprehensiveTax ? (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-bold block">
                    {localeLabel(locale, '금융소득종합과세 대상입니다', 'Exceeds Standard Withholding Bracket', '総合課税の申告対象となります', '超出标准分红起征线')}
                  </span>
                  {localeLabel(
                    locale,
                    `기준선 초과분(${curr.symbol}${calculation.excessAmount.toLocaleString()})은 5월 종합소득세 신고 시 타 소득과 합산 과세됩니다.`,
                    `Amounts exceeding the threshold (${curr.symbol}${calculation.excessAmount.toLocaleString()}) may be subject to progressive aggregate taxation.`,
                    `基準超過額（${curr.symbol}${calculation.excessAmount.toLocaleString()}）は確定申告で他の所得と合算課税される場合があります。`,
                    `超出基准线部分（${curr.symbol}${calculation.excessAmount.toLocaleString()}）可能需要在年度汇算清缴时合并计税。`
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[11px]">
                  {localeLabel(
                    locale,
                    '기준선 이하로 원천징수 종결됩니다 (추가 신고 불필요).',
                    'Below progressive tax threshold. Withholding tax settles all liabilities.',
                    '基準額以下につき源泉分離課税で完結します（申告不要）。',
                    '未超出综合起征点，按标准代扣代缴完结（无需额外申报）。'
                  )}
                </span>
              </div>
            )}
          </div>

          {/* 1초 저장 및 관심등록 연동 */}
          <div className="pt-2">
            <CalculatorSaveAction
              scenario={{
                type: 'stock',
                title: `${localeLabel(locale, '배당소득세', 'Dividend Tax', '配当所得税', '股息红利税')} ${curr.symbol}${dividendAmount.toLocaleString()}`,
                badge: calculation.isComprehensiveTax ? localeLabel(locale, '종합과세', 'Progressive', '総合課税', '合并计税') : localeLabel(locale, '분리과세', 'Separated', '分離課税', '分类计税'),
                primaryMetric: {
                  label: localeLabel(locale, '실수령 배당금', 'Net Dividend', '手取り配当金', '税后实得'),
                  value: `${curr.symbol}${calculation.netAmount.toLocaleString()}`,
                },
                secondaryMetric: {
                  label: localeLabel(locale, '원천징수 세금', 'Withheld Tax', '源泉税額', '扣缴税额'),
                  value: `${curr.symbol}${calculation.taxAmount.toLocaleString()}`,
                },
                details: {
                  gross: `${curr.symbol}${dividendAmount.toLocaleString()}`,
                  rate: `${calculation.taxRate}%`,
                  status: calculation.isComprehensiveTax ? 'Aggregated' : 'Settled',
                },
                sourceUrl: locale === 'ko' ? '/tools/dividend-tax-calculator' : `/${locale}/tools/dividend-tax-calculator`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
