/** Content-only advertising: never target financial decisions, balances, portfolios or authentication. */
export function isEligiblePublicAdPath(pathname: string | null): boolean {
  if (!pathname) return false;
  const path = pathname.replace(/\/$/, '') || '/';
  if (path === '/' || /^\/(en|ko|ja|zh|vi)$/.test(path)) return true;
  const localized = path.replace(/^\/(en|ko|ja|zh|vi)(?=\/)/, '');
  return /^\/(tools|calculators|guide|blog)(\/|$)/.test(localized)
    || /^\/(gallery|announcements|roadmap)$/.test(localized);
}

/** Article block count measures meaningful content spacing, not ad inventory alone. */
export function getBlogAdPlan(blockCount: number): {
  readonly showTop: boolean;
  readonly inlineAfter: readonly number[];
  readonly showBottom: boolean;
} {
  const count = Math.max(0, Math.floor(Number.isFinite(blockCount) ? blockCount : 0));
  return {
    showTop: count >= 8,
    inlineAfter: count >= 22 ? [6, 15] : count >= 12 ? [6] : [],
    showBottom: count >= 3,
  };
}


/** Real ad disclosure, never a synthetic filled creative or gameplay CTA. */
export function publicAdDisclosure(pathname: string | null): string {
  const locale = pathname?.match(/^\/(en|ko|ja|zh|vi)(?:\/|$)/)?.[1] || 'en';
  const labels: Record<string, string> = {
    en: 'Advertisement',
    ko: '광고',
    ja: '広告',
    zh: '广告',
    vi: 'Quảng cáo',
  };
  return labels[locale] ?? 'Advertisement';
}
