'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/components/locale-provider';
import { pick } from '@/lib/copy';
import { COPY } from './copy';

/**
 * The search form and principle badges of `/shop`. They live in a client component only because
 * their placeholders and accessible names are attributes, and the page may not read the request
 * locale on the server without opting out of static rendering.
 */
export function ShopSearchForm({
  query,
  capValue,
  capInvalid,
}: {
  readonly query: string;
  readonly capValue: string;
  readonly capInvalid: boolean;
}) {
  const { locale } = useLocale();
  return (
    <form
      action="/shop"
      method="get"
      className="flex min-w-0 w-full max-w-2xl gap-2 flex-wrap"
      role="search"
    >
      <input
        type="search"
        name="q"
        defaultValue={query}
        placeholder={pick(locale, COPY.searchPlaceholder)}
        aria-label={pick(locale, COPY.searchLabel)}
        className="min-w-0 flex-1 rounded-xl border border-border bg-card px-4 py-2 text-base outline-none focus:border-amber-500 md:text-sm"
      />
      <label className="flex min-w-0 items-center gap-2 text-sm">
        <span className="whitespace-nowrap">{pick(locale, COPY.upkeepCapLabel)}</span>
        <input
          type="text"
          name="maxUpkeep"
          defaultValue={capValue}
          inputMode="numeric"
          pattern="(0|[1-9][0-9]*)"
          maxLength={30}
          placeholder={pick(locale, COPY.upkeepCapPlaceholder)}
          aria-invalid={capInvalid}
          aria-describedby={capInvalid ? 'shop-upkeep-error' : undefined}
          className="w-32 min-h-[44px] min-w-0 rounded-xl border border-border bg-card px-3 py-2 text-base tabular-nums md:text-sm"
        />
      </label>
      <Button type="submit" className="min-h-[44px] px-5">
        {pick(locale, COPY.search)}
      </Button>
      {query || capValue || capInvalid ? (
        <Button asChild type="button" variant="outline" className="min-h-[44px]">
          <Link href="/shop">{pick(locale, COPY.reset)}</Link>
        </Button>
      ) : null}
    </form>
  );
}

const PRINCIPLES = [COPY.principleVerified, COPY.principleFitting, COPY.principleSink, COPY.principleNoCash];

export function ShopPrinciples() {
  const { locale } = useLocale();
  return (
    <ul aria-label={pick(locale, COPY.principlesLabel)} className="flex flex-wrap gap-2">
      {PRINCIPLES.map((principle) => (
        <li key={principle.ko}>
          <Badge variant="outline" className="font-normal border-amber-500/30 text-xs">
            {pick(locale, principle)}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
