import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, ArrowLeft, TrendingUp, Sparkles, HelpCircle, CheckCircle2, ShieldCheck, DollarSign } from 'lucide-react';
import { STOCK_PRESETS, getPresetBySlug } from '@/config/seo-presets.config';
import { getPseoStockPreset, ALL_PSEO_POPULAR_SLUGS } from '@/config/pseo-stocks.config';
import { ShareDiagnosisCard } from '@/components/viral/share-diagnosis-card';
import { ReferralSystem } from '@/components/viral/referral-system';
import { buildCalculatorRichSnippet, jsonLd } from '@/lib/json-ld';
import { PopularCalculatorsHub } from '@/components/popular-calculators-hub';
import { CalculatorRetentionFunnel } from '@/components/calculator-retention-funnel';
import { InArticleAdvertisement, MultiplexAdvertisement } from '@/components/public-advertisement';
import { CalculatorSaveAction } from '@/components/calculator-save-action';
import { CalculatorConversionBanner } from '@/components/calculator-conversion-banner';
import { SocialShareBar } from '@/components/social-share-bar';

interface PresetPageProps {
  readonly params: Promise<{ readonly preset: string }>;
}

export const revalidate = 86400; // 24시간 On-Demand ISR 캐싱

export async function generateStaticParams() {
  const stockPresets = STOCK_PRESETS.map((p) => ({ preset: p.slug }));
  const popularPseo = ALL_PSEO_POPULAR_SLUGS.slice(0, 80).map((slug) => ({ preset: slug }));
  return [...stockPresets, ...popularPseo];
}

export async function generateMetadata({ params }: PresetPageProps): Promise<Metadata> {
  const { preset } = await params;
  const data = getPresetBySlug('stock', preset) || getPseoStockPreset(preset);
  if (!data) return { title: '주식 물타기 계산기 프리셋' };

  return {
    title: `${data.metaTitle} | 월덕 머니버스`,
    description: data.metaDescription,
    keywords: [
      data.title,
      '주식 물타기 계산기',
      '평단가 낮추기',
      '물타기 손익분기점',
      '주식 평단가 역산',
      '반토막 탈출 공식',
      '주식 수익률 계산기',
      '가상 주식 모의투자',
    ],
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      url: `https://easy-scraping.com/tools/stock-calculator/${data.slug}`,
      type: 'article',
    },
    alternates: {
      canonical: `https://easy-scraping.com/tools/stock-calculator/${data.slug}`,
    },
  };
}

