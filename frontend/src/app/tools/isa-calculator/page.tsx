'use client';

import { useLocale } from '@/components/locale-provider';
import { localeLabel } from '@/lib/locale';

import Link from 'next/link';
import React, { useState } from 'react';
import { 
  FileText 
} from 'lucide-react';
import { InArticleAdvertisement, MultiplexAdvertisement } from '@/components/public-advertisement';
import { DomesticRegulationBanner } from '@/components/domestic-regulation-banner';

export default function IsaCalculatorPage() {
  const { locale } = useLocale();
  const isEn = locale !== 'ko';
  const [accountType, setAccountType] = useState<'normal' | 'lowIncome'>('normal');
  const [profit, setProfit] = useState<number>(6000000);
  const [loss, setLoss] = useState<number>(1000000);

  // 손익 통산 순수익 계산
  const netProfit = Math.max(0, profit - loss);
  const taxExemptLimit = accountType === 'normal' ? 2000000 : 4000000;

  // 비과세 적용 금액 및 초과분 분리과세(9.9%)
  const taxExemptAmount = Math.min(netProfit, taxExemptLimit);
  const excessTaxable = Math.max(0, netProfit - taxExemptLimit);
  const isaTax = Math.floor(excessTaxable * 0.099);

  // 일반 계좌 시 배당소득세(15.4%) 및 손익 통산 불가 시 과세액
  const normalTax = Math.floor(profit * 0.154);

  // 총 절세액
  const totalTaxSaved = Math.max(0, normalTax - isaTax);

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': ['SoftwareApplication', 'FinancialProduct'],
    name: '2026 ISA 계좌 절세 계산기 | 일반형·서민형 비과세 한도',
    description: 'ISA 일반형(200만)과 서민형(400만) 비과세 한도, 9.9% 분리과세와 손익 통산 혜택을 일반 계좌와 실시간 비교하는 무료 절세 계산기입니다.',
    operatingSystem: 'All',
    applicationCategory: 'FinanceApplication',
  };

  return (
    <main className="min-h-screen bg-background text-foreground py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />

      {/* 한국 법제도 고유 계산기 글로벌 안내 배너 */}
      <DomesticRegulationBanner
        toolName="대한민국 ISA(개인종합자산관리계좌) 비과세 절세 계산기"
        recommendedAlternativeUrl="/tools/compound-calculator"
        recommendedAlternativeLabel={isEn ? 'Explore Global Compound Calculator' : '글로벌 복리 계산기 보기'}
      />

      <div className="space-y-3 text-center sm:text-left border-b border-border/80 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {isEn ? 'Universal Tax Shield: South Korea ISA' : '만능 절세 통장 ISA'}
          </span>
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-zinc-800 text-zinc-300">
            {isEn ? 'Up to KRW 4M Exemption + 9.9% Separate Tax' : '최대 400만 비과세 + 9.9% 분리과세'}
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          {localeLabel(
            locale,
            'ISA(개인종합자산관리계좌) 비과세 절세 계산기',
            'ISA Tax-Exempt Wealth Growth Calculator',
            'ISA（個人総合資産管理）非課税節税計算機',
            'ISA免税个人财富账户计算器',
            'Máy tính Tiết kiệm Miễn thuế ISA'
          )}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
          {isEn
            ? 'Compare net tax savings between an ISA account and a standard brokerage account (15.4% tax) with profit-loss aggregation in seconds.'
            : '주식·펀드·ETF 투자 시 일반 계좌(15.4% 세금) 대비 ISA 계좌에서 아낄 수 있는 실제 세금을 1초 만에 확인하세요.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 입력 패널 */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-card border border-border shadow-md space-y-6">
          <div className="flex items-center gap-2 text-sm font-bold">
            <FileText className="w-4 h-4 text-emerald-500" />
            <span>{isEn ? 'Account & Profit/Loss Input' : '계좌 유형 및 수익·손실 입력'}</span>
          </div>

          <div className="space-y-4">
            <div>
              <span className="block text-xs font-semibold text-muted-foreground mb-2">
                {isEn ? 'Select ISA Account Type' : 'ISA 계좌 유형 선택'}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAccountType('normal')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-left ${
                    accountType === 'normal'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                      : 'bg-muted/40 border-border text-muted-foreground hover:border-border/80'
                  }`}
                >
                  <div>{isEn ? 'Standard Type' : '일반형'}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{isEn ? 'KRW 2M Tax-Exempt' : '200만원 비과세'}</div>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('lowIncome')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-left ${
                    accountType === 'lowIncome'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                      : 'bg-muted/40 border-border text-muted-foreground hover:border-border/80'
                  }`}
                >
                  <div>{isEn ? 'Eligible / Low-Income' : '서민형·농어민형'}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{isEn ? 'KRW 4M Tax-Exempt' : '400만원 비과세'}</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                {isEn ? 'Total Gross Gains / Dividends (KRW)' : '투자 실현 이익 (배당·이자 포함)'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step={100000}
                  min={0}
                  value={profit}
                  onChange={(e) => setProfit(Number(e.target.value) || 0)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-lg font-bold font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <span className="absolute right-4 top-3.5 text-xs font-bold text-muted-foreground">원 (KRW)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                {isEn ? 'Total Realized Losses (Loss Offset)' : '투자 실현 손실 (손익 통산 차감)'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step={100000}
                  min={0}
                  value={loss}
                  onChange={(e) => setLoss(Number(e.target.value) || 0)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-lg font-bold font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <span className="absolute right-4 top-3.5 text-xs font-bold text-muted-foreground">원 (KRW)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 결과 리포트 */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-background to-teal-500/5 border border-emerald-500/30 shadow-xl space-y-6">
            <div className="border-b border-border/60 pb-5">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                {isEn ? 'Total Estimated Tax Savings' : 'ISA 계좌 이용 시 총 절세 혜택'}
              </span>
              <div className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-foreground mt-1">
                +₩{totalTaxSaved.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                {isEn
                  ? 'Compared to standard 15.4% withholding tax on gross profits without loss netting.'
                  : '일반 위탁계좌 대비 손익 통산 및 비과세·저율 분리과세로 지켜낸 내 순수익입니다.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-background/80 border border-border">
                <span className="block text-[11px] text-muted-foreground font-medium">
                  {isEn ? 'Standard Account Tax (15.4%)' : '일반 계좌 예상 세금 (15.4%)'}
                </span>
                <span className="block text-base font-bold font-mono text-rose-500 mt-0.5">
                  -₩{normalTax.toLocaleString()}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-background/80 border border-border">
                <span className="block text-[11px] text-muted-foreground font-medium">
                  {isEn ? 'ISA Final Tax (9.9%)' : 'ISA 계좌 실제 세금 (9.9%)'}
                </span>
                <span className="block text-base font-bold font-mono text-emerald-400 mt-0.5">
                  -₩{isaTax.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-muted/30 p-4 sm:p-5">
        <p className="text-sm text-muted-foreground">
          {localeLabel(
            locale,
            '이 계산기는 회원가입 없이 이용할 수 있습니다. 머니버스 가입은 실제 금융상품 가입과 무관합니다.',
            'This calculator works without signing up. A Moneyverse account is not a real financial product application.',
            'この計算機は登録せずに利用できます。Moneyverseへの登録は実際の金融商品への申込みではありません。',
            '无需注册即可使用此计算器。注册 Moneyverse 不等于申请真实金融产品。',
            'Bạn có thể dùng máy tính mà không cần đăng ký. Tài khoản Moneyverse không phải đơn đăng ký sản phẩm tài chính thực tế.'
          )}
        </p>
        <Link
          href="/register"
          className="mt-3 inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
        >
          {localeLabel(
            locale,
            '머니버스 계정 만들기 (선택)',
            'Create a Moneyverse account (optional)',
            'Moneyverseのアカウントを作成（任意）',
            '创建 Moneyverse 账户（可选）',
            'Tạo tài khoản Moneyverse (không bắt buộc)'
          )}
        </Link>
      </section>

      <InArticleAdvertisement className="my-6" />
      <MultiplexAdvertisement className="my-8" />
    </main>
  );
}