import type { Metadata } from 'next';
import Link from 'next/link';
import { Amount } from '@/components/amount';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { formatMoment } from '@/lib/money';
import { requireMember } from '@/lib/session';
import { EnterButton } from './enter-button';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '시즌 이벤트',
  robots: { index: false, follow: false },
};

interface SeasonEvent {
  readonly event_id: string;
  readonly season_id: string;
  readonly season_name: string;
  readonly title: string;
  readonly description: string;
  readonly cost_wld: string;
  readonly points_per_entry: number;
  readonly ends_at: string | null;
}

interface LeaderboardEntry {
  readonly rank: number;
  readonly points: string;
  readonly entries: string;
  readonly display_name: string;
}

export default async function SeasonsPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly event?: string }>;
}) {
  await requireMember();
  const { event: requested } = await searchParams;

  const data = await apiOrNull<{ events: SeasonEvent[] }>('/api/v1/seasons/events');
  const events = data?.events ?? [];
  // Linkable, and resolved on the server: the original could only reach a
  // leaderboard by clicking, and reloading lost it.
  const selected = events.find((event) => event.event_id === requested) ?? events[0];
  const board = selected
    ? await apiOrNull<{ entries: LeaderboardEntry[] }>(
        `/api/v1/seasons/events/${selected.event_id}/leaderboard`,
      )
    : null;

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="COMMUNITY SEASON" title="시즌 소비 이벤트">
        WLD 소비와 점수는 게임 안에서만 사용됩니다.
      </PageHeader>

      <section aria-labelledby="events-title" className="grid gap-3">
        <h2 id="events-title" className="text-lg font-medium">
          진행 중인 이벤트
        </h2>
        {data === null ? (
          <EmptyState title="이벤트를 불러오지 못했어요." />
        ) : events.length === 0 ? (
          <EmptyState title="진행 중인 이벤트가 없습니다." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {events.map((event) => (
              <Card key={event.event_id} className="justify-between gap-4">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit font-normal">
                    {event.season_name}
                  </Badge>
                  <CardTitle className="text-base">{event.title}</CardTitle>
                  <CardDescription>{event.description}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-1 text-sm">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-muted-foreground">참가비</span>
                    <Amount value={event.cost_wld} currency />
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-muted-foreground">회당 점수</span>
                    <span className="tabular">{event.points_per_entry}점</span>
                  </div>
                  {event.ends_at && (
                    <p className="text-xs text-muted-foreground">
                      {formatMoment(event.ends_at)} 종료
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex-wrap gap-2">
                  <EnterButton eventId={event.event_id} />
                  <Link
                    href={`/seasons?event=${event.event_id}`}
                    scroll={false}
                    className="text-sm text-primary"
                  >
                    순위 보기 →
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <Card>
          <CardHeader>
            <CardTitle>시즌 순위</CardTitle>
            <CardDescription>{selected.title}</CardDescription>
          </CardHeader>
          <CardContent>
            {board === null ? (
              <EmptyState title="순위를 불러오지 못했어요." />
            ) : board.entries.length === 0 ? (
              <EmptyState title="아직 참가자가 없습니다." />
            ) : (
              <ol className="grid gap-2">
                {board.entries.map((entry) => (
                  <li
                    key={`${entry.rank}-${entry.display_name}`}
                    className="flex items-baseline justify-between gap-3 border-b pb-2 last:border-b-0 last:pb-0"
                  >
                    <span className="flex items-baseline gap-3">
                      <span className="tabular w-8 text-muted-foreground">{entry.rank}위</span>
                      <span className="text-sm">{entry.display_name}</span>
                    </span>
                    <span className="tabular text-sm">
                      <Amount value={entry.points} />점
                      <span className="ml-2 text-xs text-muted-foreground">
                        {entry.entries}회 참가
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
