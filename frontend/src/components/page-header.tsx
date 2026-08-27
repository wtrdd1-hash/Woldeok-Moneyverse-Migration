/**
 * The head of a page: a small caps eyebrow, the title, and one line that says
 * what the page is for. Every original view opened this way and keeping it
 * uniform is what makes eleven screens read as one application.
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
    <header className="grid gap-2 pt-2">
      {eyebrow && (
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {eyebrow}
        </p>
      )}
      <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
      {children && <div className="max-w-prose text-sm text-muted-foreground">{children}</div>}
    </header>
  );
}
