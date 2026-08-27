/**
 * The head of a page: the mono eyebrow with its leading rule, a serif title,
 * and one line saying what the page is for. Every original view opened this
 * way, and keeping it uniform is what makes eighteen screens read as one
 * application.
 */
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
    <header className="grid gap-4 pb-2">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="text-[clamp(2rem,4vw,3rem)]">{title}</h1>
      {children && (
        <div className="max-w-prose leading-[1.8] text-muted-foreground [word-break:keep-all]">
          {children}
        </div>
      )}
    </header>
  );
}
