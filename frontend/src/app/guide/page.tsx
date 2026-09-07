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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TranslatedText as T } from '@/components/translated-text';
import {
  BEGINNER_TIPS,
  ECONOMY_PILLARS,
  FIRST_DAY_ORDER,
  FIRST_DAY_ORDER_EN,
  GROWTH_STAGES,
  GUIDE_FAQS,
  GUIDE_STEPS,
  QUICK_START_STEPS,
  QUICK_START_STEPS_EN,
} from './guide';

export const metadata: Metadata = {
  title: '시작 가이드 | 월덕 머니버스 (Getting Started Guide)',
  description:
    '월덕 머니버스를 처음 이용하는 분을 위한 가상경제 입문서. 8대 전문 직업, 일일 퀘스트, 은행 복리 예금과 국채, 가상 사업체 창업 및 주식 거래소, 아이템 상점과 카지노 이용 방법을 안내합니다.',
};

const PILLAR_ICONS = {
  bank: Landmark,
  work: Briefcase,
  businesses: Building2,
  shop: Store,
  casino: Dices,
} as const;

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-16 py-6 sm:py-10">
      {/* 1. Hero & Quick Start */}
      <section className="relative overflow-hidden rounded-[28px] border bg-gradient-to-br from-primary/10 via-background to-accent/20 p-6 sm:p-12 shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <Sparkles className="size-3.5" aria-hidden />
            <span>GETTING STARTED GUIDE</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            <T
              korean="5분 만에 이해하는 머니버스 시작하기"
              english="5-Minute Guide to Woldeok Moneyverse"
            />
          </h1>
          <p className="text-sm leading-[1.8] text-muted-foreground sm:text-base [word-break:keep-all]">
            <T
              korean="월덕 머니버스는 Discord 커뮤니티와 긴밀하게 이어지는 차세대 가상경제 포털입니다. 8대 전문 직업, 일일 퀘스트, 은행 복리 예금과 국채, 가상 기업 창업 및 주식 거래소, 상점과 카지노까지 하나의 완성된 경제 생태계를 자유롭게 누려보세요."
              english="Woldeok Moneyverse is an interconnected virtual economy portal linked with Discord. Explore 8 professions, daily quests, compound bank savings, virtual enterprise founding, stock exchange, items shop, and casino entertainment."
            />
          </p>

          <div className="pt-2">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              <T korean="⚡ 빠른 시작 4단계 요약" english="⚡ Quick Start 4-Step Summary" />
            </p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {QUICK_START_STEPS.map((step, idx) => (
                <div
                  key={step}
                  className="flex items-center gap-3 rounded-xl border bg-background/80 p-3 text-xs font-semibold backdrop-blur-sm sm:text-sm"
                >
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {idx + 1}
                  </span>
                  <span className="leading-snug">
                    <T korean={step} english={QUICK_START_STEPS_EN[idx] ?? step} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. 가상경제 5대 핵심 기둥 (5 Pillars) */}
      <section aria-labelledby="pillars-title" className="space-y-6">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow mb-1 text-primary">VIRTUAL ECONOMY PILLARS</p>
            <h2 id="pillars-title" className="text-2xl font-extrabold sm:text-3xl">
              <T
                korean="머니버스 가상경제 5대 핵심 기둥"
                english="5 Pillars of the Virtual Economy"
              />
            </h2>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground [word-break:keep-all]">
            <T
              korean="단순 활동 보상을 넘어 금융·직업·기업·상점·엔터테인먼트가 하나로 맞물려 선순환하는 완성형 경제 구조를 제공합니다."
              english="Beyond simple rewards, experience a complete economic architecture where banking, careers, businesses, commerce, and gaming harmonize."
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
                    className="w-full justify-between text-xs font-semibold"
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

      {/* 3. 4단계 가상경제 순환 루프 (Complete Economic Cycle) */}
      <section
        aria-labelledby="loop-title"
        className="rounded-[28px] border bg-gradient-to-b from-card via-card to-background p-6 sm:p-10 shadow-sm"
      >
        <div className="space-y-6">
          <div className="max-w-2xl space-y-2">
            <p className="eyebrow text-emerald-500">THE ECONOMIC LOOP</p>
            <h2 id="loop-title" className="text-2xl font-extrabold sm:text-3xl">
              <T
                korean="생산에서 증식, 투자, 소비로 이어지는 경제 순환"
                english="The Full Cycle: Production, Yield, Expansion & Leisure"
              />
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground [word-break:keep-all]">
              <T
                korean="머니버스의 재화(WLD)는 획득에 그치지 않고, 복리 예금과 기업 지분, 생산 도구와 여가 생활로 끊임없이 유기적으로 순환합니다."
                english="WLD is not just a digital number. It flows dynamically through compound savings, enterprise equities, productivity boosts, and gaming leisure."
              />
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: '1. 생산 및 활동',
                stepEn: '1. Production',
                titleKo: '퀘스트 & 8대 직업',
                titleEn: 'Quests & Careers',
                descKo: '출석 퀘스트 및 8대 전문 직업 활동을 통해 초기 시드 WLD를 채굴합니다.',
                descEn: 'Mint initial seed WLD through check-in quests and career assignments.',
                icon: Briefcase,
              },
              {
                step: '2. 저축 및 증식',
                stepEn: '2. Accumulation',
                titleKo: '은행 복리 예금 & 국채',
                titleEn: 'Bank Savings & Bonds',
                descKo:
                  '모은 WLD를 은행에 예치하고 누적 이자를 직접 정산하거나 가상 국채를 이용합니다.',
                descEn: 'Deposit WLD, claim accrued savings interest, or use virtual bonds.',
                icon: Landmark,
              },
              {
                step: '3. 투자 및 경영',
                stepEn: '3. Expansion',
                titleKo: '주식 매매 & 사업 창업',
                titleEn: 'Stocks & Enterprises',
                descKo:
                  '주식 거래소에서 지분을 매매하고 나만의 사업체를 설립해 매일 배당을 받습니다.',
                descEn:
                  'Trade shares on the exchange and found enterprises to earn daily dividends.',
                icon: TrendingUp,
              },
              {
                step: '4. 소비 및 여가',
                stepEn: '4. Consumption',
                titleKo: '상점 도구 & 카지노 게임',
                titleEn: 'Shop Tools & Casino',
                descKo: '생산 장비를 상점에서 구입하고 한도가 적용되는 가상 미니게임을 즐깁니다.',
                descEn:
                  'Acquire tools in the shop and play virtual mini-games with optional self-limits.',
                icon: Store,
              },
            ].map(({ step, stepEn, titleKo, titleEn, descKo, descEn, icon: Icon }) => (
              <div
                key={step}
                className="relative flex flex-col justify-between rounded-2xl border bg-background/70 p-5 shadow-xs transition-all hover:border-primary/40"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-primary">
                      <T korean={step} english={stepEn} />
                    </span>
                    <Icon className="size-5 text-muted-foreground" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">
                      <T korean={titleKo} english={titleEn} />
                    </h3>
                    <p className="mt-1 text-xs leading-[1.7] text-muted-foreground [word-break:keep-all]">
                      <T korean={descKo} english={descEn} />
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. 플레이어 3단계 성장 로드맵 (Growth Stages) */}
      <section aria-labelledby="roadmap-title" className="space-y-6">
        <div className="space-y-1.5">
          <p className="eyebrow text-primary">PLAYER ROADMAP</p>
          <h2 id="roadmap-title" className="text-2xl font-extrabold sm:text-3xl">
            <T
              korean="초보자에서 대표 자본가로의 3단계 성장 여정"
              english="From Beginner to Virtual Mogul: 3 Growth Stages"
            />
          </h2>
          <p className="max-w-prose text-xs leading-relaxed text-muted-foreground [word-break:keep-all]">
            <T
              korean="누구나 가장 쉬운 퀘스트 하나로 시작하여 전문 직업인이 되고, 복리 예금과 주식 투자를 거쳐 기업의 주인이 될 수 있습니다."
              english="Anyone can start with a simple quest, advance into specialized careers, and scale into corporate ownership through savings and investments."
            />
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {GROWTH_STAGES.map((stage) => (
            <Card key={stage.step} className="flex flex-col justify-between border bg-card">
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-xs font-black text-primary">
                    0{stage.step}
                  </span>
                  <span className="rounded-md border bg-muted/60 px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                    <T korean={stage.targetKo} english={stage.targetEn} />
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-primary">
                    <T korean={stage.stageKo} english={stage.stageEn} />
                  </span>
                  <CardTitle className="mt-1 text-base font-bold leading-snug">
                    <T korean={stage.titleKo} english={stage.titleEn} />
                  </CardTitle>
                </div>
                <CardDescription className="text-xs leading-[1.7] [word-break:keep-all]">
                  <T korean={stage.descKo} english={stage.descEn} />
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1.5 rounded-lg border bg-muted/30 p-3 text-xs">
                  <p className="font-extrabold text-foreground">
                    <T korean="추천 행동 지침:" english="Actionable Steps:" />
                  </p>
                  {stage.actionsKo.map((action, aIdx) => (
                    <div key={action} className="flex items-start gap-2">
                      <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
                      <span className="text-muted-foreground">
                        <T korean={action} english={stage.actionsEn[aIdx] ?? action} />
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. 5대 입문 필수 단계 (GUIDE_STEPS) */}
      <section aria-labelledby="steps-title" className="space-y-6">
        <div className="space-y-1.5">
          <p className="eyebrow text-primary">STEP-BY-STEP WALKTHROUGH</p>
          <h2 id="steps-title" className="text-2xl font-extrabold sm:text-3xl">
            <T korean="첫걸음 단계별 상세 안내" english="Detailed Step-by-Step Walkthrough" />
          </h2>
          <p className="text-xs text-muted-foreground">
            <T
              korean="계정 연동부터 첫 일거리 완료, 그리고 복리 예금과 상점 활용까지 순서대로 따라 해 보세요."
              english="Follow along from account connection to your first job, compound savings, and shop utilization."
            />
          </p>
        </div>

        <div className="grid gap-4">
          {GUIDE_STEPS.map((step, index) => (
            <Card key={step.id} className="border transition-all hover:border-primary/30">
              <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-sm font-extrabold text-primary-foreground shadow-xs">
                    0{index + 1}
                  </span>
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-bold">
                      <T korean={step.title} english={step.titleEn} />
                    </CardTitle>
                    <div className="space-y-2 text-xs leading-[1.8] text-muted-foreground [word-break:keep-all]">
                      {step.body.map((paragraph, pIdx) => (
                        <p key={paragraph}>
                          <T korean={paragraph} english={step.bodyEn[pIdx] ?? paragraph} />
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
                {step.link && (
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="shrink-0 self-start text-xs font-semibold"
                  >
                    <Link href={step.link.href}>
                      <T korean={step.link.label} english={step.link.labelEn ?? step.link.label} />
                      <ArrowRight className="ml-1 size-3.5" aria-hidden />
                    </Link>
                  </Button>
                )}
              </CardHeader>

              {step.points && (
                <CardContent className="pt-0 sm:pl-[68px]">
                  <div className="rounded-xl border bg-muted/30 p-3.5">
                    <p className="mb-2 text-xs font-extrabold text-foreground">
                      <T
                        korean="화면에서 눈여겨볼 핵심 포인트:"
                        english="Key Points to Look for on Screen:"
                      />
                    </p>
                    <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
                      {step.points.map((point, ptIdx) => (
                        <li key={point} className="flex items-center gap-2">
                          <CheckCircle2 className="size-3.5 text-emerald-500" aria-hidden />
                          <span>
                            <T
                              korean={point}
                              english={step.pointsEn ? (step.pointsEn[ptIdx] ?? point) : point}
                            />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* 6. 신규 유저 팁 & 첫날 체크리스트 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Tips */}
        <section aria-labelledby="tips-title" className="space-y-4">
          <div>
            <p className="eyebrow mb-1 text-primary">NEWCOMER TIPS</p>
            <h2 id="tips-title" className="text-xl font-extrabold">
              <T korean="헤매지 않는 작은 요령" english="Tips for Getting Started" />
            </h2>
          </div>
          <div className="space-y-3">
            {BEGINNER_TIPS.map((tip, index) => (
              <Card key={tip.title} className="border bg-card">
                <CardHeader className="flex-row items-start gap-3 space-y-0 p-4">
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-xs font-extrabold text-primary">
                    {index + 1}
                  </span>
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-bold">
                      <T korean={tip.title} english={tip.titleEn} />
                    </CardTitle>
                    <CardDescription className="text-xs leading-relaxed [word-break:keep-all]">
                      <T korean={tip.body} english={tip.bodyEn} />
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* First Day Checklist */}
        <section
          aria-labelledby="order-title"
          className="flex flex-col justify-between rounded-2xl border bg-gradient-to-br from-slate-900 to-slate-950 p-5 text-white shadow-md sm:p-6"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow mb-1 text-[#f2cd72]">CHECKLIST</p>
                <h2 id="order-title" className="text-xl font-extrabold text-white">
                  <T korean="첫날 추천 순서" english="First Day Checklist" />
                </h2>
              </div>
              <Compass className="size-8 text-[#f2cd72]" aria-hidden />
            </div>

            <ol className="space-y-2">
              {FIRST_DAY_ORDER.map((entry, index) => (
                <li
                  key={entry}
                  className="flex items-center gap-3 rounded-lg bg-white/5 p-2.5 text-xs text-white/90 [word-break:keep-all]"
                >
                  <span className="font-mono text-xs font-black text-[#f2cd72]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="leading-snug">
                    <T korean={entry} english={FIRST_DAY_ORDER_EN[index] ?? entry} />
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-white/60 [word-break:keep-all]">
            <T
              korean="첫날에는 여러 작업을 한 번에 벌리기보다, 퀘스트나 직업 일거리 하나를 마친 뒤 남은 WLD를 은행 복리 예금에 넣어두는 것부터 시작해 보세요."
              english="On your first day, finish one simple quest or job, then deposit your remaining WLD into Bank Compound Savings to start earning interest."
            />
          </p>
        </section>
      </div>

      <section aria-labelledby="operations-title" className="space-y-6">
        <div>
          <p className="eyebrow mb-1 text-primary">RELIABILITY & ECONOMY REFERENCES</p>
          <h2 id="operations-title" className="text-2xl font-extrabold sm:text-3xl">
            <T korean="통신 안정성과 경제 운영 원칙" english="Reliability and Economy Principles" />
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">패킷·요청 유실 방지</CardTitle>
              <CardDescription className="leading-relaxed">
                활동 이벤트에 고유 ID를 붙이고, 실패한 전송은 브라우저에 보관해 재시도하며 서버는
                중복을 제거합니다. 원장 변경 요청도 멱등 키를 사용합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3 text-xs font-semibold text-primary">
              <a
                href="https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon"
                target="_blank"
                rel="noreferrer"
              >
                MDN sendBeacon ↗
              </a>
              <a
                href="https://docs.stripe.com/api/idempotent_requests"
                target="_blank"
                rel="noreferrer"
              >
                Stripe 멱등 요청 ↗
              </a>
              <a
                href="https://docs.discord.com/developers/topics/rate-limits"
                target="_blank"
                rel="noreferrer"
              >
                Discord 재시도 정책 ↗
              </a>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">보상 제한 대신 소비처 확장</CardTitle>
              <CardDescription className="leading-relaxed">
                직업 작업은 일일 횟수 제한 없이 매번 전액 보상합니다. 발행된 WLD는 상점의 반복 구매
                상품, 금융·사업·거래·여가 기능으로 순환시키고 운영 지표로 균형을 점검합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3 text-xs font-semibold text-primary">
              <a
                href="https://docs.unity.com/en-us/economy/add-virtual-purchase"
                target="_blank"
                rel="noreferrer"
              >
                Unity 가상 구매 ↗
              </a>
              <a
                href="https://learn.microsoft.com/en-us/xbox/playfab/economy-monetization/economy-v2/quickstart"
                target="_blank"
                rel="noreferrer"
              >
                PlayFab 경제 ↗
              </a>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section aria-labelledby="faq-title" className="space-y-6">
        <div className="flex items-center gap-3">
          <CircleHelp className="size-7 text-primary" aria-hidden />
          <div>
            <p className="eyebrow mb-1 text-primary">COMMON QUESTIONS</p>
            <h2 id="faq-title" className="text-2xl font-extrabold sm:text-3xl">
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
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary transition-colors hover:underline"
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

      {/* 8. Bottom CTA */}
      <section className="relative overflow-hidden rounded-[28px] border bg-gradient-to-br from-primary/10 via-background to-primary/5 px-6 py-12 text-center shadow-xs">
        <div className="mx-auto max-w-xl space-y-4">
          <span className="inline-grid size-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-6" aria-hidden />
          </span>
          <h2 className="text-2xl font-extrabold sm:text-3xl">
            <T
              korean="준비됐다면, 지금 바로 시작해 보세요!"
              english="Ready? Begin Your Journey Now!"
            />
          </h2>
          <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm [word-break:keep-all]">
            <T
              korean="모든 시스템을 다 외울 필요는 없어요. 가장 마음에 드는 퀘스트 하나를 선택하는 것으로 당신의 머니버스 여정이 시작됩니다."
              english="You don't have to memorize every rule. Choose a single quest that catches your eye to begin your Moneyverse journey."
            />
          </p>
          <div className="pt-2">
            <Button asChild size="lg" className="font-bold">
              <Link href="/login">
                <T korean="머니버스 시작하기" english="Start Moneyverse" />
                <ArrowRight className="ml-2 size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
