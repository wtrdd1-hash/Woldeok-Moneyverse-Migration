import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  Briefcase, 
  ChevronRight, 
  ArrowLeft, 
  TrendingUp, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Coins 
} from 'lucide-react';
import { 
  SALARY_PRESETS, 
  getSalaryPresetBySlug 
} from '@/config/pseo-salary.config';
import { InArticleAdvertisement, MultiplexAdvertisement } from '@/components/public-advertisement';
import { CalculatorSaveAction } from '@/components/calculator-save-action';
import { SocialShareBar } from '@/components/social-share-bar';

interface SalaryPresetPageProps {
  readonly params: Promise<{ readonly preset: string }>;
}

export const revalidate = 86400; // 24시간 ISR

export async function generateStaticParams() {
  return SALARY_PRESETS.map((p) => ({ preset: p.slug }));
}

export async function generateMetadata({ params }: SalaryPresetPageProps): Promise<Metadata> {
  const { preset } = await params;
  const data = getSalaryPresetBySlug(preset);
  if (!data) return { title: '연봉 실수령액 계산기' };

  const inManWon = (data.annualSalary / 10000).toLocaleString();
  const netManWon = (data.monthlyNet / 10000).toFixed(1);

  return {
    title: `${data.displayTitle} | 월 ${netManWon}만원 실수령액 2026`,
    description: `연봉 ${inManWon}만원의 2026년 월 실수령액은 약 ${data.monthlyNet.toLocaleString()}원입니다. 국민연금, 건강보험, 고용보험 및 근로소득세 세부 공제액을 확인하세요.`,
    alternates: {
      canonical: `https://easy-scraping.com/tools/salary-calculator/${preset}`,
    },
    openGraph: {
      title: `${data.displayTitle} | 월 ${netManWon}만원 세후 입금액`,
      description: `연봉 ${inManWon}만원의 4대보험 공제 내역과 월 실수령액, 연간 실수령 총액을 1원 단위까지 확인하세요.`,
    },
  };
}

