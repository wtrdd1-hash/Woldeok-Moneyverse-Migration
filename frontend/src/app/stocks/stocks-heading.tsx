'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

/** Sub-routes under /stocks that render their own page-level heading. */
const STATIC_CHILDREN = new Set(['alerts', 'community', 'compare', 'derivatives', 'history', 'portfolio']);

/**
 * The exchange title is the page's h1 everywhere except where the child page
 * names itself (a stock's detail page, the league); there it steps down to
 * plain text so each document keeps exactly one h1.
 */
export function StocksHeading({ className, children }: { readonly className: string; readonly children: ReactNode }) {
  const pathname = usePathname() ?? '/stocks';
  const child = pathname.replace(/^\/stocks\/?/, '').split('/')[0] ?? '';
  const childOwnsHeading = child === 'league' || (child !== '' && !STATIC_CHILDREN.has(child));
  return childOwnsHeading ? <p className={className}>{children}</p> : <h1 className={className}>{children}</h1>;
}
