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

/**
 * The head of a section inside a page: the same mono eyebrow, a serif h2, and
 * an optional link out to where the section continues.
 *
 * It exists because six pages had hand-rolled this and drifted into a second
 * eyebrow style -- grey sans, no leading rule -- sitting a few hundred pixels
 * below the real one. There is one eyebrow in this product.
 *
 * The h2 carries no font-weight of its own on purpose: `globals.css` already
 * sets the display face at 800 for every heading, and the hand-rolled copies
 * were overriding it back down to 500.
 */
export function SectionHeader({
  eyebrow,
  title,
  id,
  action,
}: {
  readonly eyebrow: string;
  readonly title: React.ReactNode;
  /** Pair with `aria-labelledby` on the section this heads. */
  readonly id?: string;
  /** A link out, shown at the far end of the row. */
  readonly action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="eyebrow mb-2">{eyebrow}</p>
        <h2 id={id} className="text-lg">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}
