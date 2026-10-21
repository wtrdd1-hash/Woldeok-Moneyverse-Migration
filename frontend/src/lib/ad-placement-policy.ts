/** Reviewed public-content ad inventory, not a license to advertise on financial actions. */
export function isEligiblePublicAdPath(pathname: string | null): boolean {
  if (!pathname) return false;
  const path = pathname.replace(/\/$/, '') || '/';
  if (path === '/' || /^\/(en|ja|zh)$/.test(path)) return true;
  const localized = path.replace(/^\/(en|ja|zh)(?=\/)/, '');
  return /^\/(tools|guide|blog)(\/|$)/.test(localized)
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
