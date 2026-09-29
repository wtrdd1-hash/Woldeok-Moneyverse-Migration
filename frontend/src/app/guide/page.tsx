import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Compass,
  Dices,
  Landmark,
  Sparkles,
  Store,
  TrendingUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TranslatedText as T } from '@/components/translated-text';
import {
  BEGINNER_TIPS,
  ECONOMY_PILLARS,
  CURRENT_IMPLEMENTED_FEATURES,
  GROWTH_STAGES,
  GUIDE_FAQS,
  GUIDE_STEPS,
  QUICK_START_STEPS,
  QUICK_START_STEPS_EN,
} from './guide';
import { OnboardingRoadmap } from './components/onboarding-roadmap';
import { AssetSimulator } from './components/asset-simulator';
import { OnboardingChecklist } from './components/onboarding-checklist';
import { EconomyFlowDiagram } from './components/economy-flow-diagram';
import { GlossarySearch } from './components/glossary-search';
import { PowerUserCheatSheet } from './components/power-user-cheat-sheet';
import { canonicalUrl, breadcrumbJsonLd, faqPageJsonLd } from '@/lib/seo';
import { jsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
  title: '사이트 이용 가이드 & 인터랙티브 온보딩 허브 (User Guide)',
  description:
    '월덕 머니버스를 3분 만에 마스터하는 인터랙티브 온보딩 가이드. 5단계 로드맵, 1분 모의 자산 시뮬레이터, 온보딩 퀘스트 체크리스트, 8대 직업, 은행 복리 예금, 10대 가상 주식 거래소 및 기업 창업 가이드.',
  alternates: { canonical: canonicalUrl('/guide') },
};

const PILLAR_ICONS = {
  bank: Landmark,
  work: Briefcase,
  businesses: Building2,
  shop: Store,
  casino: Dices,
} as const;

