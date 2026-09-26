import type { Metadata } from 'next';
import Link from 'next/link';
import { Trophy, Calendar, Sparkles } from 'lucide-react';
import { Amount } from '@/components/amount';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { formatMoment } from '@/lib/money';
import { requireMember } from '@/lib/session';
import { EnterButton } from './enter-button';
import { SeasonHallOfFameTicker } from './hall-of-fame-ticker';
import { SeasonRewardClaimBanner } from './season-reward-claim-banner';
import { SeasonPassTrack } from './season-pass-track';

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

interface CurrentSeasonStatus {
  readonly seasonId: string;
  readonly seasonName: string;
  readonly startsAt: unknown;
  readonly endsAt: unknown;
  readonly lifecycleState: string;
  readonly totalParticipants: number;
  readonly myRank: number | null;
  readonly myScore: number;
  readonly myTier: string;
  readonly tierRewardWld: number;
  readonly tierTrophy: string | null;
}

interface LeaderboardEntry {
  readonly rank: number;
  readonly points: string;
  readonly entries: string;
  readonly display_name: string;
}

function getRankBadge(rank: number) {
  if (rank === 1) {
    return (
      <span className="flex items-center justify-center size-7 rounded-full bg-amber-500/20 text-amber-500 font-black text-xs border border-amber-500/30">
        1위
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="flex items-center justify-center size-7 rounded-full bg-slate-400/20 text-slate-300 font-black text-xs border border-slate-400/30">
        2위
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="flex items-center justify-center size-7 rounded-full bg-amber-700/20 text-amber-600 font-black text-xs border border-amber-700/30">
        3위
      </span>
    );
  }
  return (
    <span className="flex items-center justify-center size-7 rounded-full bg-muted text-muted-foreground font-mono font-bold text-xs">
      {rank}
    </span>
  );
}

export default async function SeasonsPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly event?: string }>;
}) {
  await requireMember();
  const { event: requested } = await searchParams;

  const [data, currentStatus] = await Promise.all([
    apiOrNull<{ events: SeasonEvent[] }>('/api/v1/seasons/events'),
    apiOrNull<CurrentSeasonStatus>('/api/v1/seasons/current'),
  ]);

  const events = data?.events ?? [];
  const selected = events.find((event) => event.event_id === requested) ?? events[0];
  const board = selected
    ? await apiOrNull<{ entries: LeaderboardEntry[] }>(
        `/api/v1/seasons/events/${selected.event_id}/leaderboard`,
      )
    : null;

  return (
    <div data-page="seasons" className="mv-page mv-page--gameplay grid gap-8 pb-12">
      <PageHeader eyebrow="COMMUNITY SEASON" title="시즌 소비 이벤트">
        WLD 소비와 점수는 게임 안에서만 사용됩니다. 기간 한정 시즌 이벤트에 참여하여 명예 순위와 보상을 쟁취하세요.
      </PageHeader>

      {/* 시즌 랭킹 최종 보상 수령 배너 (정산된 보상이 있는 경우 상단 노출) */}
      {currentStatus && (
        <SeasonRewardClaimBanner
          seasonId={currentStatus.seasonId}
          seasonName={currentStatus.seasonName}
          tierRewardWld={currentStatus.tierRewardWld}
          tierTrophy={currentStatus.tierTrophy}
          myTier={currentStatus.myTier}
          myRank={currentStatus.myRank}
        />
      )}

      {/* 시즌 1: First Capital 명예의 전당 티커 & 아카이브 */}
      <SeasonHallOfFameTicker />

      {/* 시즌 1 패스 50레벨 로드맵 & 마일스톤 보상 트랙 */}
      <SeasonPassTrack />

      <section aria-labelledby="events-title" className="grid gap-4">
        <h2 id="events-title" className="text-xl font-bold flex items-center gap-2">
          <Calendar className="size-5 text-primary" /> 진행 중인 시즌 이벤트
        </h2>
        {data === null ? (
          <EmptyState title="이벤트를 불러오지 못했어요." />
        ) : events.length === 0 ? (
          <EmptyState title="진행 중인 이벤트가 없습니다." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {events.map((event) => {
              const isSelected = selected?.event_id === event.event_id;
              return (
                <Card
                  key={event.event_id}
                  className={`flex flex-col justify-between rounded-2xl border transition-all shadow-sm ${
                    isSelected
                      ? 'border-primary/80 bg-primary/5 ring-1 ring-primary/30'
                      : 'border-border/80 bg-card hover:border-border'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <Badge variant="secondary" className="w-fit font-bold text-xs">
                      {event.season_name}
                    </Badge>
                    <CardTitle className="text-lg font-black mt-2">{event.title}</CardTitle>
                    <CardDescription className="text-xs">{event.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="grid gap-2 text-xs py-2">
                    <div className="flex items-baseline justify-between gap-3 bg-muted/30 p-2.5 rounded-xl border border-border/40">
                      <span className="text-muted-foreground">참가비</span>
                      <span className="font-mono font-bold text-foreground">
                        <Amount value={event.cost_wld} currency />
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between gap-3 bg-muted/30 p-2.5 rounded-xl border border-border/40">
                      <span className="text-muted-foreground">회당 지급 점수</span>
                      <span className="font-mono font-bold text-primary">
                        +{event.points_per_entry}점
                      </span>
                    </div>
                    {event.ends_at && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <span>⏰</span>
                        <span>{formatMoment(event.ends_at)} 종료</span>
                      </p>
                    )}
                  </CardContent>

                  <CardFooter className="pt-3 border-t flex items-center justify-between gap-2">
                    <EnterButton eventId={event.event_id} />
                    <Link
                      href={`/seasons?event=${event.event_id}`}
                      scroll={false}
                      className="min-h-11 px-4 inline-flex items-center text-xs font-bold text-primary hover:underline"
                    >
                      {isSelected ? '● 순위 보는 중' : '실시간 순위 보기 →'}
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {selected && (
        <Card className="rounded-2xl border-border/80 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="size-4" /> LEADERBOARD
              </span>
              <Badge className="bg-primary/20 text-primary border-primary/30 text-xs font-bold">
                {selected.season_name}
              </Badge>
            </div>
            <CardTitle className="text-2xl font-black mt-1">시즌 명예의 전당</CardTitle>
            <CardDescription className="text-xs">{selected.title}</CardDescription>
          </CardHeader>

          <CardContent>
            {board === null ? (
              <EmptyState title="순위를 불러오지 못했어요." />
            ) : board.entries.length === 0 ? (
              <EmptyState
                title="아직 참가자가 없습니다."
                description="가장 먼저 이벤트에 참여하고 시즌 1위에 이름을 올려보세요!"
              />
            ) : (
              <ol className="grid gap-2">
                {board.entries.map((entry) => (
                  <li
                    key={`${entry.rank}-${entry.display_name}`}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-border/50 bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {getRankBadge(entry.rank)}
                      <span className="text-sm font-bold text-foreground truncate">
                        {entry.display_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono font-black text-sm text-primary flex items-center gap-1">
                        <Sparkles className="size-3.5" />
                        <Amount value={entry.points} />점
                      </span>
                      <Badge variant="outline" className="text-[11px] text-muted-foreground font-normal">
                        {entry.entries}회 참여
                      </Badge>
                    </div>
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
