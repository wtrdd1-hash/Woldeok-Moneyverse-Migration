import { AlertTriangle, Ban, Clock, Inbox, PlugZap } from 'lucide-react';

/**
 * DESIGN180 shared primitives (PR #3443 `.stats`, `.state-box`), implemented
 * with the owner corrections: 8px radius, no invented values.
 */

export interface StatItem {
  readonly label: string;
  /** null means the source did not answer; rendered as 확인 불가, never 0. */
  readonly value: React.ReactNode | null;
  readonly note?: React.ReactNode | undefined;
  readonly tone?: 'rise' | 'fall' | 'ok' | undefined;
}

const TONE = { rise: 'text-[var(--g1-ember)]', fall: 'text-[var(--g1-rare-rare)]', ok: 'text-[var(--g1-mint)]' } as const;

export function StatRow({ items, label }: { readonly items: readonly StatItem[]; readonly label?: string }) {
  return (
    <ul
      aria-label={label}
      className="grid grid-cols-1 overflow-hidden rounded-lg border border-[var(--g1-line)] bg-[var(--g1-plum)] sm:grid-flow-col sm:auto-cols-fr"
    >
      {items.map((item) => (
        <li
          key={item.label}
          className="grid min-w-0 grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 border-t border-[var(--g1-line)] px-[18px] py-[15px] first:border-t-0 sm:block sm:border-l sm:border-t-0 sm:px-[22px] sm:py-5 sm:first:border-l-0"
        >
          <span className="text-xs text-[var(--g1-muted)] sm:mb-2 sm:block">{item.label}</span>
          <span
            className={`text-right text-[22px] font-semibold tabular-nums tracking-[-0.025em] [overflow-wrap:anywhere] sm:block sm:text-left sm:text-[25px] ${
              item.value === null ? 'text-base font-medium text-[var(--g1-faint)] sm:text-base' : item.tone ? TONE[item.tone] : 'text-[var(--g1-ink)]'
            }`}
          >
            {item.value === null ? '확인 불가' : item.value}
          </span>
          {item.note && <span className="col-span-2 text-[11px] text-[var(--g1-muted)] sm:mt-1.5 sm:block">{item.note}</span>}
        </li>
      ))}
    </ul>
  );
}

const STATE_ICON = { empty: Inbox, error: AlertTriangle, expired: Clock, forbidden: Ban, unavailable: PlugZap } as const;

export function StateBox({
  kind,
  title,
  children,
  action,
}: {
  readonly kind: keyof typeof STATE_ICON;
  readonly title: string;
  readonly children?: React.ReactNode;
  readonly action?: React.ReactNode;
}) {
  const Icon = STATE_ICON[kind];
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      className="mx-auto my-8 max-w-[650px] rounded-lg border border-[var(--g1-line)] bg-[var(--g1-plum)] px-5 py-8 text-center sm:px-9"
    >
      <Icon className="mx-auto size-6 text-[var(--g1-violet)]" aria-hidden />
      <p className="mt-4 text-lg font-bold text-[var(--g1-ink)]">{title}</p>
      {children && <div className="mx-auto mt-2 max-w-[430px] text-sm text-[var(--g1-muted)]">{children}</div>}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}
