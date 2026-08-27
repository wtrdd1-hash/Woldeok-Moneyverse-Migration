import { cn } from '@/lib/cn';
import { groupDigits } from '@/lib/money';

/**
 * One amount, in the ledger's figures.
 *
 * Tabular numerals are not decoration: a column of balances only reads as a
 * column when the digits share a width.
 */
export function Amount({
  value,
  className,
  direction,
  currency = false,
}: {
  readonly value: string;
  readonly className?: string;
  /** Korean market convention: rise is red, fall is blue. */
  readonly direction?: 'rise' | 'fall' | null;
  /** Appends the WLD mark, for a figure that stands alone. */
  readonly currency?: boolean;
}) {
  return (
    <span
      className={cn(
        'tabular',
        direction === 'rise' && 'text-rise',
        direction === 'fall' && 'text-fall',
        className,
      )}
    >
      {/* The glyph carries the direction too. Colour alone would leave the
          information out of reach for a red-green colour blind reader, and
          would be silent to a screen reader. */}
      {direction === 'rise' && <span aria-label="상승">▲ </span>}
      {direction === 'fall' && <span aria-label="하락">▼ </span>}
      {groupDigits(value)}
      {currency && <span className="ml-1 text-[0.75em] text-muted-foreground">WLD</span>}
    </span>
  );
}
