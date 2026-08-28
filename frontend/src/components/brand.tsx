import Link from 'next/link';
import { cn } from '@/lib/cn';

/**
 * The wordmark, carried across unchanged.
 *
 * The glyph is a ledger cup with a stroked "M" inside it — the same two paths
 * the original served, so the product is recognisable at a glance to anyone
 * who has used it before.
 */
export function Brand({
  className,
  tone = 'default',
}: {
  readonly className?: string;
  readonly tone?: 'default' | 'muted';
}) {
  return (
    <Link
      href="/"
      aria-label="월덕 머니버스 홈"
      className={cn(
        'inline-flex items-center gap-2.5 text-[19px] font-extrabold tracking-[-0.045em]',
        tone === 'muted' ? 'text-foreground' : 'text-foreground',
        className,
      )}
    >
      <svg viewBox="0 0 40 40" aria-hidden className="w-[35px] shrink-0">
        <path d="M8 7h24v17c0 6.6-5.4 12-12 12S8 30.6 8 24V7Z" className="fill-primary" />
        <path
          d="m13 15 4.3 9.3L20 18l2.7 6.3L27 15"
          className="fill-none stroke-surface"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>
        월덕 <strong className="text-clay">머니버스</strong>
      </span>
    </Link>
  );
}
