import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { isLoggedInMember } from '@/lib/session';
import type { FirstDayStep, TodayEvent } from './early-events';
import { FirstDayFlow, TodayEventCard } from './early-events-parts';
import type { EarlyGameBoard, EarlyWeeklyGoal } from './early-game';
import { CollectionCard, WeeklyGoalCard } from './early-game-parts';
import { NotificationForm, NpcOrderButton } from './quest-forms';
import { GoalCard, NextUnlock, NpcCard } from './quest-parts';
import { NPCS } from './quests';
import type { EngagementBoard, EngagementGoal } from './quests';
import { canonicalUrl, buildOgImageUrl } from '@/lib/seo';
import { VipGoldenChestCard } from '@/components/vip-golden-chest-card';
import { parseVipChestStatus } from './vip-chest-status';
import { Sparkles, Trophy, ShieldCheck, Flame, Compass, Coins, UserCheck } from 'lucide-react';

/** One member's own goals and standing. Never cached, never offered to a crawler. */
export const dynamic = 'force-dynamic';

const questsUrl = canonicalUrl('/quests');
const questsOgImage = buildOgImageUrl({
  title: '일일 퀘스트 & 출석 도전과제',
  description: '디스코드 활동과 연동되는 일일 퀘스트와 연속 출석을 달성하고 WLD 게임 보상을 수령하세요.',
  type: 'quest',
  badge: '퀘스트 & 도전과제',
  metric: '일일 보상 수령',
  metricLabel: 'WLD 지급',
});

