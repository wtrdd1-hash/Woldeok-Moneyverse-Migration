export function PageHeader({
  eyebrow: _eyebrow,
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
    <header className="mb-6 grid w-full max-w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-4 overflow-hidden sm:flex sm:items-start sm:justify-between sm:gap-6">
      {/* DESIGN180 page head: the page's single h1 with its lead underneath,
          page actions on the right. `eyebrow` stays in the API (91 callers)
          but is never drawn (owner direction: no eyebrow labels). */}
      <div className="min-w-0">
        <h1 className="max-w-full min-w-0 break-words text-[var(--g1-ink)]">{title}</h1>
        {children && (
          <div className="mt-2 min-w-0 max-w-[640px] text-sm leading-relaxed text-[var(--g1-muted)] [overflow-wrap:anywhere] [word-break:keep-all]">
            {children}
          </div>
        )}
      </div>
      {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
    </header>
  );
}

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
