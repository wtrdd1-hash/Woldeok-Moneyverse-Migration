import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { pick } from '@/lib/copy';
import type { Locale } from '@/lib/locale';
import { COPY } from './copy';
import { goalTitle, progressLabel, stageLabel, unlockLines } from './quests';
import type { EngagementGoal, EngagementNextUnlock, Npc } from './quests';

/**
 * The three pieces of the engagement board worth rendering on their own.
 *
 * None of them is a client component: they hold no state and take no event,
 * so they render on the server with the page. They live here rather than
 * inside `page.tsx` because a page cannot be rendered in a test -- that needs
 * a live API and a database -- while these can, and the words a goal is read
 * in are exactly the thing this feature is most likely to get wrong.
 *
 * Each takes the control that acts on it as `children`, so the server half
 * and the client half meet in the page rather than here.
 *
 * `locale` defaults to Korean, the carried-over copy; the page passes the request locale.
 */

/**
 * One goal: what it is called, how far it has come, and the way to move it.
 *
 * There is no bar and no denominator. The dashboard sends the count and not
 * the target -- `engagement_catalog.requirements` is behind a table the
 * application role cannot read -- and a progress bar drawn against a guessed
 * target would state a rule the database has not agreed to. The count is the
 * whole truth available, so the count is what is shown.
 */
export function GoalCard({
  goal,
  children,
  locale = 'ko',
}: {
  readonly goal: EngagementGoal;
  readonly children?: React.ReactNode;
  readonly locale?: Locale;
}) {
  return (
    <Card className="justify-between gap-4">
      <CardHeader>
        <Badge variant="secondary" className="w-fit font-mono">
          {goal.code}
        </Badge>
        <CardTitle className="text-base">{goalTitle(goal, locale)}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-1 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-muted-foreground">{pick(locale, COPY.recordedProgress)}</span>
          <span className="tabular">{progressLabel(goal.progress, locale)}</span>
        </div>
      </CardContent>
      {children && <CardFooter>{children}</CardFooter>}
    </Card>
  );
}

/**
 * One NPC and the errand they hand out.
 *
 * The affinity already standing between the member and this NPC is not shown,
 * because it cannot be read: `npc_relationships` is revoked from the
 * application role and 082 grants no reader. Leaving the figure out is the
 * honest half of that; the section says the other half in words.
 */
export function NpcCard({
  npc,
  children,
}: {
  readonly npc: Npc;
  readonly children?: React.ReactNode;
}) {
  return (
    <Card className="justify-between gap-4">
      <CardHeader>
        <Badge variant="secondary" className="w-fit font-mono">
          {npc.code}
        </Badge>
        <CardTitle className="text-base">{npc.name}</CardTitle>
        <CardDescription>{npc.errand}</CardDescription>
      </CardHeader>
      {children && <CardFooter>{children}</CardFooter>}
    </Card>
  );
}

/**
 * The stage waiting above this one, and what it asks for.
 *
 * A null unlock is two facts at once -- the member is at the top stage, or
 * they have no `user_progression` row for the function's subquery to find --
 * and this screen cannot tell them apart. So it says both rather than picking
 * the flattering one and sending a member who has never been assessed away
 * believing they have finished.
 */
export function NextUnlock({
  unlock,
  locale = 'ko',
}: {
  readonly unlock: EngagementNextUnlock | null;
  readonly locale?: Locale;
}) {
  if (unlock === null) {
    return (
      <p className="text-sm text-muted-foreground">
        {pick(locale, COPY.unlockUnknown)}
      </p>
    );
  }

  const lines = unlockLines(unlock.requirements, locale);

  return (
    <div className="grid gap-2">
      <p className="text-sm">
        {pick(locale, COPY.nextStageBefore)}<b className="font-medium">{stageLabel(unlock.stage, locale)}</b>{pick(locale, COPY.nextStageAfter)}
      </p>
      {lines.length === 0 ? (
        <p className="text-sm text-muted-foreground">{pick(locale, COPY.noRequirements)}</p>
      ) : (
        <dl className="grid gap-1 text-sm">
          {lines.map((line) => (
            <div key={line.key} className="flex items-baseline justify-between gap-3">
              <dt className="text-muted-foreground">{line.label}</dt>
              <dd className="tabular">{line.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
