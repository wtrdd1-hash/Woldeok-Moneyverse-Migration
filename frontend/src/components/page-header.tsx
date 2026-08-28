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

/**
 * The second line of a two-line title, in the accent green.
 *
 * The product's signature heading treatment: a Korean sentence broken across
 * two lines with the second one carrying the colour. The original used it on
 * the home hero and on every content page whose title was a sentence rather
 * than a noun, and it is most of what makes those pages read as one product.
 *
 * `not-italic` because this is `<em>` for emphasis, not for italics — the
 * display face has no italic and a synthesised one would be wrong.
 */
export function Accent({ children }: { readonly children: React.ReactNode }) {
  return <em className="not-italic text-forest-soft">{children}</em>;
}
