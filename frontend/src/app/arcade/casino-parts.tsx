import { Amount } from '@/components/amount';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CLOSURE_COPY, absAmount, resultOf } from './coin';
import type { CasinoClosure } from './coin';

/**
 * The two pieces of the coin game that are worth rendering on their own.
 *
 * Neither is a client component: they hold no state and take no event, so
 * they render on the server with the page. They live here rather than inside
 * `page.tsx` because a page cannot be rendered in a test — that needs a live
 * API and a database — while these can, and the sentence a closed casino
 * shows is exactly the thing a member is most likely to see.
 */

/**
 * The casino, shut, said in one sentence a member can act on.
 *
 * An `Alert` rather than an `EmptyState`, and the distinction is deliberate:
 * `EmptyState` answers "there is nothing here yet" and must never quietly
 * become the answer for something else. A closed game is not an empty list
 * and not a failed request; it is a state somebody put the game into.
 */
export function ClosedNotice({ closure }: { readonly closure: CasinoClosure }) {
  const copy = CLOSURE_COPY[closure];
  return (
    <Alert>
      <AlertTitle>{copy.title}</AlertTitle>
      <AlertDescription>{copy.description}</AlertDescription>
    </Alert>
  );
}

/**
 * How one play went: the word first, then the amount.
 *
 * The badge carries the outcome in text, so the colour and the direction
 * glyph beside it are the second and third signals rather than the only one.
 * The amount keeps its sign in `Amount`'s own rendering — a loss reads as a
 * true minus — while the badge says which it is without the reader having to
 * find the sign.
 */
export function PlayOutcome({ netAmount }: { readonly netAmount: string }) {
  const result = resultOf(netAmount);
  if (result === 'even') {
    return (
      <span className="flex items-baseline justify-end gap-2">
        <Badge variant="outline">무승부</Badge>
        <Amount value={absAmount(netAmount)} />
      </span>
    );
  }
  return (
    <span className="flex items-baseline justify-end gap-2">
      <Badge variant={result === 'win' ? 'default' : 'outline'}>
        {result === 'win' ? '적중' : '빗나감'}
      </Badge>
      <Amount value={netAmount} direction={result === 'win' ? 'rise' : 'fall'} />
    </span>
  );
}
