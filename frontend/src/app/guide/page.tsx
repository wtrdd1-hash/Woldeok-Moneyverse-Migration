import { jsonLd } from '@/lib/json-ld';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  CircleHelp,
  Clock3,
  Compass,
  Gift,
  ListChecks,
  ShieldCheck,
  Sparkles,
  Store,
  WalletCards,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PublicAdvertisement } from '@/components/public-advertisement';
import { ShareGuide } from '@/components/share-guide';
import { TranslatedText as T } from '@/components/translated-text';
import {
  BEGINNER_TIPS,
  FIRST_DAY_ORDER,
  FIRST_DAY_ORDER_EN,
  GUIDE_FAQS,
  GUIDE_STEPS,
  QUICK_START_STEPS,
  QUICK_START_STEPS_EN,
} from './guide';

export const metadata: Metadata = {
  title: '이용 방법 (Guide)',
  description:
    '월덕 머니버스를 처음 시작하는 방법. 로그인부터 첫 퀘스트, WLD 보상 확인까지 재미있게 따라가는 초보자 안내.',
  alternates: { canonical: '/guide' },
};

const STEP_ICONS = [Compass, WalletCards, ListChecks, Sparkles, Gift, ShieldCheck] as const;

export default function GuidePage() {
  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: GUIDE_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="grid gap-12 pb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqStructuredData) }}
      />
      <section className="relative isolate overflow-hidden rounded-[28px] border bg-forest-deep text-white shadow-plate">
        <Image
          src="/images/guide/newcomer-adventure.png"
          alt="퀘스트 게시판에서 출발해 지갑과 상점, 보물 상자로 이어지는 숲속 모험 지도"
          width={1536}
          height={1024}
          priority
          className="absolute inset-0 size-full object-cover object-[62%_center] opacity-50"
          sizes="(max-width: 768px) 100vw, 1180px"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-deep via-forest-deep/90 to-forest-deep/15" />
        <div className="relative grid min-h-[500px] content-end gap-6 p-6 sm:p-10 lg:max-w-[64%] lg:p-14">
          <div className="flex w-fit items-center gap-2 rounded-full border border-white/20 bg-black/15 px-3 py-1.5 text-xs font-extrabold backdrop-blur-sm">
            <Sparkles className="size-3.5 text-[#f2cd72]" aria-hidden />
            <T korean="처음 온 모험가를 위한 안내서" english="Guide for New Adventurers" />
          </div>
          <h1 className="text-balance text-4xl leading-[1.12] sm:text-5xl">
            <T korean="오늘 10분, 첫 보상까지 가볼까요?" english="Ready for your first reward in 10 minutes?" />
          </h1>
          <p className="max-w-prose text-base leading-[1.8] text-white/80 [word-break:keep-all] sm:text-lg">
            <T
              korean="계정 하나만 있으면 충분해요. 퀘스트를 고르고, 활동을 마치고, 지갑에 남은 첫 기록을 확인하는 순간까지 길을 잃지 않도록 함께 안내할게요."
              english="All you need is an account. Pick a quest, finish an activity, and see your first reward in your wallet. We'll guide you step by step."
            />
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-[#f2cd72] text-[#1b261b] hover:bg-[#e7bf5d]">
              <Link href="/login">
                <T korean="지금 시작하기" english="Get Started" /> <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-black/20 text-white hover:bg-black/35 hover:text-white">
              <Link href="#first-steps">
                <T korean="먼저 구경하기" english="Explore First" />
              </Link>
            </Button>
          </div>
          <dl className="flex flex-wrap gap-6 pt-2 text-xs text-white/70">
            <div className="flex items-center gap-1.5">
              <Clock3 className="size-4 text-[#f2cd72]" aria-hidden />
              <dt className="sr-only"><T korean="예상 소요 시간" english="Estimated time" /></dt>
              <dd><T korean="약 10분" english="~10 mins" /></dd>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-[#f2cd72]" aria-hidden />
              <dt className="sr-only"><T korean="인증 방식" english="Auth method" /></dt>
              <dd><T korean="별도 비밀번호 없음" english="No password needed" /></dd>
            </div>
            <div className="flex items-center gap-1.5">
              <Gift className="size-4 text-[#f2cd72]" aria-hidden />
              <dt className="sr-only"><T korean="보상 종류" english="Reward type" /></dt>
              <dd><T korean="게임 속 가상 보상" english="Virtual game rewards" /></dd>
            </div>
          </dl>
        </div>
      </section>

      <section
        id="first-steps"
        aria-labelledby="quick-start-title"
        className="rounded-[24px] border bg-accent/30 p-6 sm:p-9"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow mb-2">QUICK START</p>
            <h2 id="quick-start-title" className="text-2xl">
              <T korean="10분 만에 끝내는 첫 흐름" english="First 10-Minute Walkthrough" />
            </h2>
          </div>
          <ShareGuide />
        </div>
        <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_START_STEPS.map((step, index) => (
            <li
              key={step}
              className="flex gap-3 rounded-2xl border bg-background/90 p-4 text-sm shadow-card"
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-extrabold text-primary">
                {index + 1}
              </span>
              <span className="leading-[1.65] [word-break:keep-all]">
                <T korean={step} english={QUICK_START_STEPS_EN[index] ?? step} />
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="steps-title" className="grid gap-6">
        <div>
          <p className="eyebrow mb-2">STEP BY STEP</p>
          <h2 id="steps-title" className="text-3xl">
            <T korean="차근차근 따라오는 여섯 걸음" english="Six Steps to Follow" />
          </h2>
          <p className="mt-2 text-sm leading-[1.8] text-muted-foreground [word-break:keep-all]">
            <T
              korean="처음 접속한 모험가가 첫 보상을 받고 사용하기까지의 전 과정을 순서대로 정리했습니다."
              english="Here is the full flow from your first login to earning and using your rewards."
            />
          </p>
        </div>
        <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {GUIDE_STEPS.map((step, index) => {
            const Icon = STEP_ICONS[index] ?? Compass;
            return (
              <li key={step.id} className="flex">
                <Card className="flex w-full flex-col justify-between">
                  <CardHeader>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="size-5" aria-hidden />
                      </span>
                      <span className="font-extrabold tabular text-muted-foreground">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <CardTitle className="text-xl">
                      <T korean={step.title} english={step.titleEn} />
                    </CardTitle>
                    <CardDescription className="sr-only">
                      <T korean={`안내 ${index + 1}단계`} english={`Step ${index + 1}`} />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid gap-2 text-sm leading-[1.8] text-muted-foreground [word-break:keep-all]">
                      {step.body.map((paragraph, i) => (
                        <p key={i}>
                          <T korean={paragraph} english={step.bodyEn[i] ?? paragraph} />
                        </p>
                      ))}
                    </div>
                    {step.points && (
                      <ul className="grid gap-1.5 rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground">
                        {step.points.map((point, i) => (
                          <li
                            key={i}
                            className="flex gap-2 leading-[1.65] [word-break:keep-all]"
                          >
                            <Check className="mt-1 size-3.5 shrink-0 text-primary" aria-hidden />
                            <T korean={point} english={step.pointsEn?.[i] ?? point} />
                          </li>
                        ))}
                      </ul>
                    )}
                    {step.link && (
                      <Button
                        asChild
                        variant={index === 0 ? 'default' : 'outline'}
                        className="w-fit"
                      >
                        <Link href={step.link.href}>
                          <T korean={step.link.label} english={step.link.labelEn ?? step.link.label} /> <ArrowRight aria-hidden />
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ol>
      </section>

      <PublicAdvertisement />

      <section
        aria-labelledby="reward-loop-title"
        className="overflow-hidden rounded-[24px] border bg-card shadow-plate"
      >
        <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative min-h-80 bg-[#efe4c7] lg:min-h-[520px]">
            <Image
              src="/images/guide/first-reward-loop.png"
              alt="퀘스트 선택, 활동 완료, 지갑 보상, 상점 이용이 원으로 이어진 그림"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 560px"
            />
          </div>
          <div className="grid content-center gap-6 p-6 sm:p-10">
            <div>
              <p className="eyebrow mb-2">THE REWARD LOOP</p>
              <h2 id="reward-loop-title" className="text-3xl">
                <T
                  korean="고르고, 해보고, 기록을 확인하는 재미"
                  english="The Joy of Choosing, Doing, and Earning"
                />
              </h2>
              <p className="mt-3 max-w-prose text-sm leading-[1.8] text-muted-foreground [word-break:keep-all]">
                <T
                  korean="머니버스의 핵심은 숫자만 모으는 일이 아니에요. 커뮤니티 활동을 하나씩 완료하면 그 과정이 기록으로 남고, 받은 WLD로 상점 콘텐츠를 즐기며 다음 목표를 고를 수 있습니다."
                  english="Moneyverse isn't just about accumulating numbers. Every community activity is permanently logged, allowing you to enjoy shop content and choose your next goal."
                />
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: ListChecks,
                  titleKo: '1. 활동 선택',
                  titleEn: '1. Pick Activity',
                  bodyKo: '오늘 할 수 있는 퀘스트 하나를 골라요.',
                  bodyEn: 'Choose one quest you can do today.',
                },
                {
                  icon: WalletCards,
                  titleKo: '2. 기록 확인',
                  titleEn: '2. Check Ledger',
                  bodyKo: '완료 뒤 지갑에서 보상을 확인해요.',
                  bodyEn: 'Verify your rewards in your wallet.',
                },
                {
                  icon: Store,
                  titleKo: '3. 다음 재미',
                  titleEn: '3. Next Goal',
                  bodyKo: '상점과 시즌에서 다음 목표를 찾아요.',
                  bodyEn: 'Find new items in shop and seasons.',
                },
              ].map(({ icon: Icon, titleKo, titleEn, bodyKo, bodyEn }) => (
                <div key={titleKo} className="rounded-xl border bg-background p-4">
                  <Icon className="mb-3 size-5 text-primary" aria-hidden />
                  <h3 className="text-sm font-extrabold">
                    <T korean={titleKo} english={titleEn} />
                  </h3>
                  <p className="mt-1 text-xs leading-[1.7] text-muted-foreground [word-break:keep-all]">
                    <T korean={bodyKo} english={bodyEn} />
                  </p>
                </div>
              ))}
            </div>
            <Button asChild className="w-fit">
              <Link href="/quests">
                <T korean="첫 퀘스트 고르기" english="Pick First Quest" /> <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section aria-labelledby="tips-title" className="grid gap-5">
        <div>
          <p className="eyebrow mb-2">NEWCOMER TIPS</p>
          <h2 id="tips-title" className="text-2xl">
            <T korean="헤매지 않는 작은 요령" english="Tips for Getting Started" />
          </h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {BEGINNER_TIPS.map((tip, index) => (
            <Card key={tip.title} className="bg-accent/35">
              <CardHeader>
                <span className="mb-2 grid size-9 place-items-center rounded-full bg-background text-sm font-extrabold text-clay-ink shadow-sm">
                  {index + 1}
                </span>
                <CardTitle className="text-lg">
                  <T korean={tip.title} english={tip.titleEn} />
                </CardTitle>
                <CardDescription className="leading-[1.8] [word-break:keep-all]">
                  <T korean={tip.body} english={tip.bodyEn} />
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="order-title"
        className="grid gap-4 rounded-[22px] bg-forest-deep p-6 text-white sm:p-9"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow mb-2 !text-[#f2cd72]">TODAY&apos;S CHECKLIST</p>
            <h2 id="order-title" className="text-2xl">
              <T korean="첫날 추천 순서" english="First Day Checklist" />
            </h2>
          </div>
          <Compass className="size-9 text-[#f2cd72]" aria-hidden />
        </div>
        <ol className="grid gap-2 sm:grid-cols-2">
          {FIRST_DAY_ORDER.map((entry, index) => (
            <li
              key={entry}
              className="flex gap-3 rounded-xl bg-white/8 p-3 text-sm [word-break:keep-all]"
            >
              <span className="font-extrabold tabular text-[#f2cd72]">
                {String(index + 1).padStart(2, '0')}
              </span>
              <T korean={entry} english={FIRST_DAY_ORDER_EN[index] ?? entry} />
            </li>
          ))}
        </ol>
        <p className="max-w-prose text-sm leading-[1.8] text-white/70 [word-break:keep-all]">
          <T
            korean="첫날에는 여러 작업을 한꺼번에 맡기보다, 퀘스트나 작업 하나를 끝까지 마치고 보상이 어떻게 기록되는지 확인해 보시길 권합니다."
            english="On your first day, we recommend completing one simple task completely to see how rewards and ledger entries work."
          />
        </p>
      </section>

      <section aria-labelledby="faq-title" className="grid gap-5">
        <div className="flex items-end gap-3">
          <CircleHelp className="mb-1 size-7 text-primary" aria-hidden />
          <div>
            <p className="eyebrow mb-2">COMMON QUESTIONS</p>
            <h2 id="faq-title" className="text-2xl">
              <T korean="처음이라면 궁금한 것들" english="Frequently Asked Questions" />
            </h2>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {GUIDE_FAQS.map((faq) => (
            <Card key={faq.question}>
              <CardHeader className="gap-2">
                <CardTitle className="text-base">
                  <T korean={faq.question} english={faq.questionEn} />
                </CardTitle>
                <CardDescription className="leading-[1.8] [word-break:keep-all]">
                  <T korean={faq.answer} english={faq.answerEn} />
                </CardDescription>
              </CardHeader>
              {faq.link && (
                <CardContent>
                  <Link
                    className="inline-flex items-center gap-1 text-sm font-extrabold text-clay-ink"
                    href={faq.link.href}
                  >
                    <T korean={faq.link.label} english={faq.link.labelEn ?? faq.link.label} /> <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </section>

      <section className="grid justify-items-center gap-4 rounded-[24px] border bg-primary/[0.055] px-6 py-10 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground">
          <Sparkles aria-hidden />
        </span>
        <div>
          <h2 className="text-2xl">
            <T korean="준비됐다면, 첫 기록을 남겨봐요." english="Ready? Leave your first record." />
          </h2>
          <p className="mt-2 text-sm leading-[1.8] text-muted-foreground [word-break:keep-all]">
            <T
              korean="완벽하게 알 필요는 없어요. 가장 쉬운 퀘스트 하나면 시작하기에 충분합니다."
              english="You don't need to know everything. One simple quest is all it takes to start."
            />
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/login">
            <T korean="머니버스 시작하기" english="Start Moneyverse" /> <ArrowRight aria-hidden />
          </Link>
        </Button>
      </section>
    </div>
  );
}
