export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  readonly eyebrow?: string;
  readonly title: React.ReactNode;
  readonly children?: React.ReactNode;
}) {
  return (
    <header className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3 border-b border-border pb-5 sm:pb-7">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="max-w-[22ch] text-[clamp(1.85rem,3.8vw,3.2rem)] font-black leading-[1.04] tracking-[-0.045em]">
        {title}
      </h1>
      {children && (
        <div className="min-w-0 max-w-3xl text-sm leading-7 text-muted-foreground [overflow-wrap:anywhere] [word-break:keep-all] sm:text-base">
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
