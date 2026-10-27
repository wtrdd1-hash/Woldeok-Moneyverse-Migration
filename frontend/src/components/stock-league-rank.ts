// A pending database rank is not first place and must not render as "0위".
export function formatStockLeagueRank(position: number): string {
  return Number.isSafeInteger(position) && position > 0 ? `${position}위` : '집계 중';
}

// A failed/unknown enrollment read must never enable a paid join action.
export function canOfferStockLeagueJoin(
  loaded: boolean,
  hasActiveSeason: boolean,
  alreadyEnrolled: boolean,
): boolean {
  return loaded && hasActiveSeason && !alreadyEnrolled;
}
