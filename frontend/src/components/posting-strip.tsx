import { cn } from '@/lib/cn';

/**
 * The posting strip.
 *
 * `economy_post_transaction` refuses to commit unless debits equal credits.
 * That rule is the product, so it is what the interface shows: every movement
 * of money renders as a debit side, a hairline, and a credit side, rather than
 * as a list row with a coloured badge.
 *
 * The hairline is drawn from both ends toward the middle when a transaction
 * lands. It is the only animation in the application, and `prefers-reduced-
 * motion` shows the settled state instead.
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
  /** Draws the hairline inward once, for a movement that just happened. */
  readonly settling?: boolean;
  readonly className?: string;
}

function formatAmount(amount: string): string {
  // Grouping is applied to the string, not via Number: an amount can carry 38
  // digits and converting it to a number would silently round it.
  const negative = amount.startsWith('-');
  const digits = negative ? amount.slice(1) : amount;
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return negative ? `−${grouped}` : grouped;
}

export function PostingStrip({
  debit,
  credit,
  amount,
  label,
  at,
  settling = false,
  className,
}: PostingStripProps) {
  return (
    <article
      className={cn('grid gap-1 border-b border-[var(--border)] py-3 last:border-b-0', className)}
    >
      {(label || at) && (
        <div className="flex items-baseline justify-between text-xs text-[var(--muted)]">
          {label && <span>{label}</span>}
          {at && <time dateTime={at}>{at}</time>}
        </div>
      )}

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <span className="truncate text-sm" title={debit}>
          {debit}
        </span>

        <span className="flex items-center gap-2">
          <Hairline settling={settling} side="left" />
          <span className="tabular text-base font-medium text-[var(--foreground)]">
            {formatAmount(amount)}
          </span>
          <Hairline settling={settling} side="right" />
        </span>

        <span className="truncate text-right text-sm" title={credit}>
          {credit}
        </span>
      </div>
    </article>
  );
}

function Hairline({ settling, side }: { settling: boolean; side: 'left' | 'right' }) {
  return (
    <span
      aria-hidden
      className={cn(
        'block h-px w-6 bg-[var(--border)] sm:w-10',
        settling && (side === 'left' ? 'animate-[draw-in_320ms_ease-out]' : 'animate-[draw-in_320ms_ease-out_60ms_backwards]'),
      )}
    />
  );
}

/**
 * A single amount where a full strip would be noise — a balance, a price.
 * Same typography, so the numbers still line up column to column.
 */
export function Amount({
  value,
  className,
  direction,
}: {
  readonly value: string;
  readonly className?: string;
  /** Korean market convention: rise is red, fall is blue. */
  readonly direction?: 'rise' | 'fall' | null;
}) {
  return (
    <span
      className={cn(
        'tabular',
        direction === 'rise' && 'text-[var(--color-rise)]',
        direction === 'fall' && 'text-[var(--color-fall)]',
        className,
      )}
    >
      {/* The glyph carries the direction too. Colour alone would leave the
          information out of reach for a red-green colour blind reader, and
          would be silent to a screen reader. */}
      {direction === 'rise' && <span aria-label="상승">▲ </span>}
      {direction === 'fall' && <span aria-label="하락">▼ </span>}
      {formatAmount(value)}
    </span>
  );
}
