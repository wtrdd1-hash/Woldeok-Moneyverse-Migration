import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { requireMember } from '@/lib/session';
import { NotificationForm, NpcOrderButton, RecordProgressButton } from './quest-forms';
import { GoalCard, NextUnlock, NpcCard } from './quest-parts';
import { NPCS } from './quests';
import type { EngagementBoard } from './quests';

/** One member's own goals and standing. Never cached, never offered to a crawler. */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '퀘스트',
  robots: { index: false, follow: false },
};

export default async function QuestsPage() {
  await requireMember();

  // One request, not four. `member_engagement_dashboard` assembles today's
  // goals, this week's, the next unlock and the preference in a single
  // function, and the page renders them side by side.
  const board = await apiOrNull<EngagementBoard>('/api/v1/engagement');

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="DAILY QUESTS" title="퀘스트와 NPC 주문">
        퀘스트와 NPC 주문은 모두 게임 안의 활동 기록입니다. 달성하더라도 실제 현금이나 실물
        경품은 지급되지 않습니다.
      </PageHeader>

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
              <GoalCard key={goal.code} goal={goal}>
                <RecordProgressButton code={goal.code} />
              </GoalCard>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="weekly-title" className="grid gap-3">
        <h2 id="weekly-title" className="text-lg">
          이번 주 목표
        </h2>
        <p className="max-w-prose text-sm leading-[1.8] text-muted-foreground">
          주간 목표는 월요일마다 새로 시작해요. 지난주에 기록한 진행은 이번 주로 넘어오지 않아요.
        </p>

        {board === null ? (
          <EmptyState
            title="이번 주 목표를 불러오지 못했어요."
            description="잠시 후 다시 확인해 주세요."
          />
        ) : board.weekly_goals.length === 0 ? (
          <EmptyState
            title="이번 주에 열린 목표가 없어요."
            description="새 주간 목표가 열리면 이 자리에 표시돼요."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {board.weekly_goals.map((goal) => (
              <GoalCard key={goal.code} goal={goal}>
                <RecordProgressButton code={goal.code} />
              </GoalCard>
            ))}
          </div>
        )}
      </section>

      {/* Rendered even when the board could not be read: taking an order does
          not depend on anything the failed request would have answered, and
          hiding the one thing that still works would make a slow read look
          like a broken feature. */}
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
