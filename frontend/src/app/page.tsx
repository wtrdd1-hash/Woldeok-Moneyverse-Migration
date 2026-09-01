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
import { homeAdSense } from '@/lib/adsense';
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
  title: '월덕 머니버스 — 우리 서버의 작은 경제',
  description: 'Discord로 이어지는 월덕 머니버스 커뮤니티 가상 경제',
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
    <div className="grid gap-20">
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
            우리가 함께 만드는
            <br />
            <Accent>작고 단단한 경제.</Accent>
          </h1>
          <p className="mt-6 max-w-[590px] text-[clamp(1rem,1.5vw,1.125rem)] leading-[1.8] text-muted-foreground [word-break:keep-all]">
            월덕 머니버스는 Discord로 이어지는 커뮤니티 장부입니다. 활동은 기록으로 남고,
            로그인 후 실제 잔액과 이용 기록을 확인할 수 있어요.
          </p>

          <HomeCta />

          <p className="mt-7 max-w-[590px] text-xs text-muted-foreground">
            모든 WLD와 보상은 게임 안에서만 사용하는 가상 데이터이며, 현금 거래나 환전 기능은
            제공하지 않습니다.
          </p>
        </div>

        {/* The panel the original tilted a degree off the grid: the one place
            the page stops being a document and looks like a ledger card. */}
        <aside
          aria-labelledby="status-panel-title"
          className="rounded-[28px] border border-forest-deep bg-forest p-6 text-white shadow-raised lg:rotate-[1deg]"
        >
          <p className="eyebrow text-highlight">Today at a glance</p>
          <h2 id="status-panel-title" className="mt-3 text-2xl text-white">
            오늘의 현황
          </h2>
          <ul className="mt-6 grid gap-3">
            <StatusRowItem
              glyph="▣"
              term="내 지갑"
              detail="원장 기준의 실제 잔액과 기록"
              href="/wallet"
            >
              {/* Signed in, this is the member's own balance; signed out, it
                  stays the invitation the prerendered HTML carries. */}
              <WalletGlance />
            </StatusRowItem>

            <StatusRowItem
              glyph="▤"
              term="서비스 상태"
              detail="운영이 기록한 상태만 표시해요"
              href="/status"
            >
              상태 보기
            </StatusRowItem>

            <StatusRowItem
              glyph="⌁"
              term="커뮤니티 로비"
              detail="인증된 웹 로비 참여자"
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
              월간 소식
            </h2>
          </div>
          <Link href="/announcements" className="text-sm font-extrabold text-clay-ink">
            전체 보기 →
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

      <HomeAdvertisement />

      {!homeAdSense.enabled && <section id="community" aria-labelledby="community-title" className="grid gap-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          <div>
            <p className="eyebrow mb-3">Community lobby</p>
            <h2 id="community-title" className="text-[clamp(2rem,4vw,3rem)]">
              가볍게 인사하고,
              <br />
              함께 이어 가요.
            </h2>
            <p className="mt-5 max-w-prose leading-[1.8] text-muted-foreground [word-break:keep-all]">
              머니버스 로비는 지금 접속한 사람들과 짧게 인사하는 공간입니다. 메시지는 서버에
              저장하지 않고 접속 중인 사람에게만 전달돼요. 개인정보나 계정 정보는 남기지 말아
              주세요.
            </p>
            <div className="mt-6 grid gap-2">
              <PolicyLink
                href="/terms"
                title="커뮤니티 이용 규칙"
                detail="서로 존중하는 대화 기준"
              />
              <PolicyLink
                href="/privacy"
                title="개인정보 안내"
                detail="수집 정보와 이용자 권리"
              />
            </div>
          </div>

          <Card className="rounded-[18px] shadow-plate">
            <CardContent>
              <Lobby />
            </CardContent>
          </Card>
        </div>
      </section>}
    </div>
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
  readonly term: string;
  readonly detail: string;
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
  readonly title: string;
  readonly detail: string;
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
