import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { Accent, PageHeader, SectionHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { formatDay, formatMoment } from '@/lib/money';
import { requireMember } from '@/lib/session';
import type { TodayEvent } from '../quests/early-events';
import type { EarlyGameBoard } from '../quests/early-game';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '이벤트 캘린더',
  description: '시즌 이벤트와 오늘의 사건, 주간 목표 일정을 한곳에서 확인하세요.',
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
  readonly ends_at: string;
}

function nextWeekStart(weekStart: string): string | null {
  const value = new Date(`${weekStart}T00:00:00+09:00`);
  if (Number.isNaN(value.getTime())) return null;
  value.setUTCDate(value.getUTCDate() + 7);
  return value.toISOString();
}

export default async function CalendarPage() {
  await requireMember();

  const [seasonData, todayData, earlyGame] = await Promise.all([
    apiOrNull<{ events: SeasonEvent[] }>('/api/v1/seasons/events'),
    apiOrNull<{ event: TodayEvent | null }>('/api/v1/early-game/today'),
    apiOrNull<EarlyGameBoard>('/api/v1/engagement/early-game'),
  ]);

  const seasonEvents = seasonData?.events ?? [];
  const today = todayData?.event ?? null;
  const weeklyGoals = earlyGame?.goals ?? [];
  const weekStart = weeklyGoals.find((goal) => goal.goal_window === 'week')?.week_start ?? null;
  const nextReset = weekStart ? nextWeekStart(weekStart) : null;

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="ECONOMY & EVENT CALENDAR"
        title={
          <>
            끝나는 날과 다시 열리는 날을
            <br />
            <Accent>한곳에서 확인해요.</Accent>
          </>
        }
      >
        시즌 이벤트, 오늘의 사건, 주간 목표처럼 날짜에 따라 바뀌는 게임 일정을 모아 보여줘요.
        실제 보상·가격·상태는 각 기능의 서버 기록이 기준입니다.
      </PageHeader>

      <section className="grid gap-3" aria-labelledby="today-calendar-title">
        <SectionHeader eyebrow="TODAY" title="오늘의 일정" id="today-calendar-title" />
        <div className="grid gap-3 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardDescription>DAILY EVENT</CardDescription>
              <CardTitle className="text-base">오늘의 사건</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {todayData === null ? (
                <p className="text-sm text-muted-foreground">오늘의 사건을 불러오지 못했어요.</p>
              ) : today === null ? (
                <p className="text-sm text-muted-foreground">오늘 열려 있는 사건이 없어요.</p>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={today.claimed ? 'secondary' : 'default'}>
                      {today.claimed ? '완료' : '진행 가능'}
                    </Badge>
                    <span className="text-sm font-medium">{today.event_label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{today.event_detail}</p>
                  <p className="text-xs text-muted-foreground">
                    기준일 <time dateTime={today.event_date}>{formatDay(today.event_date)}</time> · 다음 사건은
                    한국 시간 자정 이후 갱신
                  </p>
                  <Link href="/quests" className="text-sm text-primary">
                    퀘스트에서 확인하기 →
                  </Link>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>WEEKLY RESET</CardDescription>
              <CardTitle className="text-base">주간 목표 갱신</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {earlyGame === null ? (
                <p className="text-sm text-muted-foreground">주간 목표 일정을 불러오지 못했어요.</p>
              ) : weekStart === null ? (
                <p className="text-sm text-muted-foreground">현재 주간 목표가 없어요.</p>
              ) : (
                <>
                  <p className="text-sm">이번 주 목표 {weeklyGoals.filter((goal) => goal.goal_window === 'week').length}개</p>
                  <p className="text-xs text-muted-foreground">
                    이번 주 시작 <time dateTime={weekStart}>{formatDay(weekStart)}</time>
                    {nextReset && (
                      <> · 다음 갱신 <time dateTime={nextReset}>{formatMoment(nextReset)}</time></>
                    )}
                  </p>
                  <Link href="/quests" className="text-sm text-primary">
                    주간 목표 보기 →
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-3" aria-labelledby="season-calendar-title">
        <SectionHeader eyebrow="SEASON EVENTS" title="종료 예정 시즌 이벤트" id="season-calendar-title" />
        {seasonData === null ? (
          <EmptyState
            title="시즌 이벤트 일정을 불러오지 못했어요."
            description="일정을 추측해서 표시하지 않습니다. 잠시 후 다시 확인해 주세요."
          />
        ) : seasonEvents.length === 0 ? (
          <EmptyState title="현재 진행 중인 시즌 이벤트가 없어요." description="새 이벤트가 열리면 이곳에 표시돼요." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {seasonEvents.map((event) => (
              <Card key={event.event_id}>
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{event.season_name}</Badge>
                    <CardTitle className="text-base">{event.title}</CardTitle>
                  </div>
                  <CardDescription>{event.description}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2 text-sm">
                  <p>
                    종료 <time dateTime={event.ends_at}>{formatMoment(event.ends_at)}</time>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    참여 비용 {event.cost_wld} WLD · 1회당 {event.points_per_entry}점
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
