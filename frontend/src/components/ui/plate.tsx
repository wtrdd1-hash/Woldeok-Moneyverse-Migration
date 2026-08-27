import { cn } from '@/lib/cn';

/**
 * The surface everything sits on. A page is a stack of plates, the way a
 * ledger is a stack of pages — one visual device, used consistently, instead
 * of a different card treatment per section.
 */
export function Plate({
  children,
  className,
  as: Component = 'section',
}: {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly as?: 'section' | 'article' | 'div';
}) {
  return (
    <Component
      className={cn(
        'rounded-[var(--radius-plate)] border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5',
        className,
      )}
    >
      {children}
    </Component>
  );
}

export function PlateTitle({
  children,
  hint,
}: {
  readonly children: React.ReactNode;
  readonly hint?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="text-base font-medium">{children}</h2>
      {hint && <span className="text-xs text-[var(--muted)]">{hint}</span>}
    </div>
  );
}

/**
 * Never invents a healthy state. When the source is offline the original said
 * so plainly rather than rendering a zero, and this keeps that: an empty
 * ledger and an unreachable one are different facts.
 */
export function Unavailable({ children }: { readonly children: React.ReactNode }) {
  return (
    <p className="rounded-[var(--radius-plate)] border border-dashed border-[var(--border)] px-3 py-6 text-center text-sm text-[var(--muted)]">
      {children}
    </p>
  );
}
