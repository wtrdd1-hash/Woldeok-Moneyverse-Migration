import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatMoment } from '@/lib/money';
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
export function TodayEventCard({ event }: { readonly event: TodayEvent }) {
  const blocked = eventBlockMessage(event);
  const experience = experienceNote(event);
  const pending = pendingEffectNote(event);

  return (
    <Card className="justify-between gap-4">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">오늘의 사건</Badge>
          {event.claimed && <Badge>받음</Badge>}
        </div>
        <CardTitle className="text-base">{event.event_label}</CardTitle>
        <CardDescription>{event.event_detail}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-muted-foreground">오늘 받을 것</span>
          <span className="tabular">{rewardLine(event)}</span>
        </div>

        {pending && <p className="text-xs text-muted-foreground">{pending}</p>}
        {experience && <p className="text-xs text-muted-foreground">{experience}</p>}

        {event.claimed ? (
          <div className="grid gap-1">
            <p className="text-sm text-muted-foreground">
              {formatMoment(event.claimed_at, '오늘')}에 받았어요.
            </p>
            {/* A receipt with no transaction is not a defect: an event that
                pays only an item or only experience moves no money, so there
                is nothing in the ledger to point at. */}
            {event.claim_transaction_id !== null && (
              <Link href="/wallet" className="text-xs font-extrabold text-clay-ink">
                지갑에서 지급 기록 보기
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
export function FirstDayFlow({ steps }: { readonly steps: readonly FirstDayStep[] }) {
  return (
    <ol className="grid gap-3">
      {steps.map((step, index) => {
        const figure = stepFigure(step);
        return (
          <li key={step.step_code}>
            <Card className="gap-3">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{index + 1}단계</Badge>
                  {step.step_done && <Badge>완료</Badge>}
                  {!step.step_verified && <Badge variant="outline">직접 확인</Badge>}
                </div>
                <CardTitle className="text-base">{step.step_label}</CardTitle>
                <CardDescription>{step.step_detail}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm">
                {figure !== null && (
                  <>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-muted-foreground">진행</span>
                      <span className="tabular">{figure}</span>
                    </div>
                    <Progress value={goalPercent(step.step_progress, step.step_target)} />
                  </>
                )}
                <Link href={step.step_href} className="text-xs font-extrabold text-clay-ink">
                  바로 가기
                </Link>
              </CardContent>
            </Card>
          </li>
        );
      })}
    </ol>
  );
}
