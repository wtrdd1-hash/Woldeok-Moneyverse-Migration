import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { pick } from '@/lib/copy';
import type { Locale } from '@/lib/locale';
import { formatMoment } from '@/lib/money';
import { COPY, fill } from './copy';
import type { FirstDayStep, TodayEvent } from './early-events';
import {
  eventBlockMessage,
  experienceNote,
  pendingEffectNote,
  rewardLine,
  stepFigure,
} from './early-events';
// The same clamped ratio over two bigint strings the weekly goals draw their
// bar from. One implementation, so two sections of one screen cannot come to
// disagree about what half looks like.
import { goalPercent } from './early-game';
import { ClaimEventButton } from './event-forms';

/**
 * The day's event, and the seven steps of the first day.
 *
 * Both are read-only apart from one button, and that button sends nothing but
 * an idempotency key and the day the card is showing. The event itself is
 * drawn by the database from the member and the Seoul date, which is why
 * there is no list to choose from here and no refresh that would change it.
 */
export function TodayEventCard({ event, locale = 'ko' }: { readonly event: TodayEvent; readonly locale?: Locale }) {
  const blocked = eventBlockMessage(event, locale);
  const experience = experienceNote(event, locale);
  const pending = pendingEffectNote(event, locale);

  return (
    <Card className="justify-between gap-4">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{pick(locale, COPY.eventTitle)}</Badge>
          {event.claimed && <Badge>{pick(locale, COPY.claimedBadge)}</Badge>}
        </div>
        <CardTitle className="text-base">{event.event_label}</CardTitle>
        <CardDescription>{event.event_detail}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-muted-foreground">{pick(locale, COPY.rewardToday)}</span>
          <span className="tabular">{rewardLine(event, locale)}</span>
        </div>

        {pending && <p className="text-xs text-muted-foreground">{pending}</p>}
        {experience && <p className="text-xs text-muted-foreground">{experience}</p>}

        {event.claimed ? (
          <div className="grid gap-1">
            <p className="text-sm text-muted-foreground">
              {fill(pick(locale, COPY.claimedAt), { at: formatMoment(event.claimed_at, pick(locale, COPY.today)) })}
            </p>
            {/* A receipt with no transaction is not a defect: an event that
                pays only an item or only experience moves no money, so there
                is nothing in the ledger to point at. */}
            {event.claim_transaction_id !== null && (
              <Link href="/wallet" className="text-xs font-extrabold text-clay-ink">
                {pick(locale, COPY.viewPayout)}
              </Link>
            )}
          </div>
        ) : (
          <ClaimEventButton
            eventDate={event.event_date}
            label={event.claim_label}
            disabled={blocked !== null}
          />
        )}

        {blocked && <p className="text-xs text-muted-foreground">{blocked}</p>}
      </CardContent>
    </Card>
  );
}

/**
 * 16.1's first day, step by step.
 *
 * A step nothing records carries a link and no bar. That is the honest
 * rendering: `member_profiles`, work receipts, purchases and job progress are
 * rows somebody else's function wrote, and nothing at all is written when a
 * member reads the tutorial or opens the growth board.
 */
export function FirstDayFlow({ steps, locale = 'ko' }: { readonly steps: readonly FirstDayStep[]; readonly locale?: Locale }) {
  return (
    <ol className="grid gap-3">
      {steps.map((step, index) => {
        const figure = stepFigure(step);
        return (
          <li key={step.step_code}>
            <Card className="gap-3">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{fill(pick(locale, COPY.stepBadge), { n: String(index + 1) })}</Badge>
                  {step.step_done && <Badge>{pick(locale, COPY.done)}</Badge>}
                  {!step.step_verified && <Badge variant="outline">{pick(locale, COPY.selfCheck)}</Badge>}
                </div>
                <CardTitle className="text-base">{step.step_label}</CardTitle>
                <CardDescription>{step.step_detail}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm">
                {figure !== null && (
                  <>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-muted-foreground">{pick(locale, COPY.progress)}</span>
                      <span className="tabular">{figure}</span>
                    </div>
                    <Progress value={goalPercent(step.step_progress, step.step_target)} />
                  </>
                )}
                <Link href={step.step_href} className="text-xs font-extrabold text-clay-ink">
                  {pick(locale, COPY.goTo)}
                </Link>
              </CardContent>
            </Card>
          </li>
        );
      })}
    </ol>
  );
}
