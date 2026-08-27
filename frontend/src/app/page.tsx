import type { Metadata } from 'next';
import Link from 'next/link';
import { Plate, PlateTitle } from '@/components/ui/plate';
import { publicApi } from '@/lib/api';
import { STATUS_LABEL, asStatusState } from '@/lib/status';

/**
 * Server-rendered and revalidated rather than fetched per request: this is the
 * page a crawler and a first-time visitor see, so it has to arrive as finished
 * HTML. Nothing on it is specific to the caller.
 */
export const revalidate = 60;

export const metadata: Metadata = {
  title: '월덕 머니버스 — 우리 서버의 작은 경제',
  description: 'Discord와 마인크래프트에서 함께 즐기는 월덕 머니버스 커뮤니티 가상 경제',
  alternates: { canonical: '/' },
};

interface Announcement {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly publishedAt: string;
}

interface StatusRow {
  readonly sourceKey: string;
  readonly displayName: string;
  readonly state: string;
  readonly detail: string | null;
}

function noticeDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? '최근 게시'
    : new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' }).format(date);
}

export default async function HomePage() {
  // Both fall back to null rather than throwing. A public landing page stays
  // readable when the content service is offline, and must not invent a
  // healthy status while it is — the original made the same choice.
  const [announcements, status] = await Promise.all([
    publicApi<{ announcements: Announcement[] }>('/api/v1/announcements', 60),
    publicApi<{ status: StatusRow[] }>('/api/v1/status', 60),
  ]);

  const notices = announcements?.announcements.slice(0, 3) ?? [];
  const minecraft = status?.status.find((row) => row.sourceKey === 'minecraft');

  return (
    <div className="grid gap-6">
      <section aria-labelledby="hero-title" className="grid gap-4 pt-4">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
          Woldeok Moneyverse
        </p>
        <h1 id="hero-title" className="text-3xl font-bold sm:text-4xl">
          우리가 함께 만드는
          <br />
          <em className="not-italic text-[var(--primary)]">작고 단단한 경제.</em>
        </h1>
        <p className="max-w-prose text-[var(--muted)]">
          월덕 머니버스는 Discord와 마인크래프트를 잇는 커뮤니티 장부입니다. 활동은 기록으로
          남고, 로그인 후 실제 잔액과 이용 기록을 확인할 수 있어요.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/login"
            className="flex min-h-[44px] items-center rounded-[var(--radius-plate)] bg-[var(--primary)] px-4 text-sm font-medium text-[var(--color-plate)]"
          >
            Discord · Google로 시작하기 →
          </Link>
          <Link
            href="/announcements"
            className="flex min-h-[44px] items-center rounded-[var(--radius-plate)] border border-[var(--border)] px-4 text-sm"
          >
            알아보기 →
          </Link>
        </div>

        <p className="max-w-prose text-xs text-[var(--muted)]">
          모든 WLD와 보상은 게임 안에서만 사용하는 가상 데이터이며, 현금 거래나 환전 기능은
          제공하지 않습니다.
        </p>
      </section>

      <Plate aria-labelledby="status-panel-title">
        <PlateTitle hint={<Link href="/status">전체 보기 →</Link>}>
          <span id="status-panel-title">오늘의 현황</span>
        </PlateTitle>
        <dl className="grid gap-3">
          <Row
            term={minecraft?.displayName ?? '마인크래프트 서버'}
            detail={minecraft?.detail ?? '신뢰된 상태 기록을 확인해요.'}
            // An absent status reads as 확인 중, never as 정상: an unreachable
            // source and a healthy one are different facts.
            value={STATUS_LABEL[asStatusState(minecraft?.state)]}
            href="/status"
          />
          <Row
            term="내 지갑"
            detail="원장 기준의 실제 잔액과 기록"
            value="로그인 후 확인"
            href="/wallet"
          />
        </dl>
      </Plate>

      <section aria-labelledby="home-updates-title" className="grid gap-3">
        <div className="flex items-baseline justify-between">
          <h2 id="home-updates-title" className="text-lg font-medium">
            월간 소식
          </h2>
          <Link href="/announcements" className="text-sm text-[var(--muted)]">
            전체 보기 →
          </Link>
        </div>

        {notices.length > 0 ? (
          <div className="grid gap-3">
            {notices.map((notice) => (
              <Plate as="article" key={notice.id}>
                <time dateTime={notice.publishedAt} className="text-xs text-[var(--muted)]">
                  {noticeDate(notice.publishedAt)}
                </time>
                <h3 className="mt-1 text-base font-medium">{notice.title}</h3>
                <p className="mt-1 line-clamp-3 text-sm text-[var(--muted)]">{notice.body}</p>
              </Plate>
            ))}
          </div>
        ) : (
          <Plate>
            <h3 className="text-base font-medium">공개된 운영 소식을 준비하고 있어요.</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">
              검토를 마친 공지부터 이곳에 표시됩니다.
            </p>
          </Plate>
        )}
      </section>

      <Plate aria-labelledby="community-title">
        <PlateTitle>
          <span id="community-title">가볍게 인사하고, 함께 이어 가요.</span>
        </PlateTitle>
        <p className="text-sm text-[var(--muted)]">
          머니버스 로비는 지금 접속한 사람들과 짧게 인사하는 공간입니다. 개인정보나 계정
          정보는 남기지 말아 주세요.
        </p>
        <div className="mt-3 grid gap-2">
          <PolicyLink href="/terms" title="커뮤니티 이용 규칙" detail="서로 존중하는 대화 기준" />
          <PolicyLink href="/privacy" title="개인정보 안내" detail="수집 정보와 이용자 권리" />
        </div>
      </Plate>
    </div>
  );
}

function Row({
  term,
  detail,
  value,
  href,
}: {
  readonly term: string;
  readonly detail: string;
  readonly value: string;
  readonly href: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-3 last:border-b-0 last:pb-0">
      <div>
        <dt className="text-sm font-medium">{term}</dt>
        <dd className="text-xs text-[var(--muted)]">{detail}</dd>
      </div>
      <Link href={href} className="shrink-0 text-sm text-[var(--primary)]">
        {value}
      </Link>
    </div>
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
    <Link href={href} className="flex min-h-[44px] items-center justify-between gap-3 text-sm">
      <span>
        <b className="font-medium">{title}</b>
        <span className="block text-xs text-[var(--muted)]">{detail}</span>
      </span>
      <span aria-hidden>↗</span>
    </Link>
  );
}
