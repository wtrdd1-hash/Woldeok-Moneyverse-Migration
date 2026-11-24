export function PageHeader({
  eyebrow,
  title,
  action,
  children,
}: {
  readonly eyebrow?: string;
  readonly title: React.ReactNode;
  readonly action?: React.ReactNode;
  readonly children?: React.ReactNode;
}) {
  return (
    <header className="grid w-full max-w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-2 sm:gap-3 border-b border-[var(--g1-line)] pb-4 sm:pb-6 overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 min-w-0">
        <div className="min-w-0 space-y-1.5">
          {/* `eyebrow` stays in the API for callers, but G1 does not draw
              tracked-caps labels above headings (owner design review
              2026-11-24); the title alone names the page. */}
          <h1 className="max-w-full min-w-0 text-[clamp(1.6rem,2.8vw,2.4rem)] leading-[1.2] break-words text-[var(--g1-ink)]">
            {title}
          </h1>
        </div>
        {action && <div className="shrink-0 pt-1">{action}</div>}
      </div>
      {children && (
        <div className="min-w-0 max-w-3xl text-xs sm:text-sm leading-relaxed sm:leading-7 text-muted-foreground [overflow-wrap:anywhere] [word-break:keep-all]">
          {children}
        </div>
      )}
    </header>
  );
}

/**
 * Kept so existing titles still compile. It no longer recolours part of a
 * heading: one tinted phrase inside a title read as decoration, not meaning.
 */
export function Accent({ children }: { readonly children: React.ReactNode }) {
  return <em className="not-italic">{children}</em>;
}

export function SectionHeader({
  eyebrow,
  title,
  id,
  action,
}: {
  readonly eyebrow: string;
  readonly title: React.ReactNode;
  readonly id?: string;
  readonly action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-3">
      <div className="grid gap-2" data-section={eyebrow}>
        <h2 id={id} className="text-xl leading-tight text-[var(--g1-ink)] sm:text-2xl">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}