export default async function StockPresetPage({ params }: PresetPageProps) {
  const { preset } = await params;
  const data = getPresetBySlug('stock', preset) || getPseoStockPreset(preset);
  if (!data) notFound();

  // 5중 리치 스니펫 (WebApplication + AggregateRating 별점 4.9 + FAQPage + HowTo + Breadcrumbs)
  const richSchemas = buildCalculatorRichSnippet({
    name: data.title,
    description: data.metaDescription,
    url: `https://easy-scraping.com/tools/stock-calculator/${data.slug}`,
    category: '주식 물타기 평단가 계산기',
    faqs: data.faqs,
    howToSteps: data.howToSteps,
  });

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8">
      {/* Schema.org High-CTR 구조화 데이터 */}
      {richSchemas.map((schema, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
        />
      ))}

      <div className="max-w-4xl mx-auto space-y-8">
        {/* 네비게이션 빵부스러기 */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          <Link href="/" className="hover:text-foreground transition-colors">홈</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/tools" className="hover:text-foreground transition-colors">금융 도구</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/tools/stock-calculator" className="hover:text-foreground transition-colors">주식 물타기·평단가 계산기</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{data.title}</span>
        </div>

        {/* 상단 헤더 */}
        <div className="space-y-4 border-b border-border pb-6">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {data.badge}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 증권 거래세/수수료 완벽 반영
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {data.heading}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {data.summary}
          </p>
        </div>

        {/* 핵심 시뮬레이션 결과 하이라이트 카드 */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-card to-card border border-emerald-500/30 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <Sparkles className="w-4 h-4" /> 물타기 시뮬레이션 결과
            </div>
            <Link
              href="/tools/stock-calculator"
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition-colors"
            >
              내 종목으로 직접 계산하기 <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-background/80 border border-border/80 space-y-1">
              <span className="text-xs text-muted-foreground">{data.calculatedResult.primaryLabel}</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                {data.calculatedResult.primaryValue}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-background/80 border border-border/80 space-y-1">
              <span className="text-xs text-muted-foreground">{data.calculatedResult.secondaryLabel}</span>
              <div className="text-lg sm:text-xl font-bold text-blue-400 font-mono">
                {data.calculatedResult.secondaryValue}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-background/80 border border-border/80 space-y-1">
              <span className="text-xs text-muted-foreground">{data.calculatedResult.tertiaryLabel}</span>
              <div className="text-lg sm:text-xl font-bold text-amber-400 font-mono">
                {data.calculatedResult.tertiaryValue}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-xs text-muted-foreground leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span>💡 {data.calculatedResult.detailText}</span>
            <div className="shrink-0 flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <CalculatorSaveAction
                scenario={{
                  type: 'stock',
                  title: data.title,
                  badge: data.badge,
                  primaryMetric: {
                    label: data.calculatedResult.primaryLabel,
                    value: data.calculatedResult.primaryValue,
                  },
                  secondaryMetric: {
                    label: data.calculatedResult.secondaryLabel,
                    value: data.calculatedResult.secondaryValue,
                  },
                  details: {
                    ticker: data.slug,
                    summary: data.summary,
                  },
                }}
              />
              <ShareDiagnosisCard
                title={data.title}
                type="stock"
                primaryMetric={{
                  label: data.calculatedResult.primaryLabel,
                  value: data.calculatedResult.primaryValue,
                }}
                secondaryMetric={{
                  label: data.calculatedResult.secondaryLabel,
                  value: data.calculatedResult.secondaryValue,
                }}
                badge={data.badge}
                summary={data.summary}
              />
              <SocialShareBar
                title={`${data.title} - 머니버스 물타기 계산기`}
                description={`목표 평단가 ${data.calculatedResult.primaryValue} 달성을 위한 최적 매수 시나리오를 확인해보세요.`}
                hashtags={['머니버스', '물타기계산기', '주식모의투자', '재테크']}
              />
            </div>
          </div>
        </div>

        {/* 고단가 금융 인아티클 네이티브 광고 (결과 직후 최고 주목도 지면) */}
        <InArticleAdvertisement className="my-6" />

        {/* 방문자 ➡️ 이용자 전환 및 리텐션 온보딩 퍼널 (1초 저장, 10,000 WLD 지원금, 데일리 배당) */}
        <CalculatorRetentionFunnel
          stockName={data.title.split(' ')[0] || '가상 종목'}
          ticker={data.slug}
          targetPrice={data.calculatedResult.primaryValue}
          reboundRate={data.calculatedResult.secondaryValue}
          category="stock"
        />

        {/* 단계별 HowTo 가이드 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            {data.title} 실전 매매 전략
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.howToSteps.map((step, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-card border border-border space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <h3 className="font-semibold text-sm text-foreground">{step.name}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ 아코디언/질의응답 섹션 */}
        <div className="space-y-4 border-t border-border pt-6">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-400" /> 자주 묻는 질문 (FAQ)
          </h2>
          <div className="space-y-3">
            {data.faqs.map((faq, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-card border border-border space-y-1.5">
                <h3 className="font-semibold text-sm text-foreground">Q. {faq.question}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">A. {faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 고단가 멀티플렉스 추천 광고 단위 (콘텐츠 종료 후 전환/이탈 방지 지면) */}
        <MultiplexAdvertisement className="my-8" />

        {/* 실전 모의투자 전환 & 10,000 WLD 지원금 락인 배너 */}
        <div className="pt-2">
          <CalculatorConversionBanner
            title={`${data.title} 시뮬레이션 완료! 실전 모의투자로 테스트`}
            description="계산된 평단가 전략을 실제 10-Depth 실시간 호가창에서 테스트해보세요. 가입 즉시 10,000 WLD 지원금이 100% 무료 지급됩니다."
            targetSymbol="CHIPS"
          />
        </div>

        {/* 바이럴 리퍼럴 배너 */}
        <div className="border-t border-border pt-6">
          <ReferralSystem />
        </div>

        {/* 타 프리셋 바로가기 추천 */}
        <div className="space-y-3 border-t border-border pt-6">
          <h3 className="text-sm font-semibold text-foreground">다른 주식 물타기 인기 프리셋 둘러보기</h3>
          <div className="flex flex-wrap gap-2">
            {STOCK_PRESETS.filter((p) => p.slug !== data.slug).map((p) => (
              <Link
                key={p.slug}
                href={`/tools/stock-calculator/${p.slug}`}
                className="px-3 py-1.5 text-xs rounded-lg bg-card hover:bg-muted border border-border transition-colors text-muted-foreground hover:text-foreground"
              >
                {p.title}
              </Link>
            ))}
          </div>
        </div>

        {/* 상호 내부 링크(Internal Linking) 허브 위젯 */}
        <PopularCalculatorsHub currentCategory="stock" />

        {/* 하단 액션 버튼 바 */}
        <div className="flex items-center justify-between pt-4">
          <Link
            href="/tools/stock-calculator"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> 주식 계산기 메인으로
          </Link>
          <Link
            href="/stocks"
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/20"
          >
            <TrendingUp className="w-4 h-4" /> 가상 주식 거래소 바로가기
          </Link>
        </div>
      </div>
    </div>
  );
}
