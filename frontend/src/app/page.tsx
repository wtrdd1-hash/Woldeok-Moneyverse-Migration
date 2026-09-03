import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { HomeCta } from '@/components/home-cta';
import { Lobby } from '@/components/lobby';
import { Accent } from '@/components/page-header';
import { LobbyCount } from '@/components/lobby-count';
import { WalletGlance } from '@/components/wallet-glance';
import { HomeAdvertisement } from '@/components/home-advertisement';
import { MobileHomeView } from '@/components/mobile-home-view';
import { TranslatedText as T } from '@/components/translated-text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { publicApi } from '@/lib/api';
import { formatDay } from '@/lib/money';

/**
 * Server-rendered and revalidated rather than fetched per request: this is the
 * page a crawler and a first-time visitor see, so it has to arrive as finished
 * HTML. Nothing on it is specific to the caller.
 */
export const revalidate = 60;

export const metadata: Metadata = {
  title: '월덕 머니버스 — Discord 커뮤니티 가상경제와 게임 보상',
  description:
    'Discord 커뮤니티 활동을 기록하고 WLD 보상, 게임 상점, 시즌 이벤트를 함께 이용하는 월덕 머니버스입니다.',
  alternates: { canonical: '/' },
};

interface Announcement {
  readonly announcementId: string;
  readonly title: string;
  readonly body: string;
  readonly publishedAt: string | null;
}

