import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, ArrowLeft, Briefcase, Sparkles, HelpCircle, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { FARMING_PRESETS, getPresetBySlug } from '@/config/seo-presets.config';

interface PresetPageProps {
  readonly params: Promise<{ readonly preset: string }>;
}

export async function generateStaticParams() {
  return FARMING_PRESETS.map((p) => ({ preset: p.slug }));
}

export async function generateMetadata({ params }: PresetPageProps): Promise<Metadata> {
  const { preset } = await params;
  const data = getPresetBySlug('farming', preset);
  if (!data) return { title: '직업 파밍 수익 시뮬레이터 프리셋' };

  return {
    title: `${data.metaTitle} | 월덕 머니버스`,
    description: data.metaDescription,
    keywords: [
      data.title,
      '직업 파밍 수익 시뮬레이터',
      '일일 WLD 채굴량',
      '직급별 에너지 효율',
      '직업 공략',
      '파밍 루틴 최적화',
      '무자본 공략',
      '가상경제 게임',
    ],
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      url: `https://easy-scraping.com/tools/farming-calculator/${data.slug}`,
      type: 'article',
    },
    alternates: {
      canonical: `https://easy-scraping.com/tools/farming-calculator/${data.slug}`,
    },
  };
}

export default async function FarmingPresetPage({ params }: PresetPageProps) {
  const { preset } = await params;
  const data = getPresetBySlug('farming', preset);
  if (!data) notFound();

  // 4중 리치 스니펫 (Schema.org JSON-LD)
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `${data.title} 실전 파밍 가이드`,
    step: data.howToSteps.map((step, idx) => ({
      '@type': 'HowToStep',
      position: idx + 1,
      name: step.name,
      text: step.text,
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '홈',
        item: 'https://easy-scraping.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '금융 도구',
        item: 'https://easy-scraping.com/tools',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: '직업 파밍 수익 시뮬레이터',
        item: 'https://easy-scraping.com/tools/farming-calculator',
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: data.title,
        item: `https://easy-scraping.com/tools/farming-calculator/${data.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8">
      {/* Schema.org 구조화 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* 네비게이션 빵부스러기 */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          <Link href="/" className="hover:text-foreground transition-colors">홈</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/tools" className="hover:text-foreground transition-colors">금융 도구</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/tools/farming-calculator" className="hover:text-foreground transition-colors">직업 파밍 수익 시뮬레이터</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{data.title}</span>
        </div>

        {/* 상단 헤더 */}
        <div className="space-y-4 border-b border-border pb-6">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {data.badge}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> 실시간 에너지 효율 알고리즘
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
        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-950/40 via-card to-card border border-amber-500/30 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <Sparkles className="w-4 h-4" /> 파밍 수익 시뮬레이션 결과
            </div>
            <Link
              href="/tools/farming-calculator"
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors"
            >
              내 직급으로 직접 계산하기 <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-background/80 border border-border/80 space-y-1">
              <span className="text-xs text-muted-foreground">{data.calculatedResult.primaryLabel}</span>
              <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
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
              <div className="text-lg sm:text-xl font-bold text-emerald-400 font-mono">
                {data.calculatedResult.tertiaryValue}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-amber-500/5 border border-amber-500/10 text-xs text-muted-foreground leading-relaxed">
            💡 {data.calculatedResult.detailText}
          </div>
        </div>

        {/* 단계별 HowTo 가이드 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-amber-400" />
            {data.title} 실전 루틴 가이드
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.howToSteps.map((step, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-card border border-border space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center font-mono">
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
            <HelpCircle className="w-5 h-5 text-amber-400" /> 자주 묻는 질문 (FAQ)
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

        {/* 타 프리셋 바로가기 추천 */}
        <div className="space-y-3 border-t border-border pt-6">
          <h3 className="text-sm font-semibold text-foreground">다른 직업 파밍 인기 프리셋 둘러보기</h3>
          <div className="flex flex-wrap gap-2">
            {FARMING_PRESETS.filter((p) => p.slug !== data.slug).map((p) => (
              <Link
                key={p.slug}
                href={`/tools/farming-calculator/${p.slug}`}
                className="px-3 py-1.5 text-xs rounded-lg bg-card hover:bg-muted border border-border transition-colors text-muted-foreground hover:text-foreground"
              >
                {p.title}
              </Link>
            ))}
          </div>
        </div>

        {/* 하단 액션 버튼 바 */}
        <div className="flex items-center justify-between pt-4">
          <Link
            href="/tools/farming-calculator"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> 파밍 계산기 메인으로
          </Link>
          <Link
            href="/work"
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg bg-amber-600 text-white hover:bg-amber-500 transition-colors shadow-lg shadow-amber-500/20"
          >
            <Zap className="w-4 h-4" /> 직업 업무 하러가기
          </Link>
        </div>
      </div>
    </div>
  );
}
