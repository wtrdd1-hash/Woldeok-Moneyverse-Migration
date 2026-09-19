/**
 * The head of a page: the mono eyebrow with its leading rule, a serif title,
 * and one line saying what the page is for. Every original view opened this
 * way, and keeping it uniform is what makes eighteen screens read as one
 * application.
 *
 * The title tops out at 2.5rem rather than 3rem. That is the size `error.tsx`
 * was already using for the same job, so it is a register the product has
 * rather than a new one, and it puts an interior page below the home hero
 * instead of level with it. At line-height 1.2 the old ceiling cost 58px a
 * line and these titles are Korean sentences that run to two.
 *
 * The gap between the three parts is 8px rather than 16px because the lede
 * keeps `leading-[1.8]`: half of that leading sits above its first line and
 * does the separating already. The leading itself is not where space gets
 * saved here — Hangul has no descender rhythm to fall back on, and keep-all
 * makes these lines wrap early enough without crowding them vertically too.
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
    <header className="relative grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3 overflow-hidden rounded-[24px] border border-border/80 bg-card/55 px-5 py-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)] backdrop-blur-sm sm:px-7 sm:py-8">
      <div aria-hidden className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary via-primary/45 to-transparent" />
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="max-w-[18ch] text-[clamp(1.8rem,3.8vw,2.75rem)] leading-[1.12]">{title}</h1>
      {children && (
        <div className="min-w-0 max-w-2xl text-sm leading-[1.8] text-muted-foreground [overflow-wrap:anywhere] [word-break:keep-all] sm:text-base">
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
  return <em className="not-italic font-extrabold text-primary">{children}</em>;
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
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/70 pb-4">
      <div className="grid gap-2">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id} className="text-xl leading-tight sm:text-2xl">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}