export default async function HomePage() {
  // Falls back to null rather than throwing. A public landing page stays
  // readable when the content service is offline — the original made the same
  // choice, and an empty section is honest where an invented one is not.
  const announcements = await publicApi<{ announcements: Announcement[] }>(
    '/api/v1/announcements',
    60,
  );

  const notices = announcements?.announcements.slice(0, 3) ?? [];

  return (
    <>
      <MobileHomeView notices={notices} />
      <div className="hidden lg:grid gap-20">
      <section
        aria-labelledby="hero-title"
        className="grid items-center gap-10 py-6 lg:grid-cols-[1.1fr_0.78fr] lg:gap-[6vw] lg:py-12"
      >
        <div>
          <p className="eyebrow mb-5">Woldeok Moneyverse</p>
          <h1
            id="hero-title"
            className="max-w-[680px] text-[clamp(2.25rem,4.6vw,3.5rem)] leading-[1.13] tracking-[-0.065em]"
          >
            <T korean="우리가 함께 만드는" english="A small, resilient economy" />
            <br />
            <Accent><T korean="작고 단단한 경제." english="we build together." /></Accent>
          </h1>
          <p className="mt-6 max-w-[590px] text-[clamp(1rem,1.5vw,1.125rem)] leading-[1.8] text-muted-foreground [word-break:keep-all]">
            <T
              korean="월덕 머니버스는 Discord로 이어지는 커뮤니티 가상경제 서비스입니다. 활동은 기록으로 남고, 로그인 후 WLD 보상·게임 상점 이용·이용 기록을 확인할 수 있어요."
              english="Woldeok Moneyverse is a community virtual economy connected through Discord. Sign in to track activity, earn WLD rewards, visit the game shop, and review your history."
            />
          </p>

          <HomeCta />

          <p className="mt-7 max-w-[590px] text-xs text-muted-foreground">
            <T korean="모든 WLD와 보상은 게임 안에서만 사용하는 가상 데이터이며, 현금 거래나 환전 기능은 제공하지 않습니다." english="WLD and all rewards are virtual game data. They cannot be traded or exchanged for cash." />
          </p>
        </div>

        {/* The panel the original tilted a degree off the grid: the one place
            the page stops being a document and looks like a ledger card. */}
        <aside
          aria-labelledby="status-panel-title"
          className="rounded-[28px] border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 text-white shadow-raised shadow-amber-500/10 ring-1 ring-amber-400/20 lg:rotate-[1deg]"
        >
          <div className="flex items-center gap-2">
            <span className="text-base">🌙</span>
            <p className="eyebrow text-amber-300 font-bold">Woldeok Moonlight</p>
          </div>
          <h2 id="status-panel-title" className="mt-2 text-2xl font-black text-white flex items-center gap-2">
            <T korean="오늘의 현황" english="Today at a glance" />
            <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
          </h2>
          <ul className="mt-6 grid gap-3">
            <StatusRowItem
              glyph="▣"
              term={<T korean="내 지갑" english="My wallet" />}
              detail={<T korean="원장 기준의 실제 잔액과 기록" english="Ledger-backed balance and history" />}
              href="/wallet"
            >
              {/* Signed in, this is the member's own balance; signed out, it
                  stays the invitation the prerendered HTML carries. */}
              <WalletGlance />
            </StatusRowItem>

            <StatusRowItem
              glyph="▤"
              term={<T korean="서비스 상태" english="Service status" />}
              detail={<T korean="운영이 기록한 상태만 표시해요" english="Verified operational status" />}
              href="/status"
            >
              <T korean="상태 보기" english="View status" />
            </StatusRowItem>

            <StatusRowItem
              glyph="⌁"
              term={<T korean="커뮤니티 로비" english="Community lobby" />}
              detail={<T korean="인증된 웹 로비 참여자" english="Verified lobby participants" />}
              href="/lobby"
            >
              <LobbyCount />
            </StatusRowItem>
          </ul>
        </aside>
      </section>

      <section aria-labelledby="home-updates-title" className="grid gap-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-3">Monthly notes</p>
            <h2 id="home-updates-title" className="text-[clamp(2rem,4vw,3rem)]">
              <T korean="월간 소식" english="Monthly updates" />
            </h2>
          </div>
          <Link href="/announcements" className="text-sm font-extrabold text-clay-ink">
            <T korean="전체 보기 →" english="View all →" />
          </Link>
        </div>

        {notices.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {notices.map((notice) => (
              <Card key={notice.announcementId} className="gap-4 rounded-[18px] shadow-plate">
                <CardHeader>
                  {notice.publishedAt && (
                    <time
                      dateTime={notice.publishedAt}
                      className="font-mono text-[11px] font-bold tracking-[0.1em] text-muted-foreground"
                    >
                      {formatDay(notice.publishedAt, '최근 게시')}
                    </time>
                  )}
                  <CardTitle className="text-xl">{notice.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-4 text-sm leading-[1.7] text-muted-foreground">
                    {notice.body}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="공개된 운영 소식을 준비하고 있어요."
            description="검토를 마친 공지부터 이곳에 표시됩니다."
          />
        )}
      </section>

      <section aria-labelledby="home-start-title" className="grid gap-6">
        <div>
          <p className="eyebrow mb-3">Start here</p>
          <h2 id="home-start-title" className="text-[clamp(2rem,4vw,3rem)]">
            <T korean="처음이라면, 여기서 시작해요." english="New here? Start with the essentials." />
          </h2>
          <p className="mt-4 max-w-prose leading-[1.8] text-muted-foreground [word-break:keep-all]">
            <T korean="가입 전에 어떤 활동을 할 수 있는지 확인하고, 로그인 뒤에는 한 번에 하나씩 천천히 시작할 수 있어요." english="Explore what you can do before joining, then take your first steps one at a time after signing in." />
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <PolicyLink
            href="/guide"
            title={<T korean="첫 활동 순서" english="Your first steps" />}
            detail={<T korean="로그인부터 첫 보상 확인까지" english="From sign-in to your first reward" />}
          />
          <PolicyLink
            href="/shop"
            title={<T korean="게임 상점 미리 보기" english="Preview the game shop" />}
            detail={<T korean="WLD로 살 수 있는 아이템 확인" english="See what your WLD can unlock" />}
          />
          <PolicyLink
            href="/announcements"
            title={<T korean="운영 소식 확인" english="Read the latest updates" />}
            detail={<T korean="변경 사항과 새로운 콘텐츠" english="Changes and new content" />}
          />
        </div>
      </section>

      <HomeAdvertisement />

      <section id="community" aria-labelledby="community-title" className="grid gap-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          <div>
            <p className="eyebrow mb-3">Community lobby</p>
            <h2 id="community-title" className="text-[clamp(2rem,4vw,3rem)]">
              <T korean="가볍게 인사하고," english="Say hello," />
              <br />
              <T korean="함께 이어 가요." english="then build together." />
            </h2>
            <p className="mt-5 max-w-prose leading-[1.8] text-muted-foreground [word-break:keep-all]">
              <T korean="머니버스 로비는 지금 접속한 사람들과 짧게 인사하는 공간입니다. 메시지는 서버에 저장하지 않고 접속 중인 사람에게만 전달돼요. 개인정보나 계정 정보는 남기지 말아 주세요." english="The Moneyverse lobby is a lightweight space to greet people who are online now. Messages are not stored and are only delivered to current participants. Never share personal or account information." />
            </p>
            <div className="mt-6 grid gap-2">
              <PolicyLink
                href="/terms"
                title={<T korean="커뮤니티 이용 규칙" english="Community guidelines" />}
                detail={<T korean="서로 존중하는 대화 기준" english="A shared standard for respectful chat" />}
              />
              <PolicyLink
                href="/privacy"
                title={<T korean="개인정보 안내" english="Privacy information" />}
                detail={<T korean="수집 정보와 이용자 권리" english="Data collection and your rights" />}
              />
            </div>
          </div>

          <Card className="rounded-[18px] shadow-plate">
            <CardContent>
              <Lobby />
            </CardContent>
          </Card>
        </div>
      </section>
      </div>
    </>
  );
}

function StatusRowItem({
  glyph,
  term,
  detail,
  href,
  children,
}: {
  readonly glyph: string;
  readonly term: React.ReactNode;
  readonly detail: React.ReactNode;
  readonly href: string;
  readonly children: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-3 rounded-[14px] bg-white/[0.06] p-3">
      <span
        aria-hidden
        className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-white/10 text-sm"
      >
        {glyph}
      </span>
      <span className="min-w-0 grid gap-0.5">
        <b className="truncate text-sm">{term}</b>
        <small className="truncate text-xs text-white/65">{detail}</small>
      </span>
      <Link
        href={href}
        className="ml-auto flex shrink-0 items-center gap-1.5 text-xs font-extrabold text-highlight"
      >
        {children}
      </Link>
    </li>
  );
}

function PolicyLink({
  href,
  title,
  detail,
}: {
  readonly href: string;
  readonly title: React.ReactNode;
  readonly detail: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-11 items-center justify-between gap-3 rounded-[12px] border bg-surface px-4 py-3 text-sm shadow-plate transition-transform hover:-translate-y-0.5"
    >
      <span>
        <b className="font-extrabold">{title}</b>
        <span className="block text-xs text-muted-foreground">{detail}</span>
      </span>
      <ArrowRight className="size-4 text-clay" />
    </Link>
  );
}
