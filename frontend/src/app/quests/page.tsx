import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { requireMember } from '@/lib/session';
import type { FirstDayStep, TodayEvent } from './early-events';
import { firstDaySummary } from './early-events';
import { FirstDayFlow, TodayEventCard } from './early-events-parts';
import type { EarlyGameBoard } from './early-game';
import { CollectionCard, WeeklyGoalCard } from './early-game-parts';
import { NotificationForm, NpcOrderButton } from './quest-forms';
import { GoalCard, NextUnlock, NpcCard } from './quest-parts';
import { NPCS } from './quests';
import type { EngagementBoard } from './quests';

/** One member's own goals and standing. Never cached, never offered to a crawler. */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '퀘스트',
  robots: { index: false, follow: false },
};

/*
 * The progress cards are read-only. `engagement_record_progress` grants a
 * collection entry and a title once a count reaches its target, and nothing
 * verifies that the underlying activity ever happened -- so a button wired to
 * it let a member award themselves `starter` by pressing it once, and
 * `neighbour_help` without ever helping anybody. Progress belongs to whatever
 * records the activity; until that caller exists this section reports and
 * does not grant.
 */
export default async function QuestsPage() {
  await requireMember();

  // Two requests, issued together. `member_engagement_dashboard` assembles
  // today's goals, the next unlock and the preference in one function; the
  // early-game read is separate because it is a different kind of answer --
  // 101 computes every figure in it from work receipts, shop purchases and
  // ledger postings rather than from anything a member reported.
  const [board, earlyGame, today, firstDay] = await Promise.all([
    apiOrNull<EngagementBoard>('/api/v1/engagement'),
    apiOrNull<EarlyGameBoard>('/api/v1/engagement/early-game'),
    apiOrNull<{ event: TodayEvent | null }>('/api/v1/early-game/today'),
    apiOrNull<{ steps: readonly FirstDayStep[] }>('/api/v1/early-game/first-day'),
  ]);

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="DAILY QUESTS" title="퀘스트와 NPC 주문">
        퀘스트와 NPC 주문은 모두 게임 안의 활동 기록입니다. 달성하더라도 실제 현금이나 실물
        경품은 지급되지 않습니다.
      </PageHeader>

      {/* The day's event comes first because it expires: the ladder, the
          books and the weekly goals are all still there tomorrow, and this is
          the one thing on the screen that is not. */}
      <section aria-labelledby="event-title" className="grid gap-3">
        <h2 id="event-title" className="text-lg">
          오늘의 사건
        </h2>
        {/* Said plainly, because a member who does not know this will try it:
            the event is a function of the member and today's Seoul date, so
            there is nothing to reroll. */}
        <p className="max-w-prose text-sm leading-[1.8] text-muted-foreground">
          하루에 한 번, 사람마다 다른 사건이 하나씩 열려요. 새로고침하거나 다시 들어와도 오늘
          사건은 바뀌지 않고, 한 번만 받을 수 있어요. 다음 사건은 한국 시간 자정에 열립니다.
        </p>

        {today === null ? (
          <EmptyState
            title="오늘의 사건을 불러오지 못했어요."
            description="사건을 추측해서 보여 주지는 않습니다. 잠시 후 다시 확인해 주세요."
          />
        ) : today.event === null ? (
          // A different fact from the one above: the request worked and there
          // is no event open at all.
          <EmptyState
            title="지금은 열린 사건이 없어요."
            description="사건이 다시 열리면 이 자리에 표시돼요."
          />
        ) : (
          <TodayEventCard event={today.event} />
        )}
      </section>

      <section aria-labelledby="firstday-title" className="grid gap-3">
        <h2 id="firstday-title" className="text-lg">
          첫날 흐름
        </h2>
        <p className="max-w-prose text-sm leading-[1.8] text-muted-foreground">
          처음 들어온 날 해 보면 좋은 순서예요. 프로필·작업·상점 단계는 실제 기록에서 자동으로
          확인되고, 읽어 보는 단계 두 개는 기록하지 않으니 직접 확인해 주세요.
          {firstDay !== null && firstDay.steps.length > 0
            ? ` ${firstDaySummary(firstDay.steps)}.`
            : ''}
        </p>

        {firstDay === null ? (
          <EmptyState
            title="첫날 흐름을 불러오지 못했어요."
            description="진행 상황을 추측해서 보여 주지는 않습니다. 잠시 후 다시 확인해 주세요."
          />
        ) : firstDay.steps.length === 0 ? (
          <EmptyState
            title="안내할 단계가 없어요."
            description="단계가 열리면 이 자리에 표시돼요."
          />
        ) : (
          <FirstDayFlow steps={firstDay.steps} />
        )}
      </section>

      <section aria-labelledby="today-title" className="grid gap-3">
        <h2 id="today-title" className="text-lg">
          오늘의 퀘스트
        </h2>
        {/* Said once, at the top of the section that needs it: the count is
            the only figure the API can answer with, and how it moves is not
            obvious from a button labelled "기록". */}
        <p className="max-w-prose text-sm leading-[1.8] text-muted-foreground">
          활동을 마친 뒤 진행을 직접 기록해요. 한 번 누를 때마다 1회씩 올라가고, 전송이 끊겨 같은
          요청이 다시 도착해도 두 번 기록되지는 않아요. 달성에 필요한 횟수는 아직 이 화면에서
          확인할 수 없어요.
        </p>

        {board === null ? (
          <EmptyState
            title="오늘의 퀘스트를 불러오지 못했어요."
            description="진행 상황을 추측해서 보여 주지는 않습니다. 잠시 후 다시 확인해 주세요."
          />
        ) : board.today_tasks.length === 0 ? (
          // A different fact from the one above: the request worked and the
          // catalogue has nothing open for today.
          <EmptyState
            title="오늘 진행할 퀘스트가 없어요."
            description="새 퀘스트가 열리면 이 자리에 표시돼요."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {board.today_tasks.map((goal) => (
              <GoalCard key={goal.code} goal={goal} />
            ))}
          </div>
        )}
      </section>

      {/* The weekly cards come from 101 and not from the dashboard.
          `member_engagement_dashboard` reads `engagement_progress`, and the
          only thing that writes it is `engagement_record_progress`, which no
          route reaches -- deliberately, because it grants on a member's own
          say-so. Those cards therefore read zero for ever, which is worse than
          absent: a goal that cannot move looks like one the member is failing.
          These four are counted from work receipts, shop purchases and ledger
          postings, so each one carries a target and a real figure. */}
      <section aria-labelledby="weekly-title" className="grid gap-3">
        <h2 id="weekly-title" className="text-lg">
          이번 주 목표
        </h2>
        <p className="max-w-prose text-sm leading-[1.8] text-muted-foreground">
          주간 목표는 월요일마다 새로 시작하고, 따로 기록하지 않아도 작업·구매·저축 기록에서
          자동으로 계산돼요. 지난주에 쌓은 진행은 이번 주로 넘어오지 않아요.
        </p>

        {earlyGame === null ? (
          <EmptyState
            title="이번 주 목표를 불러오지 못했어요."
            description="진행 상황을 추측해서 보여 주지는 않습니다. 잠시 후 다시 확인해 주세요."
          />
        ) : earlyGame.goals.length === 0 ? (
          <EmptyState
            title="이번 주에 열린 목표가 없어요."
            description="새 주간 목표가 열리면 이 자리에 표시돼요."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {earlyGame.goals.map((goal) => (
              <WeeklyGoalCard key={goal.goal_code} goal={goal} />
            ))}
          </div>
        )}
      </section>

      {/* Rendered even when the board could not be read: taking an order does
          not depend on anything the failed request would have answered, and
          hiding the one thing that still works would make a slow read look
          like a broken feature. */}
      {/* A 도감 fills itself: a page is unlocked by the work receipt or the
          shop purchase that earned it, and the title a finished book pays is
          granted by a trigger on that same row. There is nothing to press
          here, which is why the section carries no control. */}
      <section aria-labelledby="collection-title" className="grid gap-3">
        <h2 id="collection-title" className="text-lg">
          초반 도감
        </h2>
        <p className="max-w-prose text-sm leading-[1.8] text-muted-foreground">
          작업 보상을 받거나 상점에서 물건을 사면 도감이 저절로 채워져요. 모두 모으면 칭호를 받고,
          칭호는 프로필에서 골라 보여줄 수 있어요. 도감 보상으로 WLD를 지급하지는 않습니다.
        </p>

        {earlyGame === null ? (
          <EmptyState
            title="도감을 불러오지 못했어요."
            description="모은 장수를 추측해서 보여 주지는 않습니다. 잠시 후 다시 확인해 주세요."
          />
        ) : earlyGame.collections.length === 0 ? (
          <EmptyState
            title="아직 열린 도감이 없어요."
            description="새 도감이 열리면 이 자리에 표시돼요."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {earlyGame.collections.map((collection) => (
              <CollectionCard key={collection.book_code} collection={collection} />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="npc-title" className="grid gap-3">
        <h2 id="npc-title" className="text-lg">
          NPC 주문
        </h2>
        <p className="max-w-prose text-sm leading-[1.8] text-muted-foreground">
          주문을 하나 받으면 그 NPC와의 친밀도가 오르고, ‘이웃 돕기’ 퀘스트도 함께 1회 진행돼요.
          지금까지 쌓인 친밀도는 아직 이 화면에서 다시 불러올 수 없어요. 주문을 받으면 그 결과에
          지금 친밀도가 표시됩니다.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {NPCS.map((npc) => (
            <NpcCard key={npc.code} npc={npc}>
              <NpcOrderButton code={npc.code} />
            </NpcCard>
          ))}
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>다음 해금 단계</CardTitle>
          <CardDescription>
            퀘스트와 주문을 이어 가면 다음 성장 단계가 열려요.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {board === null ? (
            <p className="text-sm text-muted-foreground">
              다음 해금 단계를 불러오지 못했어요. 잠시 후 다시 확인해 주세요.
            </p>
          ) : (
            <NextUnlock unlock={board.next_unlock} />
          )}
          <p className="text-xs text-muted-foreground">
            단계와 조건은{' '}
            <Link href="/progression" className="text-clay-ink">
              성장 단계
            </Link>{' '}
            화면에서 자세히 볼 수 있어요.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>알림 설정</CardTitle>
          <CardDescription>
            퀘스트와 NPC 주문 소식을 받을지 정할 수 있어요. 알림을 꺼도 진행 기록은 그대로 남아요.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {/* Honest about what this screen cannot show. The preference is only
              readable through the board, so a failed read leaves the box
              showing the default rather than the member's own setting -- and
              a box that looks like a saved choice but is not would be worse
              than saying so. */}
          {board === null && (
            <p className="text-sm text-muted-foreground">
              지금 저장되어 있는 설정을 불러오지 못했어요. 아래에서 저장하면 그 값으로 바뀝니다.
            </p>
          )}
          <NotificationForm enabled={board === null ? null : board.notifications_enabled} />
        </CardContent>
      </Card>
    </div>
  );
}
