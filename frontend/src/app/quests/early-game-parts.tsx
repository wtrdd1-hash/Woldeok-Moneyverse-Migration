import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatDay } from '@/lib/money';
import type { EarlyCollection, EarlyWeeklyGoal } from './early-game';
import {
  collectionFigure,
  collectionPercent,
  collectionRewardNote,
  goalCaveat,
  goalFigure,
  goalPercent,
  goalWindowLabel,
} from './early-game';

/**
 * The two cards 16.1's early game needs, and the one thing they do that the
 * quest cards above them cannot: draw a bar.
 *
 * `GoalCard` in `quest-parts.tsx` deliberately has no denominator, because the
 * dashboard sends a count and not a target and a bar against a guessed target
 * would state a rule the database has not agreed to. These goals carry their
 * target in the same row as their progress, both computed by the same
 * function, so the bar is drawn from two numbers that were decided together.
 */
export function WeeklyGoalCard({ goal }: { readonly goal: EarlyWeeklyGoal }) {
  const caveat = goalCaveat(goal);

  return (
    <Card className="justify-between gap-4">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{goalWindowLabel(goal.goal_window)}</Badge>
          {goal.goal_completed && <Badge>달성</Badge>}
        </div>
        <CardTitle className="text-base">{goal.goal_label}</CardTitle>
        <CardDescription>{goal.goal_detail}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-muted-foreground">진행</span>
          <span className="tabular">{goalFigure(goal)}</span>
        </div>
        <Progress value={goalPercent(goal.goal_progress, goal.goal_target)} />
        {caveat && <p className="text-xs text-muted-foreground">{caveat}</p>}
      </CardContent>
    </Card>
  );
}

/**
 * One collection book, page by page.
 *
 * A filled page shows the day its evidence was recorded -- the day the work
 * paid or the item was bought -- and not the day anything swept for it, which
 * is the only date a member would recognise.
 */
export function CollectionCard({ collection }: { readonly collection: EarlyCollection }) {
  return (
    <Card className="justify-between gap-4">
      <CardHeader>
        <CardTitle className="text-base">{collection.book_label}</CardTitle>
        <CardDescription>{collection.book_detail}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-muted-foreground">모은 장수</span>
          <span className="tabular">{collectionFigure(collection)}</span>
        </div>
        <Progress value={collectionPercent(collection.entry_unlocked, collection.entry_total)} />

        <ul className="grid gap-1">
          {collection.entries.map((entry) => (
            <li key={entry.code} className="flex items-baseline justify-between gap-3">
              <span className={entry.unlocked ? '' : 'text-muted-foreground'}>{entry.label}</span>
              <span className="tabular text-xs text-muted-foreground">
                {entry.unlocked ? formatDay(entry.unlocked_at, '기록됨') : '아직'}
              </span>
            </li>
          ))}
        </ul>

        <p className="text-xs text-muted-foreground">{collectionRewardNote(collection)}</p>
      </CardContent>
    </Card>
  );
}
