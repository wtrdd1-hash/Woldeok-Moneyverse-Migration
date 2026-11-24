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
    <header className="grid w-full max-w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-1 overflow-hidden">
      {/* G2 page head (approved G2 previews): the page's single h1, one line
          of context and the page action. No banner art: figures and tables
          carry the page. `eyebrow` stays in the API but is not drawn. */}
      <div className="flex flex-wrap items-end justify-between gap-3 min-w-0">
        <h1 className="max-w-full min-w-0 break-words text-[var(--g1-ink)]">{title}</h1>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children && (
        <div className="min-w-0 max-w-[68ch] text-sm leading-relaxed text-[var(--g1-muted)] [overflow-wrap:anywhere] [word-break:keep-all]">
          {children}
        </div>
      )}
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
