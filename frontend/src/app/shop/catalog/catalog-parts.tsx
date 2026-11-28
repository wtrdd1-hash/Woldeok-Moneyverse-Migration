import { Amount } from '@/components/amount';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatDay } from '@/lib/money';
import {
  countLabel,
  effectLabel,
  hasUpkeep,
  holdingNote,
  owesUpkeep,
  purchaseLimitLabel,
  stockLabel,
  weeksLabel,
} from './catalog';
import type { CatalogItem, HeldItem } from './catalog';
import { pick } from '@/lib/copy';
import { fill } from '@/lib/copy-format';
import type { Locale } from '@/lib/locale';
import { COPY } from './copy';

/**
 * The two cards the catalogue is made of.
 *
 * Neither is a client component: they hold no state and take no event, so
 * they render on the server with the page. They live here rather than inside
 * `page.tsx` because a page cannot be rendered in a test -- that needs a live
 * API and a database -- while these can, and what a card claims about a
 * price, a stock level or a purchase limit is exactly what this feature is
 * most likely to get wrong.
 *
 * Each takes the control that acts on it as `children`, so the server half
 * and the client half meet in the page rather than here.
 */

/** A term and an amount, the row every card in this product states money in. */
function MoneyLine({ term, value }: { readonly term: string; readonly value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-muted-foreground">{term}</span>
      <Amount value={value} currency />
    </div>
  );
}

/** The same row for something that is not money -- a count, a date. */
function FactLine({ term, value }: { readonly term: string; readonly value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-muted-foreground">{term}</span>
      <span className="tabular">{value}</span>
    </div>
  );
}

/**
 * One line of the catalogue.
 *
 * `held` is how many the member owns right now, which the page knows because
 * it reads both models in one round. It is shown rather than used to hide the
 * item: owning three energy drinks is not a reason to stop offering a fourth,
 * and the one case where it *is* an answer -- a single-hold item already
 * held -- is decided by the page and arrives as `children`.
 */
export function CatalogCard({
  item,
  held = 0,
  locale = 'ko',
  children,
}: {
  readonly item: CatalogItem;
  readonly held?: number;
  /** The reader's locale; Korean when omitted, as with `formatDay`. The page always passes it. */
  readonly locale?: Locale;
  readonly children?: React.ReactNode;
}) {
  const stock = stockLabel(item.quantity, locale);
  const limit = purchaseLimitLabel(item.purchase_limit, locale);

  return (
    <Card className="justify-between gap-4">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="font-mono">
            {item.code}
          </Badge>
          <Badge variant="outline" className="font-normal">
            {effectLabel(item.effect_kind, locale)}
          </Badge>
          {held > 0 && (
            <Badge variant="outline" className="font-normal">
              {pick(locale, fill(COPY.heldBadge, { count: countLabel(held, locale) }))}
            </Badge>
          )}
        </div>
        <CardTitle className="text-base">{item.name}</CardTitle>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>

      <CardContent className="grid gap-1 text-sm">
        <MoneyLine term={pick(locale, COPY.price)} value={item.price} />
        {/* Shown because a member choosing between a scooter and a van should
            see what each costs every week before buying either. Since 104 it
            is a charge and not a note: the weekly job takes it every Monday,
            and the section above says what happens when it cannot be paid. */}
        {hasUpkeep(item.maintenance_cost) && (
          <MoneyLine term={pick(locale, COPY.weeklyUpkeep)} value={item.maintenance_cost} />
        )}
        {stock !== null && <FactLine term={pick(locale, COPY.stock)} value={stock} />}
        {item.sale_ends_at !== null && (
          <FactLine term={pick(locale, COPY.saleEnds)} value={formatDay(item.sale_ends_at, pick(locale, COPY.checking), locale)} />
        )}
        {limit !== null && <p className="pt-1 text-xs text-muted-foreground">{limit}</p>}
      </CardContent>

      {children && <CardFooter>{children}</CardFooter>}
    </Card>
  );
}

/**
 * One item the member holds.
 *
 * No price. `shop_my_items` does not send one and the paid amount lives on
 * the purchase receipt, so a figure here would either be the current list
 * price dressed up as what they paid or a number nobody sent.
 */
export function HoldingCard({
  item,
  locale = 'ko',
  children,
}: {
  readonly item: HeldItem;
  /** The reader's locale; Korean when omitted, as with `formatDay`. The page always passes it. */
  readonly locale?: Locale;
  readonly children?: React.ReactNode;
}) {
  // Every refusal 104 would make, decided once. A non-null note means the
  // control could only be answered with a conflict, so it is not drawn.
  const note = holdingNote(item, locale);

  return (
    <Card className="justify-between gap-4">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="font-mono">
            {item.code}
          </Badge>
          <Badge variant="outline" className="font-normal">
            {effectLabel(item.effect_kind, locale)}
          </Badge>
          {/* States the debt, not a consequence. The arrears are real -- the
              weekly job charged them and stopped at the cap -- but nothing is
              actually withheld yet, because 104 leaves item effects without a
              mechanical consequence and says so. A badge reading 정지 would
              claim a lock this build does not keep, which is what 101's
              `enforced` flag exists to avoid on the ladder. When an effect
              starts changing what work or 정산 pays, this becomes 정지. */}
          {item.suspended && <Badge variant="destructive">{pick(locale, fill(COPY.suspendedBadge, { weeks: item.unpaid_weeks }))}</Badge>}
          {item.effect_expires_at !== null && (
            <Badge variant="outline" className="font-normal">
              {pick(locale, COPY.effectActive)}
            </Badge>
          )}
        </div>
        <CardTitle className="text-base">{item.name}</CardTitle>
        <CardDescription>
          {pick(locale, fill(COPY.acquiredOn, { date: formatDay(item.acquired_at, pick(locale, COPY.acquiredChecking), locale) }))}
          {item.expires_at !== null && pick(locale, fill(COPY.expiresUntil, { date: formatDay(item.expires_at, pick(locale, COPY.checking), locale) }))}
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-1 text-sm">
        <FactLine term={pick(locale, COPY.quantityHeld)} value={countLabel(item.quantity, locale)} />
        {hasUpkeep(item.weekly_cost) && <MoneyLine term={pick(locale, COPY.weeklyUpkeep)} value={item.weekly_cost} />}
        {/* The debt and how long it has run, together. A figure on its own
            cannot be told apart from one week of an expensive lease and four
            of a cheap one, and only the second is about to be suspended. */}
        {owesUpkeep(item) && (
          <>
            <MoneyLine term={pick(locale, COPY.arrears)} value={item.arrears_due} />
            <FactLine term={pick(locale, COPY.unpaidPeriod)} value={weeksLabel(item.unpaid_weeks, locale)} />
          </>
        )}
        {item.effect_expires_at !== null && (
          <FactLine term={pick(locale, COPY.effectEnds)} value={formatDay(item.effect_expires_at, pick(locale, COPY.checking), locale)} />
        )}
      </CardContent>

      <CardFooter>
        {note === null ? children : <p className="text-sm text-muted-foreground">{note}</p>}
      </CardFooter>
    </Card>
  );
}
