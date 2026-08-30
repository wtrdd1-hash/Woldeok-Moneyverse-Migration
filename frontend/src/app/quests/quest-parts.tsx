import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { goalTitle, progressLabel, stageLabel, unlockLines } from './quests';
import type { EngagementGoal, EngagementNextUnlock, Npc } from './quests';

/**
 * The three pieces of the engagement board worth rendering on their own.
 *
 * None of them is a client component: they hold no state and take no event,
 * so they render on the server with the page. They live here rather than
 * inside `page.tsx` because a page cannot be rendered in a test -- that needs
 * a live API and a database -- while these can, and the Korean a goal is read
 * in is exactly the thing this feature is most likely to get wrong.
 *
 * Each takes the control that acts on it as `children`, so the server half
 * and the client half meet in the page rather than here.
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
}: {
  readonly goal: EngagementGoal;
  readonly children?: React.ReactNode;
}) {
  return (
    <Card className="justify-between gap-4">
      <CardHeader>
        <Badge variant="secondary" className="w-fit font-mono">
          {goal.code}
        </Badge>
        <CardTitle className="text-base">{goalTitle(goal)}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-1 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-muted-foreground">기록된 진행</span>
          <span className="tabular">{progressLabel(goal.progress)}</span>
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
export function NextUnlock({ unlock }: { readonly unlock: EngagementNextUnlock | null }) {
  if (unlock === null) {
    return (
      <p className="text-sm text-muted-foreground">
        다음으로 해금할 단계를 아직 알 수 없어요. 성장 단계를 한 번도 계산하지 않았거나, 이미
        마지막 단계일 수 있어요.
      </p>
    );
  }

  const lines = unlockLines(unlock.requirements);

  return (
    <div className="grid gap-2">
      <p className="text-sm">
        다음 단계 <b className="font-medium">{stageLabel(unlock.stage)}</b> 조건
      </p>
      {lines.length === 0 ? (
        <p className="text-sm text-muted-foreground">다음 단계에 필요한 조건이 따로 없어요.</p>
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
