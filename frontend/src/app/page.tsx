import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { publicApi } from '@/lib/api';
import { formatDay } from '@/lib/money';
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
  readonly announcementId: string;
  readonly title: string;
  readonly body: string;
  readonly publishedAt: string | null;
}

interface StatusRow {
  readonly sourceKey: string;
  readonly displayName: string;
  readonly state: string;
  readonly detail: string | null;
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
    <div className="grid gap-8">
      <section aria-labelledby="hero-title" className="grid gap-4">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Woldeok Moneyverse
        </p>
        <h1 id="hero-title" className="text-3xl font-bold sm:text-4xl">
          우리가 함께 만드는
          <br />
          <em className="not-italic text-primary">작고 단단한 경제.</em>
        </h1>
        <p className="max-w-prose text-muted-foreground">
          월덕 머니버스는 Discord와 마인크래프트를 잇는 커뮤니티 장부입니다. 활동은 기록으로
          남고, 로그인 후 실제 잔액과 이용 기록을 확인할 수 있어요.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button asChild className="min-h-11">
            <Link href="/login">
              Discord · Google로 시작하기
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline" className="min-h-11">
            <Link href="/announcements">알아보기</Link>
          </Button>
        </div>

        <p className="max-w-prose text-xs text-muted-foreground">
          모든 WLD와 보상은 게임 안에서만 사용하는 가상 데이터이며, 현금 거래나 환전 기능은
          제공하지 않습니다.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>오늘의 현황</CardTitle>
          <CardAction>
            <Button asChild variant="ghost" size="sm">
              <Link href="/status">전체 보기 →</Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <section aria-labelledby="home-updates-title" className="grid gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="home-updates-title" className="text-lg font-medium">
            월간 소식
          </h2>
          <Link href="/announcements" className="text-sm text-muted-foreground">
            전체 보기 →
          </Link>
        </div>

        {notices.length > 0 ? (
          <div className="grid gap-3">
            {notices.map((notice) => (
              <Card key={notice.announcementId} className="gap-3 py-4">
                <CardHeader>
                  {notice.publishedAt && (
                    <time
                      dateTime={notice.publishedAt}
                      className="text-xs text-muted-foreground"
                    >
                      {formatDay(notice.publishedAt, '최근 게시')}
                    </time>
                  )}
                  <CardTitle className="text-base">{notice.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{notice.body}</CardDescription>
                </CardHeader>
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

      <Card>
        <CardHeader>
          <CardTitle>가볍게 인사하고, 함께 이어 가요.</CardTitle>
          <CardDescription>
            머니버스 로비는 지금 접속한 사람들과 짧게 인사하는 공간입니다. 개인정보나 계정
            정보는 남기지 말아 주세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-1">
          <PolicyLink href="/terms" title="커뮤니티 이용 규칙" detail="서로 존중하는 대화 기준" />
          <PolicyLink href="/privacy" title="개인정보 안내" detail="수집 정보와 이용자 권리" />
        </CardContent>
      </Card>
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
    <div className="flex items-center justify-between gap-3 border-b pb-3 last:border-b-0 last:pb-0">
      <div>
        <dt className="text-sm font-medium">{term}</dt>
        <dd className="text-xs text-muted-foreground">{detail}</dd>
      </div>
      <dd className="shrink-0">
        <Link href={href}>
          <Badge variant="outline" className="font-normal">
            {value}
          </Badge>
        </Link>
      </dd>
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
    <Button asChild variant="ghost" className="h-auto min-h-11 justify-between px-2 py-2">
      <Link href={href}>
        <span className="text-left">
          <span className="block font-medium">{title}</span>
          <span className="block text-xs font-normal text-muted-foreground">{detail}</span>
        </span>
        <ArrowRight className="text-muted-foreground" />
      </Link>
    </Button>
  );
}
