import { cn } from '@/lib/cn';
import { Amount } from './amount';

/**
 * The posting strip — this product's signature element.
 *
 * `economy_post_transaction` refuses to commit unless debits equal credits.
 * That rule *is* the product, so it is what the interface shows: every
 * movement of money renders as a debit side, a hairline, and a credit side,
 * rather than as a list row with a coloured badge.
 *
 * Deliberately not built from a registry primitive. shadcn gives this
 * application its buttons, dialogs and tables, and nothing in that registry
 * describes a balanced entry; inventing it out of an Item would cost the
 * layout the thing that makes it legible, which is that the amount sits
 * exactly between the two accounts it balances.
 */

export interface PostingStripProps {
  /** What the money left. */
  readonly debit: string;
  /** What the money reached. */
  readonly credit: string;
  /** Canonical integer string. Never a number — 38 digits do not survive one. */
  readonly amount: string;
  readonly label?: string;
  readonly at?: string;
  readonly className?: string;
}

export function PostingStrip({ debit, credit, amount, label, at, className }: PostingStripProps) {
  return (
    <article className={cn('grid gap-1 border-b py-3 last:border-b-0 min-w-0 max-w-full overflow-hidden', className)}>
      {(label || at) && (
        <div className="flex items-baseline justify-between gap-2 text-xs text-muted-foreground min-w-0">
          {label && <span className="truncate min-w-0 flex-1">{label}</span>}
          {at && <span className="shrink-0 text-[11px] tabular">{at}</span>}
        </div>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5 sm:gap-3 min-w-0">
        <span className="truncate text-xs sm:text-sm font-medium" title={debit}>
          {debit}
        </span>

        <span className="flex items-center gap-1 sm:gap-2 shrink-0">
          <Hairline />
          <Amount value={amount} className="text-xs sm:text-base font-bold tabular-nums" />
          <Hairline />
        </span>

        <span className="truncate text-right text-xs sm:text-sm font-medium" title={credit}>
          {credit}
        </span>
      </div>
    </article>
  );
}

function Hairline() {
  return <span aria-hidden className="block h-px w-2 sm:w-8 bg-border shrink-0" />;
}