export const metadata: Metadata = {
  title: '일일 퀘스트 및 도전과제 — 월덕 머니버스',
  description: '디스코드 커뮤니티 활동과 연동되는 일일 퀘스트와 연속 출석 도전과제를 달성하고 WLD 보상을 수령하세요.',
  alternates: { canonical: questsUrl },
  robots: { index: false, follow: false },
  openGraph: {
    title: '일일 퀘스트 및 도전과제 — 월덕 머니버스',
    description: '디스코드 커뮤니티 활동과 연동되는 일일 퀘스트와 연속 출석 도전과제를 달성하고 WLD 보상을 수령하세요.',
    url: questsUrl,
    images: [{ url: questsOgImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '일일 퀘스트 및 도전과제 — 월덕 머니버스',
    description: '디스코드 커뮤니티 활동 연동 보상',
    images: [questsOgImage],
  },
};

/** 기본 게스트용 일일 퀘스트 데이터 (로그인 전 둘러보기 보장) */
const DEFAULT_GUEST_TASKS: readonly EngagementGoal[] = [
  { code: 'daily_login', title: '월덕 머니버스 매일 출석 체크', progress: 1 },
  { code: 'market_look', title: '실시간 가상 주식 시장 호가 확인', progress: 0 },
  { code: 'casino_roll', title: '미니게임 아케이드 1회 탐색', progress: 0 },
  { code: 'npc_chat', title: '골목 상권 상인 NPC 주문 접수', progress: 0 },
];

const DEFAULT_GUEST_WEEKLY: readonly EarlyWeeklyGoal[] = [
  {
    goal_code: 'weekly_deposit',
    goal_label: '중앙은행 정기예금',
    goal_detail: '중앙은행에 10,000 WLD 이상 예치하고 복리 이자를 획득하세요.',
    goal_metric: '예치 횟수',
    goal_window: '주간',
    goal_target: '3',
    goal_progress: '0',
    goal_unit: '회',
    goal_self_reported: false,
    goal_completed: false,
    week_start: '2026-11-24',
  },
  {
    goal_code: 'weekly_quest',
    goal_label: '일일 퀘스트 5회 달성',
    goal_detail: '주간 동안 일일 퀘스트를 총 5회 이상 완수하세요.',
    goal_metric: '퀘스트 달성',
    goal_window: '주간',
    goal_target: '5',
    goal_progress: '1',
    goal_unit: '회',
    goal_self_reported: false,
    goal_completed: false,
    week_start: '2026-11-24',
  },
  {
    goal_code: 'weekly_trade',
    goal_label: '거래소 주문 체결',
    goal_detail: '주식 거래소에서 1회 이상 지정가 매매를 체결하세요.',
    goal_metric: '거래 체결',
    goal_window: '주간',
    goal_target: '1',
    goal_progress: '0',
    goal_unit: '건',
    goal_self_reported: false,
    goal_completed: false,
    week_start: '2026-11-24',
  },
];

export default async function QuestsPage() {
  // 비로그인 방문자도 화면 로드 실패 없이 100% 온전하게 둘러볼 수 있도록 안전한 세션 확인
  const isMember = await isLoggedInMember();

  const [board, earlyGame, today, firstDay, rawVipChest] = await Promise.all([
    apiOrNull<EngagementBoard>('/api/v1/engagement'),
    apiOrNull<EarlyGameBoard>('/api/v1/engagement/early-game'),
    apiOrNull<{ event: TodayEvent | null }>('/api/v1/early-game/today'),
    apiOrNull<{ steps: readonly FirstDayStep[] }>('/api/v1/early-game/first-day'),
    apiOrNull<unknown>('/api/v1/engagement/dopamine/vip-chest/status'),
  ]);

  const vipChest = parseVipChestStatus(rawVipChest);

  // 게스트 방문자용 활성 퀘스트 및 목표
  const activeTasks = board?.today_tasks && board.today_tasks.length > 0 ? board.today_tasks : DEFAULT_GUEST_TASKS;
  const activeWeekly: readonly EarlyWeeklyGoal[] = earlyGame?.goals && earlyGame.goals.length > 0 ? earlyGame.goals : DEFAULT_GUEST_WEEKLY;

  return (
    <div data-page="quests" className="mv-page mv-page--gameplay grid gap-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* 게임형 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-500 uppercase">
            <Sparkles className="w-4 h-4" />
            <span>DAILY ENGAGEMENT & QUESTS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1 flex items-center gap-2">
            일일 퀘스트 및 NPC 도전과제
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            가상 경제 활동과 연동되는 일일 퀘스트와 연속 출석을 달성하고 WLD 게임 보상을 수령하세요. 모든 퀘스트는 게임 내 경제 원장과 안전하게 연동됩니다.
          </p>
        </div>

        {/* 게스트 둘러보기 뱃지 / 로그인 안내 */}
        {!isMember && (
          <div className="flex items-center gap-3 bg-card border border-amber-500/40 rounded-xl p-3 shadow-sm">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-foreground">게스트 둘러보기 모드</div>
              <div className="text-xs text-muted-foreground">로그인 시 퀘스트 진행도 및 WLD 보상이 자동 저장됩니다.</div>
            </div>
            <Link
              href="/login"
              className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-black transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>로그인</span>
            </Link>
          </div>
        )}
      </div>

      {/* Moneyverse Plus VIP Daily Golden Chest */}
      <VipGoldenChestCard status={vipChest} />

      {/* 오늘의 한정 이벤트 */}
      <section aria-labelledby="event-title" className="grid gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500" />
            <h2 id="event-title" className="text-lg font-bold text-foreground">
              오늘의 특별 이벤트
            </h2>
          </div>
          <span className="text-xs text-muted-foreground font-mono">자정 00:00 KST 갱신</span>
        </div>

        {today?.event ? (
          <TodayEventCard event={today.event} />
        ) : (
          <Card className="bg-card/60 border-border/80">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground">골든 타임: 일일 경제 부스팅 데이</div>
                  <div className="text-xs text-muted-foreground">오늘 퀘스트 완료 시 경험치 및 WLD 추가 보너스가 제공됩니다.</div>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                진행 중
              </span>
            </CardContent>
          </Card>
        )}
      </section>

      {/* 신규 유저 1일차 온보딩 플로우 */}
      {firstDay !== null && firstDay.steps.length > 0 && (
        <section aria-labelledby="first-day-title" className="grid gap-3">
          <h2 id="first-day-title" className="text-lg font-bold text-foreground flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            신규 모험가 1일차 여정
          </h2>
          <FirstDayFlow steps={firstDay.steps} />
        </section>
      )}

      {/* 일일 퀘스트 진행도 */}
      <section aria-labelledby="tasks-title" className="grid gap-3">
        <div className="flex items-center justify-between">
          <h2 id="tasks-title" className="text-lg font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            일일 활동 퀘스트
          </h2>
          <span className="text-xs text-muted-foreground">매일 4종 무작위 배정</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {activeTasks.map((goal) => (
            <GoalCard key={goal.code} goal={goal} />
          ))}
        </div>
      </section>

      {/* 주간 목표 */}
      <section aria-labelledby="weekly-title" className="grid gap-3">
        <h2 id="weekly-title" className="text-lg font-bold text-foreground flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          주간 마일스톤 과제
        </h2>
        <p className="text-xs text-muted-foreground">
          한 주 동안 경제 생태계에 참여하고 누적 달성 시 대형 WLD 보상 패키지를 수령할 수 있습니다.
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          {activeWeekly.map((goal) => (
            <WeeklyGoalCard key={goal.goal_code} goal={goal} />
          ))}
        </div>
      </section>

      {/* 초반 도감 컬렉션 */}
      <section aria-labelledby="collection-title" className="grid gap-3">
        <h2 id="collection-title" className="text-lg font-bold text-foreground">
          초반 경제 활동 도감
        </h2>
        <p className="max-w-prose text-xs text-muted-foreground leading-relaxed">
          직업 활동이나 상점에서 물품을 획득하면 도감에 자동으로 기록됩니다. 도감을 완성하여 특별 칭호와 명예 뱃지를 해금하세요.
        </p>

        {earlyGame === null || earlyGame.collections.length === 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="bg-card/50 border-border/70">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-zinc-400">
                  #1
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">초보 상인의 기본 장부</div>
                  <div className="text-xs text-muted-foreground">은행 첫 거래 및 계좌 개설 완료 시 해금 (0/3)</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/70">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-zinc-400">
                  #2
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">골목길 상권 개척록</div>
                  <div className="text-xs text-muted-foreground">상인 NPC 주문 5회 성공 시 해금 (0/5)</div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {earlyGame.collections.map((collection) => (
              <CollectionCard key={collection.book_code} collection={collection} />
            ))}
          </div>
        )}
      </section>

      {/* NPC 주문 */}
      <section aria-labelledby="npc-title" className="grid gap-3">
        <h2 id="npc-title" className="text-lg font-bold text-foreground">
          상인 NPC 특수 주문
        </h2>
        <p className="max-w-prose text-xs text-muted-foreground leading-relaxed">
          NPC의 일일 주문을 수락하여 납품하면 해당 상인과의 친밀도가 상승하며, 희귀 제작 레시피와 할인 혜택이 주어집니다.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {NPCS.map((npc) => (
            <NpcCard key={npc.code} npc={npc}>
              <NpcOrderButton code={npc.code} />
            </NpcCard>
          ))}
        </div>
      </section>

      {/* 다음 해금 단계 */}
      <Card className="bg-card border-border/80">
        <CardHeader>
          <CardTitle className="text-base font-bold">다음 성장 해금 단계</CardTitle>
          <CardDescription className="text-xs">
            퀘스트와 주문을 지속적으로 달성하면 다음 경제 등급이 해금됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {board?.next_unlock ? (
            <NextUnlock unlock={board.next_unlock} />
          ) : (
            <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-xs text-muted-foreground flex items-center justify-between">
              <span>다음 해금: [골목 상인 2단계] — 누적 WLD 100,000 보유 및 퀘스트 10회 완료</span>
              <span className="font-mono text-amber-500 font-semibold">10% 달성</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            성장 단계와 혜택은{' '}
            <Link href="/progression" className="text-amber-500 hover:underline font-medium">
              성장 단계 안내
            </Link>{' '}
            페이지에서 자세히 확인하실 수 있습니다.
          </p>
        </CardContent>
      </Card>

      {/* 알림 설정 */}
      <Card className="bg-card border-border/80">
        <CardHeader>
          <CardTitle className="text-base font-bold">퀘스트 리마인더 알림 설정</CardTitle>
          <CardDescription className="text-xs">
            일일 퀘스트 및 NPC 주문 갱신 소식을 실시간으로 받을지 설정할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <NotificationForm enabled={board === null ? false : board.notifications_enabled} />
        </CardContent>
      </Card>
    </div>
  );
}
