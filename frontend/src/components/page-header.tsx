import { RouteSceneArt } from '@/components/g1/route-scene-art';

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
    <header className="g1-chamfer relative isolate grid w-full max-w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-3 overflow-hidden border border-[var(--g1-gold-deep)] bg-[var(--g1-plum)] p-5 sm:p-7">
      {/* G1 banner (approved 2026-11-24): the page's single h1, its lead and
          action, with the route's decorative scene on wide screens only. */}
      <RouteSceneArt className="pointer-events-none absolute bottom-0 right-0 -z-10 hidden h-full w-[45%] opacity-60 lg:block" />
      <div className="flex flex-wrap items-start justify-between gap-3 min-w-0">
        <div className="min-w-0 lg:max-w-[60%]">
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
        <div className="min-w-0 max-w-3xl text-sm leading-relaxed text-[var(--g1-muted)] [overflow-wrap:anywhere] [word-break:keep-all] lg:max-w-[58%]">
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