export default function GuidePage() {
  const guideBreadcrumb = breadcrumbJsonLd([
    { name: '홈', path: '/' },
    { name: '이용 가이드', path: '/guide' },
  ]);

  const guideFaqSchema = faqPageJsonLd(
    GUIDE_FAQS.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
    })),
  );

  return (
    <div data-page="guide" className="mv-page mv-page--utility mx-auto max-w-6xl space-y-12 sm:space-y-16 py-6 sm:py-10">
      {/* Schema.org Breadcrumb & FAQPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(guideBreadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(guideFaqSchema) }}
      />

      {/* 1. HERO MASTHEAD: 2026 Asymmetric FinTech Bento Grid */}
      <section className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-primary/15 via-card to-background p-6 sm:p-10 lg:p-12 shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-black text-primary shadow-xs">
            <Sparkles className="size-3.5" aria-hidden />
            <span>INTERACTIVE ONBOARDING HUB</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight sm:text-5xl text-foreground">
            <T
              korean="3분 만에 마스터하는 머니버스 이용 가이드"
              english="Master Moneyverse in 3 Minutes: Interactive Guide"
            />
          </h1>

          <p className="text-sm sm:text-base leading-relaxed text-muted-foreground [word-break:keep-all]">
            <T
              korean="월덕 머니버스는 Discord 커뮤니티와 연동된 차세대 분산 가상경제 포털입니다. 8대 직업 활동부터 복리 예금, 10대 가상 주식 거래, 스타트업 창업과 클럽 영지까지 모든 기능을 손쉽게 시작할 수 있도록 안내해 드립니다."
              english="Woldeok Moneyverse is a next-generation community virtual economy. Start earning from 8 careers, compound savings, stock trading, and enterprise founding with this interactive walkthrough."
            />
          </p>

          {/* Quick Summary Pill Strip */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="outline" className="bg-background/80 text-foreground border-border/70 text-xs py-1 px-3">
              ⚡ 5단계 인터랙티브 로드맵
            </Badge>
            <Badge variant="outline" className="bg-background/80 text-foreground border-border/70 text-xs py-1 px-3">
              📊 1분 모의 자산 시뮬레이터
            </Badge>
            <Badge variant="outline" className="bg-background/80 text-foreground border-border/70 text-xs py-1 px-3">
              🏆 온보딩 퀘스트 & 뱃지
            </Badge>
            <Badge variant="outline" className="bg-background/80 text-foreground border-border/70 text-xs py-1 px-3">
              🛡️ 100% 무손실 복식부기 원장
            </Badge>
          </div>

          {/* 5 Pillar Deep Dive Links Grid */}
          <div className="pt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/guide/stock-trading"
              className="flex items-center justify-between rounded-xl border border-border/80 bg-background/80 p-3.5 text-xs transition-all hover:border-primary/50 hover:bg-card hover:shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <TrendingUp className="size-4" />
                </div>
                <div>
                  <div className="font-bold text-foreground">가상 주식 실전 매매</div>
                  <div className="text-[11px] text-muted-foreground">10-Depth 호가 & AI 감성 매매법</div>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>

            <Link
              href="/guide/virtual-banking"
              className="flex items-center justify-between rounded-xl border border-border/80 bg-background/80 p-3.5 text-xs transition-all hover:border-primary/50 hover:bg-card hover:shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Landmark className="size-4" />
                </div>
                <div>
                  <div className="font-bold text-foreground">가상 금융 & 복리 예금</div>
                  <div className="text-[11px] text-muted-foreground">일일 복리 이자 & 국채 공략</div>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>

            <Link
              href="/guide/career-mastery"
              className="flex items-center justify-between rounded-xl border border-border/80 bg-background/80 p-3.5 text-xs transition-all hover:border-primary/50 hover:bg-card hover:shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                  <Briefcase className="size-4" />
                </div>
                <div>
                  <div className="font-bold text-foreground">8대 직업 파밍 루틴</div>
                  <div className="text-[11px] text-muted-foreground">숙련도 2.5배 배수 & 일일 캡</div>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>

            <Link
              href="/guide/dopamine-system"
              className="flex items-center justify-between rounded-xl border border-border/80 bg-background/80 p-3.5 text-xs transition-all hover:border-primary/50 hover:bg-card hover:shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <div className="font-bold text-foreground">도파민 & 공정 확률 가이드</div>
                  <div className="text-[11px] text-muted-foreground">스타 드롭 5연속 탭 & 스트릭</div>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>

            <Link
              href="/guide/glossary"
              className="flex items-center justify-between rounded-xl border border-border/80 bg-background/80 p-3.5 text-xs transition-all hover:border-primary/50 hover:bg-card hover:shadow-xs sm:col-span-2 lg:col-span-2"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500">
                  <Compass className="size-4" />
                </div>
                <div>
                  <div className="font-bold text-foreground">핀테크 핵심 용어사전 전체 열람</div>
                  <div className="text-[11px] text-muted-foreground">복식부기, 멱등성, 스프레드, M0 통화량 등 20+개 용어 완벽 해설</div>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE 5-STEP ROADMAP (핵심 5단계 로드맵) */}
      <section aria-labelledby="roadmap-section-heading" className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-primary">5-STEP INTERACTIVE ROADMAP</p>
            <h2 id="roadmap-section-heading" className="text-2xl font-black tracking-tight sm:text-3xl text-foreground">
              <T korean="입문에서 대표 자본가까지 5단계 로드맵" english="5-Step Road to Virtual Mogul" />
            </h2>
          </div>
          <p className="text-xs text-muted-foreground [word-break:keep-all]">
            각 단계를 클릭하여 핵심 체크포인트와 상세 액션을 확인하세요.
          </p>
        </div>
        <OnboardingRoadmap />
      </section>

      {/* 3. ASSET SIMULATOR (1분 모의 자산 형성 시뮬레이터) */}
      <AssetSimulator />

      {/* 4. ONBOARDING CHECKLIST & BADGE (온보딩 퀘스트 & 뱃지) */}
      <OnboardingChecklist />

      {/* 5. ECONOMIC FLOW DIAGRAM (가상경제 선순환 다이어그램) */}
      <EconomyFlowDiagram />

      {/* 6. GLOSSARY SEARCH (실시간 용어 검색 및 카테고리 필터) */}
      <GlossarySearch />

      {/* 7. POWER USER CHEAT SHEET (파워 유저 실전 치트시트) */}
      <PowerUserCheatSheet />

      {/* 8. 가상경제 5대 핵심 기둥 (5 Pillars of Virtual Economy) */}
      <section aria-labelledby="pillars-title" className="space-y-6">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow mb-1 text-primary">VIRTUAL ECONOMY PILLARS</p>
            <h2 id="pillars-title" className="text-2xl font-black tracking-tight sm:text-3xl">
              <T
                korean="머니버스 가상경제 5대 핵심 기둥"
                english="5 Pillars of the Virtual Economy"
              />
            </h2>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground [word-break:keep-all]">
            <T
              korean="단순 활동 보상을 넘어 금융·직업·기업·상점·엔터테인먼트가 하나로 맞물려 선순환하는 완성형 경제 구조를 제공합니다."
              english="Experience a complete economic architecture where banking, careers, businesses, commerce, and gaming harmonize."
            />
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {ECONOMY_PILLARS.map((pillar) => {
            const Icon = PILLAR_ICONS[pillar.id as keyof typeof PILLAR_ICONS] ?? Landmark;
            return (
              <Card
                key={pillar.id}
                className="flex flex-col justify-between border bg-card transition-all duration-200 hover:border-primary/40 hover:shadow-md"
              >
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-6" aria-hidden />
                    </div>
                    <span className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                      <T korean={pillar.badgeKo} english={pillar.badgeEn} />
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold leading-snug">
                      <T korean={pillar.titleKo} english={pillar.titleEn} />
                    </CardTitle>
                    <CardDescription className="mt-2 text-xs leading-[1.7] [word-break:keep-all]">
                      <T korean={pillar.descKo} english={pillar.descEn} />
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="space-y-1.5 rounded-lg border bg-muted/30 p-3 text-xs">
                    {pillar.featuresKo.map((feat, fIdx) => (
                      <div key={feat} className="flex items-start gap-2">
                        <CheckCircle2
                          className="mt-0.5 size-3.5 shrink-0 text-emerald-500"
                          aria-hidden
                        />
                        <span className="text-muted-foreground">
                          <T korean={feat} english={pillar.featuresEn[fIdx] ?? feat} />
                        </span>
                      </div>
                    ))}
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-between text-xs font-semibold min-h-[44px]"
                  >
                    <Link href={pillar.link.href}>
                      <span>
                        <T
                          korean={pillar.link.label}
                          english={pillar.link.labelEn ?? pillar.link.label}
                        />
                      </span>
                      <ChevronRight className="size-3.5" aria-hidden />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 9. FAQ Section */}
      <section aria-labelledby="faq-title" className="space-y-6">
        <div className="flex items-center gap-3">
          <CircleHelp className="size-7 text-primary" aria-hidden />
          <div>
            <p className="eyebrow mb-1 text-primary">COMMON QUESTIONS</p>
            <h2 id="faq-title" className="text-2xl font-black tracking-tight sm:text-3xl">
              <T korean="자주 묻는 질문 (FAQ)" english="Frequently Asked Questions" />
            </h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {GUIDE_FAQS.map((faq) => (
            <Card key={faq.question} className="flex flex-col justify-between border">
              <CardHeader className="space-y-2">
                <CardTitle className="text-sm font-bold leading-snug">
                  <T korean={faq.question} english={faq.questionEn} />
                </CardTitle>
                <CardDescription className="text-xs leading-[1.8] [word-break:keep-all]">
                  <T korean={faq.answer} english={faq.answerEn} />
                </CardDescription>
              </CardHeader>
              {faq.link && (
                <CardContent className="pt-0">
                  <Link
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary transition-colors hover:underline min-h-[32px]"
                    href={faq.link.href}
                  >
                    <T korean={faq.link.label} english={faq.link.labelEn ?? faq.link.label} />
                    <ArrowRight className="size-3" aria-hidden />
                  </Link>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* 10. Bottom CTA */}
      <section className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-background to-primary/5 px-6 py-12 text-center shadow-sm">
        <div className="mx-auto max-w-xl space-y-4">
          <span className="inline-grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-6" aria-hidden />
          </span>
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
            <T
              korean="준비됐다면, 지금 바로 머니버스를 시작해 보세요!"
              english="Ready? Begin Your Moneyverse Journey Now!"
            />
          </h2>
          <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm [word-break:keep-all]">
            <T
              korean="모든 시스템을 외울 필요 없이, 잡보드에서 마음에 드는 직업 하나를 고르는 것으로 당신만의 가상 자산 여정이 시작됩니다."
              english="No need to memorize everything at once. Pick a career on the Work Board to start your virtual wealth journey."
            />
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button asChild size="lg" className="min-h-[44px] font-bold">
              <Link href="/login">
                <T korean="계정 로그인 시작하기" english="Start Sign In" />
                <ArrowRight className="ml-2 size-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-h-[44px] font-bold">
              <Link href="/work">
                <T korean="8대 직업 작업판 가기" english="Go to Work Board" />
                <Briefcase className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
