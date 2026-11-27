import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { pick } from '@/lib/copy';
import { getServerLocale } from '@/lib/locale-server';
import { requireMember } from '@/lib/session';
import { COPY } from './copy';
import type { FirstDayStep, TodayEvent } from './early-events';
import { firstDaySummary } from './early-events';
import { isEarlyGameBoard, isEngagementBoard, readFirstDaySteps, readTodayEvent } from './early-events-reader';
import { FirstDayFlow, TodayEventCard } from './early-events-parts';
import type { EarlyGameBoard } from './early-game';
import { CollectionCard, WeeklyGoalCard } from './early-game-parts';
import { NotificationForm, NpcOrderButton } from './quest-forms';
import { GoalCard, NextUnlock, NpcCard } from './quest-parts';
import { npcs } from './quests';
import type { EngagementBoard } from './quests';
import { canonicalUrl, buildOgImageUrl } from '@/lib/seo';
import { VipGoldenChestCard } from '@/components/vip-golden-chest-card';
import { parseVipChestStatus } from './vip-chest-status';

/** One member's own goals and standing. Never cached, never offered to a crawler. */
export const dynamic = 'force-dynamic';

const questsUrl = canonicalUrl('/quests');

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const t = (copy: (typeof COPY)[keyof typeof COPY]) => pick(locale, copy);
  const questsOgImage = buildOgImageUrl({
    title: t(COPY.ogImageTitle),
    description: t(COPY.ogImageDescription),
    type: 'quest',
    badge: t(COPY.ogBadge),
    metric: t(COPY.ogMetric),
    metricLabel: t(COPY.ogMetricLabel),
  });
  return {
    title: t(COPY.metaTitle),
    description: t(COPY.metaDescription),
    alternates: { canonical: questsUrl },
    robots: { index: false, follow: false },
    openGraph: {
      title: t(COPY.ogTitle),
      description: t(COPY.metaDescription),
      url: questsUrl,
      images: [{ url: questsOgImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t(COPY.ogTitle),
      description: t(COPY.twitterDescription),
      images: [questsOgImage],
    },
  };
}


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
  const locale = await getServerLocale();
  const t = (copy: (typeof COPY)[keyof typeof COPY]) => pick(locale, copy);

  // Two requests, issued together. `member_engagement_dashboard` assembles
  // today's goals, the next unlock and the preference in one function; the
  // early-game read is separate because it is a different kind of answer --
  // 101 computes every figure in it from work receipts, shop purchases and
  // ledger postings rather than from anything a member reported.
  const [board, earlyGame, today, firstDay, rawVipChest] = await Promise.all([
    // Spring answers /engagement with a streak status, not the dashboard: only
    // a body with the dashboard's own arrays is read (2026-11-25 regression).
    apiOrNull<unknown>('/api/v1/engagement').then((raw) => (isEngagementBoard(raw) ? raw : null)),
    apiOrNull<unknown>('/api/v1/engagement/early-game').then((raw) => (isEarlyGameBoard(raw) ? raw : null)),
    apiOrNull<unknown>('/api/v1/early-game/today').then(readTodayEvent),
    apiOrNull<unknown>('/api/v1/early-game/first-day').then((raw) => {
      const steps = readFirstDaySteps(raw);
      return steps ? { steps } : null;
    }),
    apiOrNull<unknown>('/api/v1/engagement/dopamine/vip-chest/status'),
  ]);

  const vipChest = parseVipChestStatus(rawVipChest);

  return (
    <div data-page="quests" className="mv-page mv-page--gameplay grid gap-6">
      <PageHeader eyebrow="DAILY QUESTS" title={t(COPY.title)}>
        {t(COPY.intro)}
      </PageHeader>

      {/* Moneyverse Plus VIP Daily Golden Chest */}
      <VipGoldenChestCard status={vipChest} />

      {/* The day's event comes first because it expires: the ladder, the
          books and the weekly goals are all still there tomorrow, and this is
          the one thing on the screen that is not. */}
      <section aria-labelledby="event-title" className="grid gap-3">
        <h2 id="event-title" className="text-lg">
          {t(COPY.eventTitle)}
        </h2>
        {/* Said plainly, because a member who does not know this will try it:
            the event is a function of the member and today's Seoul date, so
            there is nothing to reroll. */}
        <p className="max-w-prose text-sm leading-[1.8] text-muted-foreground">
          {t(COPY.eventIntro)}
        </p>

        {today === null ? (
          <EmptyState
            title={t(COPY.eventLoadError)}
            description={t(COPY.eventLoadErrorHint)}
          />
        ) : today.event === null ? (
          // A different fact from the one above: the request worked and there
          // is no event open at all.
          <EmptyState
            title={t(COPY.eventNone)}
            description={t(COPY.eventNoneHint)}
          />
        ) : (
          <TodayEventCard event={today.event} locale={locale} />
        )}
      </section>

      <section aria-labelledby="firstday-title" className="grid gap-3">
        <h2 id="firstday-title" className="text-lg">
          {t(COPY.firstDayTitle)}
        </h2>
        <p className="max-w-prose text-sm leading-[1.8] text-muted-foreground">
          {t(COPY.firstDayIntro)}
          {firstDay !== null && firstDay.steps.length > 0
            ? ` ${firstDaySummary(firstDay.steps, locale)}.`
            : ''}
        </p>

        {firstDay === null ? (
          <EmptyState
            title={t(COPY.firstDayLoadError)}
            description={t(COPY.progressGuessHint)}
          />
        ) : firstDay.steps.length === 0 ? (
          <EmptyState
            title={t(COPY.firstDayNone)}
            description={t(COPY.firstDayNoneHint)}
          />
        ) : (
          <FirstDayFlow steps={firstDay.steps} locale={locale} />
        )}
      </section>

      <section aria-labelledby="today-title" className="grid gap-3">
        <h2 id="today-title" className="text-lg">
          {t(COPY.todayTitle)}
        </h2>
        {/* Said once, at the top of the section that needs it: the count is
            the only figure the API can answer with, and how it moves is not
            obvious from a button labelled "Record". */}
        <p className="max-w-prose text-sm leading-[1.8] text-muted-foreground">
          {t(COPY.todayIntro)}
        </p>

        {board === null ? (
          <EmptyState
            title={t(COPY.todayLoadError)}
            description={t(COPY.progressGuessHint)}
          />
        ) : board.today_tasks.length === 0 ? (
          // A different fact from the one above: the request worked and the
          // catalogue has nothing open for today.
          <EmptyState
            title={t(COPY.todayNone)}
            description={t(COPY.todayNoneHint)}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {board.today_tasks.map((goal) => (
              <GoalCard key={goal.code} goal={goal} locale={locale} />
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
          {t(COPY.weeklyTitle)}
        </h2>
        <p className="max-w-prose text-sm leading-[1.8] text-muted-foreground">
          {t(COPY.weeklyIntro)}
        </p>

        {earlyGame === null ? (
          <EmptyState
            title={t(COPY.weeklyLoadError)}
            description={t(COPY.progressGuessHint)}
          />
        ) : earlyGame.goals.length === 0 ? (
          <EmptyState
            title={t(COPY.weeklyNone)}
            description={t(COPY.weeklyNoneHint)}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {earlyGame.goals.map((goal) => (
              <WeeklyGoalCard key={goal.goal_code} goal={goal} locale={locale} />
            ))}
          </div>
        )}
      </section>

      {/* Rendered even when the board could not be read: taking an order does
          not depend on anything the failed request would have answered, and
          hiding the one thing that still works would make a slow read look
          like a broken feature. */}
      {/* A collection book fills itself: a page is unlocked by the work receipt or the
          shop purchase that earned it, and the title a finished book pays is
          granted by a trigger on that same row. There is nothing to press
          here, which is why the section carries no control. */}
      <section aria-labelledby="collection-title" className="grid gap-3">
        <h2 id="collection-title" className="text-lg">
          {t(COPY.collectionTitle)}
        </h2>
        <p className="max-w-prose text-sm leading-[1.8] text-muted-foreground">
          {t(COPY.collectionIntro)}
        </p>

        {earlyGame === null ? (
          <EmptyState
            title={t(COPY.collectionLoadError)}
            description={t(COPY.collectionLoadErrorHint)}
          />
        ) : earlyGame.collections.length === 0 ? (
          <EmptyState
            title={t(COPY.collectionNone)}
            description={t(COPY.collectionNoneHint)}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {earlyGame.collections.map((collection) => (
              <CollectionCard key={collection.book_code} collection={collection} locale={locale} />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="npc-title" className="grid gap-3">
        <h2 id="npc-title" className="text-lg">
          {t(COPY.npcTitle)}
        </h2>
        <p className="max-w-prose text-sm leading-[1.8] text-muted-foreground">
          {t(COPY.npcIntro)}
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {npcs(locale).map((npc) => (
            <NpcCard key={npc.code} npc={npc}>
              <NpcOrderButton code={npc.code} />
            </NpcCard>
          ))}
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{t(COPY.nextUnlockTitle)}</CardTitle>
          <CardDescription>
            {t(COPY.nextUnlockDescription)}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {board === null ? (
            <p className="text-sm text-muted-foreground">
              {t(COPY.nextUnlockLoadError)}
            </p>
          ) : (
            <NextUnlock unlock={board.next_unlock} locale={locale} />
          )}
          <p className="text-xs text-muted-foreground">
            {t(COPY.progressionBefore)}
            <Link href="/progression" className="text-clay-ink">
              {t(COPY.progressionLink)}
            </Link>
            {t(COPY.progressionAfter)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t(COPY.notifTitle)}</CardTitle>
          <CardDescription>
            {t(COPY.notifDescription)}
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
              {t(COPY.notifLoadError)}
            </p>
          )}
          <NotificationForm enabled={board === null ? null : board.notifications_enabled} />
        </CardContent>
      </Card>
    </div>
  );
}
