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
    <header className="grid w-full max-w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-2 sm:gap-3 border-b border-border pb-4 sm:pb-7 overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 min-w-0">
        <div className="min-w-0 space-y-1.5">
          {eyebrow && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-mono text-[10px] font-bold uppercase tracking-wider shrink-0">
              <span className="size-1 rounded-full bg-primary animate-pulse" />
              <span className="truncate">{eyebrow}</span>
            </span>
          )}
          <h1 className="max-w-full min-w-0 text-[clamp(1.35rem,3.2vw,2.75rem)] font-black leading-[1.15] tracking-[-0.04em] break-words">
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

export function Accent({ children }: { readonly children: React.ReactNode }) {
  return <em className="not-italic font-black text-primary">{children}</em>;
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
      <div className="grid gap-2">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id} className="text-xl font-extrabold leading-tight sm:text-2xl">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}