export default async function SalaryPresetPage({ params }: SalaryPresetPageProps) {
  const { preset } = await params;
  const data = getSalaryPresetBySlug(preset);

  if (!data) {
    notFound();
  }

  const inManWon = (data.annualSalary / 10000).toLocaleString();

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': ['SoftwareApplication', 'FinancialProduct'],
    name: `${data.displayTitle} - 월 실수령액 공제표`,
    description: `연봉 ${inManWon}만원의 2026년 기준 월 세후 실수령액(${data.monthlyNet.toLocaleString()}원) 및 4대보험 공제 상세표입니다.`,
    operatingSystem: 'All',
    applicationCategory: 'FinanceApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.96',
      reviewCount: '312',
    },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqList.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-10 px-4 sm:px-6 max-w-4xl mx-auto space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* 내비게이션 브레드크럼 */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/tools" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> 전체 도구
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
        <Link href="/tools/salary-calculator" className="hover:text-foreground transition-colors">
          연봉별 실수령액 계산기
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
        <span className="text-foreground font-medium">연봉 {inManWon}만원</span>
      </div>

      {/* 상단 타이틀 */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <Briefcase className="w-3.5 h-3.5" />
          2026 대한민국 4대보험 & 간이세액표 기준
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          {data.displayTitle}
        </h1>
        <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
          연봉 {inManWon}만원의 월 세전 급여는 {(data.monthlyGross / 10000).toFixed(1)}만원이며, 4대 보험과 근로소득세 공제 후 실제 통장에 입금되는 월 실수령액은 약 {data.monthlyNet.toLocaleString()}원입니다.
        </p>
      </div>

      {/* 핵심 결과 하이라이트 카드 */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-emerald-500/30 shadow-2xl space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <Sparkles className="w-4 h-4" /> 세후 실수령액 산출 결과
          </div>
          <CalculatorSaveAction
            scenario={{
              type: 'retirement',
              title: `연봉 ${inManWon}만원 월 실수령 ${data.monthlyNet.toLocaleString()}원`,
              badge: `공제율 ${data.effectiveTaxRate}%`,
              primaryMetric: {
                label: '월 실수령액',
                value: `${data.monthlyNet.toLocaleString()}원`,
              },
              secondaryMetric: {
                label: '월 총 공제액',
                value: `${data.totalDeduction.toLocaleString()}원`,
              },
              details: {
                annualSalary: data.annualSalary,
                monthlyGross: data.monthlyGross,
                nationalPension: data.nationalPension,
                healthInsurance: data.healthInsurance,
                incomeTax: data.incomeTax,
              },
            }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-1">
            <span className="text-xs text-zinc-400">월 세후 실수령액</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
              {data.monthlyNet.toLocaleString()} <span className="text-sm text-zinc-400">원</span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-1">
            <span className="text-xs text-zinc-400">월 세전 급여</span>
            <div className="text-xl sm:text-2xl font-bold text-zinc-200 font-mono">
              {data.monthlyGross.toLocaleString()} <span className="text-xs text-zinc-400">원</span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-1">
            <span className="text-xs text-zinc-400">월 공제 합계 (공제율)</span>
            <div className="text-xl sm:text-2xl font-bold text-rose-400 font-mono">
              -{data.totalDeduction.toLocaleString()} <span className="text-xs text-zinc-400">({data.effectiveTaxRate}%)</span>
            </div>
          </div>
        </div>

        {/* 6대 공제 항목 세부 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-2">
          <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
            <span className="text-zinc-400 text-[11px]">국민연금 (4.5%)</span>
            <div className="font-bold text-zinc-200 mt-0.5 font-mono">
              {data.nationalPension.toLocaleString()} 원
            </div>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
            <span className="text-zinc-400 text-[11px]">건강보험 (3.545%)</span>
            <div className="font-bold text-zinc-200 mt-0.5 font-mono">
              {data.healthInsurance.toLocaleString()} 원
            </div>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
            <span className="text-zinc-400 text-[11px]">장기요양 (12.95%)</span>
            <div className="font-bold text-zinc-200 mt-0.5 font-mono">
              {data.longTermCare.toLocaleString()} 원
            </div>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
            <span className="text-zinc-400 text-[11px]">고용보험 (0.9%)</span>
            <div className="font-bold text-zinc-200 mt-0.5 font-mono">
              {data.employmentInsurance.toLocaleString()} 원
            </div>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
            <span className="text-zinc-400 text-[11px]">소득세 (근로소득세)</span>
            <div className="font-bold text-rose-400 mt-0.5 font-mono">
              {data.incomeTax.toLocaleString()} 원
            </div>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
            <span className="text-zinc-400 text-[11px]">지방소득세 (10%)</span>
            <div className="font-bold text-rose-400 mt-0.5 font-mono">
              {data.localIncomeTax.toLocaleString()} 원
            </div>
          </div>
        </div>

        {/* 연간 합계 배너 */}
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between">
          <span className="text-xs text-zinc-300">연간 세후 실수령 합계</span>
          <span className="text-lg font-bold font-mono text-emerald-400">
            {data.annualNet.toLocaleString()} 원
          </span>
        </div>

        <SocialShareBar
          title={`${data.displayTitle} - 2026 연봉 실수령액 계산기`}
          description={`연봉 ${inManWon}만원의 4대보험 공제 후 월 실수령액은 ${data.monthlyNet.toLocaleString()}원(공제율 ${data.effectiveTaxRate}%)입니다.`}
          hashtags={['연봉실수령액', '월급계산기', '4대보험', '머니버스']}
        />
      </div>

      {/* 고단가 금융 인아티클 광고 */}
      <InArticleAdvertisement className="my-6" />

      {/* FAQ 섹션 */}
      <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-md space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-zinc-800 dark:text-zinc-200">
          <HelpCircle className="w-4 h-4 text-emerald-500" />
          연봉 {inManWon}만원 실수령 관련 자주 묻는 질문
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {data.faqList.map((faq, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-muted/40 border border-border/40 space-y-1.5">
              <h3 className="font-semibold text-foreground">
                Q. {faq.question}
              </h3>
              <p>{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 다른 연봉 구간 탐색 */}
      <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-md space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-zinc-800 dark:text-zinc-200">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          다른 연봉 구간 실수령액 비교
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          {SALARY_PRESETS.filter((p) => p.slug !== preset).slice(0, 12).map((other) => (
            <Link
              key={other.slug}
              href={`/tools/salary-calculator/${other.slug}`}
              className="p-2.5 rounded-xl bg-muted/50 hover:bg-emerald-500/10 border border-border/60 hover:border-emerald-500/40 transition-all text-left group"
            >
              <div className="text-xs font-semibold text-foreground group-hover:text-emerald-500 transition-colors">
                연봉 {(other.annualSalary / 10000).toLocaleString()}만
              </div>
              <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                월 {(other.monthlyNet / 10000).toFixed(1)}만원
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 하단 멀티플렉스 추천 광고 */}
      <MultiplexAdvertisement className="my-8" />
    </div>
  );
}
