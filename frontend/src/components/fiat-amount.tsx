'use client';

import { useCurrency } from './currency-context';
import { useLocale } from './locale-provider';
import { formatFiatFromWld } from '@/lib/currency';
import { groupDigits } from '@/lib/money';

interface FiatAmountProps {
  readonly amount: unknown;
  readonly showWld?: boolean;
  readonly className?: string;
  readonly fiatClassName?: string;
}

/**
 * High-craftsmanship Fintech Fiat & WLD Dual-Currency Component.
 * Displays authoritative WLD integer alongside localized real-time Fiat conversion.
 */
export function FiatAmount({
  amount,
  showWld = true,
  className = '',
  fiatClassName = 'text-xs text-muted-foreground font-mono font-medium',
}: FiatAmountProps) {
  const { currency } = useCurrency();
  const { locale } = useLocale();

  const wldFormatted = groupDigits(amount);
  const fiatFormatted = formatFiatFromWld(amount, currency, locale);

  return (
    <span className={`inline-flex items-baseline gap-1.5 flex-wrap ${className}`}>
      {showWld && (
        <span className="font-mono font-bold tracking-tight text-foreground">
          {wldFormatted} <span className="text-xs font-semibold text-amber-500">WLD</span>
        </span>
      )}
      {currency !== 'KRW' && fiatFormatted !== '—' && (
        <span className={fiatClassName}>
          (≈ {fiatFormatted})
        </span>
      )}
    </span>
  );
}

/**
 * Compact Fiat Badge Component for cards, lists, and tables.
 */
export function FiatBadge({
  amount,
  className = '',
}: {
  readonly amount: unknown;
  readonly className?: string;
}) {
  const { currency } = useCurrency();
  const { locale } = useLocale();

  if (currency === 'KRW') return null;

  const fiatFormatted = formatFiatFromWld(amount, currency, locale);

  if (fiatFormatted === '—') return null;

  return (
    <span
      className={`inline-flex items-center rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground border border-border/40 ${className}`}
    >
      ≈ {fiatFormatted}
    </span>
  );
}
