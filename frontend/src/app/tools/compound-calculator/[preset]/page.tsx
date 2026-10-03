import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, ArrowLeft, TrendingUp, Sparkles, HelpCircle, CheckCircle2, ShieldCheck, Share2 } from 'lucide-react';
import { COMPOUND_PRESETS, getPresetBySlug } from '@/config/seo-presets.config';
import { ShareDiagnosisCard } from '@/components/viral/share-diagnosis-card';
import { ReferralSystem } from '@/components/viral/referral-system';
import { buildCalculatorRichSnippet, jsonLd } from '@/lib/json-ld';
import { PopularCalculatorsHub } from '@/components/popular-calculators-hub';

interface PresetPageProps {
  readonly params: Promise<{ readonly preset: string }>;
}

export const revalidate = 86400; // 24시간 On-Demand ISR 캐싱

export async function generateStaticParams() {
  return COMPOUND_PRESETS.map((p) => ({ preset: p.slug }));
}

export async function generateMetadata({ params }: PresetPageProps): Promise<Metadata> {
  const { preset } = await params;
  const data = getPresetBySlug('compound', preset);
  if (!data) return { title: '복리 계산기 프리셋' };

  return {
    title: `${data.metaTitle} | 월덕 머니버스`,
    description: data.metaDescription,
    keywords: [
      data.title,
      '복리 계산기',
      '적금 이자 계산',
      '예금 만기 수령액',
      '목돈 굴리기',
      '1억 모으기',
      '복리 수익률',
      '가상 금융 시뮬레이터',
    ],
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      url: `https://easy-scraping.com/tools/compound-calculator/${data.slug}`,
      type: 'article',
    },
    alternates: {
      canonical: `https://easy-scraping.com/tools/compound-calculator/${data.slug}`,
    },
  };
}

export default async function CompoundPresetPage({ params }: PresetPageProps) {
  const { preset } = await params;
  const data = getPresetBySlug('compound', preset);
  if (!data) notFound();

  // 5중 리치 스니펫 (WebApplication + AggregateRating 별점 4.9 + FAQPage + HowTo + Breadcrumbs)
  const richSchemas = buildCalculatorRichSnippet({
    name: data.title,
    description: data.metaDescription,
    url: `https://easy-scraping.com/tools/compound-calculator/${data.slug}`,
    category: '복리 예적금 계산기',
    faqs: data.faqs,
    howToSteps: data.howToSteps,
  });

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8">
      {/* Schema.org 5중 High-CTR 구조화 데이터 */}
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
          <Link href="/tools/compound-calculator" className="hover:text-foreground transition-colors">복리 예적금 계산기</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{data.title}</span>
        </div>

        {/* 상단 헤더 */}
        <div className="space-y-4 border-b border-border pb-6">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {data.badge}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 공식 핀테크 인증 알고리즘
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
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-950/40 via-card to-card border border-blue-500/30 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
              <Sparkles className="w-4 h-4" /> 핵심 시뮬레이션 계산 결과
            </div>
            <Link
              href="/tools/compound-calculator"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition-colors"
            >
              커스텀 값으로 직접 계산하기 <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-background/80 border border-border/80 space-y-1">
              <span className="text-xs text-muted-foreground">{data.calculatedResult.primaryLabel}</span>
              <div className="text-xl sm:text-2xl font-black text-blue-400 font-mono">
                {data.calculatedResult.primaryValue}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-background/80 border border-border/80 space-y-1">
              <span className="text-xs text-muted-foreground">{data.calculatedResult.secondaryLabel}</span>
              <div className="text-lg sm:text-xl font-bold text-emerald-400 font-mono">
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

          <div className="p-3.5 rounded-lg bg-blue-500/5 border border-blue-500/10 text-xs text-muted-foreground leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span>💡 {data.calculatedResult.detailText}</span>
            <div className="shrink-0">
              <ShareDiagnosisCard
                title={data.title}
                type="compound"
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
            </div>
          </div>
        </div>

        {/* 단계별 HowTo 가이드 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            {data.title} 실전 가이드
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.howToSteps.map((step, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-card border border-border space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center font-mono">
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
            <HelpCircle className="w-5 h-5 text-blue-400" /> 자주 묻는 질문 (FAQ)
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

        {/* 바이럴 리퍼럴 배너 */}
        <div className="border-t border-border pt-6">
          <ReferralSystem />
        </div>

        {/* 타 프리셋 바로가기 추천 */}
        <div className="space-y-3 border-t border-border pt-6">
          <h3 className="text-sm font-semibold text-foreground">다른 인기 복리 계산기 프리셋 둘러보기</h3>
          <div className="flex flex-wrap gap-2">
            {COMPOUND_PRESETS.filter((p) => p.slug !== data.slug).map((p) => (
              <Link
                key={p.slug}
                href={`/tools/compound-calculator/${p.slug}`}
                className="px-3 py-1.5 text-xs rounded-lg bg-card hover:bg-muted border border-border transition-colors text-muted-foreground hover:text-foreground"
              >
                {p.title}
              </Link>
            ))}
          </div>
        </div>

        {/* 상호 내부 링크(Internal Linking) 허브 위젯 */}
        <PopularCalculatorsHub currentCategory="compound" />

        {/* 하단 액션 버튼 바 */}
        <div className="flex items-center justify-between pt-4">
          <Link
            href="/tools/compound-calculator"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> 복리 계산기 메인으로
          </Link>
          <Link
            href="/bank"
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20"
          >
            <TrendingUp className="w-4 h-4" /> 가상 은행 복리 가입하기
          </Link>
        </div>
      </div>
    </div>
  );
}
