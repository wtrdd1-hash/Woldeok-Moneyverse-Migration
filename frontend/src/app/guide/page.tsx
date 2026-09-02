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
import {
  BEGINNER_TIPS,
  FIRST_DAY_ORDER,
  GUIDE_FAQS,
  GUIDE_STEPS,
  QUICK_START_STEPS,
} from './guide';

/**
 * Public and static because the guide contains no member data. The visual
 * entry point intentionally comes before the detailed instructions: a new
 * visitor should understand the size and shape of a first session before
 * committing to six explanatory cards.
 */
export const metadata: Metadata = {
  title: '이용 방법',
  description:
    '월덕 머니버스를 처음 시작하는 방법. 로그인부터 첫 퀘스트, WLD 보상 확인까지 재미있게 따라가는 초보자 안내.',
  alternates: { canonical: '/guide' },
};

const STEP_ICONS = [Compass, WalletCards, ListChecks, Sparkles, Gift, ShieldCheck] as const;

export default function GuidePage() {
  return (
    <div className="grid gap-12 pb-8">
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
            처음 온 모험가를 위한 안내서
          </div>
          <div className="grid gap-3">
            <p className="eyebrow !text-[#f2cd72]">YOUR FIRST ADVENTURE</p>
            <h1 className="max-w-[650px] text-[clamp(2.15rem,6vw,4.5rem)] leading-[1.08] tracking-[-0.055em]">
              오늘 10분,
              <br />첫 보상까지 가볼까요?
            </h1>
            <p className="max-w-[590px] text-sm leading-[1.9] text-white/80 sm:text-base">
              계정 하나만 있으면 충분해요. 퀘스트를 고르고, 활동을 마치고, 지갑에 남은 첫 기록을
              확인하는 순간까지 길을 잃지 않도록 함께 안내할게요.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-[#f2cd72] text-forest-deep hover:bg-[#f6d98e]">
              <Link href="/login">
                지금 시작하기 <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <Link href="#adventure-map">먼저 구경하기</Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-white/70">
            <span className="flex items-center gap-1.5">
              <Clock3 className="size-3.5" aria-hidden /> 약 10분
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" aria-hidden /> 별도 비밀번호 없음
            </span>
            <span className="flex items-center gap-1.5">
              <Gift className="size-3.5" aria-hidden /> 게임 속 가상 보상
            </span>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="quick-start-title"
        className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]"
      >
        <div className="grid content-start gap-3">
          <p className="eyebrow">QUICK START</p>
          <h2 id="quick-start-title" className="text-3xl">
            설명보다 먼저,
            <br />이 네 가지만 기억하세요.
          </h2>
          <p className="max-w-prose text-sm leading-[1.8] text-muted-foreground [word-break:keep-all]">
            처음부터 모든 기능을 알 필요는 없어요. 한 바퀴 돌아본 뒤 마음에 드는 활동을 천천히
            찾아도 충분합니다.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <ShareGuide />
            <span className="text-xs text-muted-foreground">친구와 같이 시작해도 좋아요.</span>
          </div>
        </div>
        <Card className="overflow-hidden border-primary/20 bg-primary/[0.035]">
          <CardContent className="grid gap-0 p-0 sm:grid-cols-2">
            {QUICK_START_STEPS.map((step, index) => (
              <div
                key={step}
                className="flex min-h-28 items-center gap-4 border-b p-5 last:border-b-0 sm:odd:border-r sm:[&:nth-last-child(-n+2)]:border-b-0"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary font-extrabold text-primary-foreground shadow-sm">
                  {index + 1}
                </span>
                <p className="font-bold leading-[1.65] [word-break:keep-all]">{step}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section
        id="adventure-map"
        aria-labelledby="adventure-map-title"
        className="scroll-mt-28 grid gap-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">ADVENTURE MAP</p>
            <h2 id="adventure-map-title" className="text-3xl">
              첫날 모험 지도
            </h2>
            <p className="mt-2 max-w-prose text-sm leading-[1.8] text-muted-foreground [word-break:keep-all]">
              위에서 아래로 따라오세요. 각 단계의 버튼은 실제로 해야 할 화면으로 바로 이어집니다.
            </p>
          </div>
          <span className="rounded-full bg-accent px-3 py-1.5 text-xs font-extrabold text-accent-foreground">
            6개 체크포인트
          </span>
        </div>
        <ol className="relative grid gap-4 before:absolute before:bottom-8 before:left-[27px] before:top-8 before:w-px before:bg-border sm:before:left-[35px]">
          {GUIDE_STEPS.map((step, index) => {
            const StepIcon = STEP_ICONS[index] ?? Check;
            return (
              <li
                key={step.id}
                className="relative grid grid-cols-[56px_1fr] gap-3 sm:grid-cols-[72px_1fr] sm:gap-5"
              >
                <div className="z-10 grid size-14 place-items-center rounded-2xl border bg-background text-primary shadow-sm sm:size-[72px]">
                  <StepIcon className="size-6 sm:size-7" aria-hidden />
                </div>
                <Card className="transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-plate">
                  <CardHeader className="gap-2">
                    <CardDescription className="flex items-center gap-2 font-bold tabular">
                      CHECKPOINT {index + 1}
                      {index === GUIDE_STEPS.length - 1 && (
                        <span className="rounded-full bg-[#f2cd72]/35 px-2 py-0.5 text-[10px] text-foreground">
                          첫 기록 완성
                        </span>
                      )}
                    </CardDescription>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                      {step.body.map((paragraph) => (
                        <p
                          key={paragraph.slice(0, 24)}
                          className="max-w-prose text-sm leading-[1.8] text-muted-foreground [word-break:keep-all]"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    {step.points && (
                      <ul className="grid gap-2 rounded-xl bg-accent/60 p-4 text-sm">
                        {step.points.map((point) => (
                          <li
                            key={point}
                            className="flex gap-2 leading-[1.65] [word-break:keep-all]"
                          >
                            <Check className="mt-1 size-3.5 shrink-0 text-primary" aria-hidden />
                            {point}
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
                          {step.link.label} <ArrowRight aria-hidden />
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
                고르고, 해보고,
                <br />
                기록을 확인하는 재미
              </h2>
              <p className="mt-3 max-w-prose text-sm leading-[1.8] text-muted-foreground [word-break:keep-all]">
                머니버스의 핵심은 숫자만 모으는 일이 아니에요. 커뮤니티 활동을 하나씩 완료하면 그
                과정이 기록으로 남고, 받은 WLD로 상점 콘텐츠를 즐기며 다음 목표를 고를 수 있습니다.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: ListChecks,
                  title: '1. 활동 선택',
                  body: '오늘 할 수 있는 퀘스트 하나를 골라요.',
                },
                {
                  icon: WalletCards,
                  title: '2. 기록 확인',
                  body: '완료 뒤 지갑에서 보상을 확인해요.',
                },
                { icon: Store, title: '3. 다음 재미', body: '상점과 시즌에서 다음 목표를 찾아요.' },
              ].map(({ icon: Icon, title, body }) => (
                <div key={title} className="rounded-xl border bg-background p-4">
                  <Icon className="mb-3 size-5 text-primary" aria-hidden />
                  <h3 className="text-sm font-extrabold">{title}</h3>
                  <p className="mt-1 text-xs leading-[1.7] text-muted-foreground [word-break:keep-all]">
                    {body}
                  </p>
                </div>
              ))}
            </div>
            <Button asChild className="w-fit">
              <Link href="/quests">
                첫 퀘스트 고르기 <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section aria-labelledby="tips-title" className="grid gap-5">
        <div>
          <p className="eyebrow mb-2">NEWCOMER TIPS</p>
          <h2 id="tips-title" className="text-2xl">
            헤매지 않는 작은 요령
          </h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {BEGINNER_TIPS.map((tip, index) => (
            <Card key={tip.title} className="bg-accent/35">
              <CardHeader>
                <span className="mb-2 grid size-9 place-items-center rounded-full bg-background text-sm font-extrabold text-clay-ink shadow-sm">
                  {index + 1}
                </span>
                <CardTitle className="text-lg">{tip.title}</CardTitle>
                <CardDescription className="leading-[1.8] [word-break:keep-all]">
                  {tip.body}
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
              첫날 추천 순서
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
              {entry}
            </li>
          ))}
        </ol>
        <p className="max-w-prose text-sm leading-[1.8] text-white/70 [word-break:keep-all]">
          첫날에는 여러 작업을 한꺼번에 맡기보다, 퀘스트나 작업 하나를 끝까지 마치고 보상이 어떻게
          기록되는지 확인해 보시길 권합니다.
        </p>
      </section>

      <section aria-labelledby="faq-title" className="grid gap-5">
        <div className="flex items-end gap-3">
          <CircleHelp className="mb-1 size-7 text-primary" aria-hidden />
          <div>
            <p className="eyebrow mb-2">COMMON QUESTIONS</p>
            <h2 id="faq-title" className="text-2xl">
              처음이라면 궁금한 것들
            </h2>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {GUIDE_FAQS.map((faq) => (
            <Card key={faq.question}>
              <CardHeader className="gap-2">
                <CardTitle className="text-base">{faq.question}</CardTitle>
                <CardDescription className="leading-[1.8] [word-break:keep-all]">
                  {faq.answer}
                </CardDescription>
              </CardHeader>
              {faq.link && (
                <CardContent>
                  <Link
                    className="inline-flex items-center gap-1 text-sm font-extrabold text-clay-ink"
                    href={faq.link.href}
                  >
                    {faq.link.label} <ArrowRight className="size-3.5" aria-hidden />
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
          <h2 className="text-2xl">준비됐다면, 첫 기록을 남겨봐요.</h2>
          <p className="mt-2 text-sm leading-[1.8] text-muted-foreground [word-break:keep-all]">
            완벽하게 알 필요는 없어요. 가장 쉬운 퀘스트 하나면 시작하기에 충분합니다.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/login">
            머니버스 시작하기 <ArrowRight aria-hidden />
          </Link>
        </Button>
      </section>
    </div>
  );
}
