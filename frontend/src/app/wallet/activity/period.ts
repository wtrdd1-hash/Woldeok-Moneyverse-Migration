/** Only the three server-supported, read-only owner-ledger windows are linkable. */
export type ActivityPeriod = 'all' | '7d' | '30d';

export function activityPeriod(value: string | undefined): ActivityPeriod {
  return value === '7d' || value === '30d' ? value : 'all';
}

export type ActivityDirection = 'all' | 'in' | 'out' | 'neutral';

export function activityDirection(value: string | undefined): ActivityDirection {
  return value === 'in' || value === 'out' || value === 'neutral' ? value : 'all';
}

/** Build only canonical allow-listed query parameters; never echo raw URL input. */
export function activityPeriodUrl(period: ActivityPeriod, direction: ActivityDirection = 'all'): string {
  const params = new URLSearchParams();
  if (period !== 'all') params.set('period', period);
  if (direction !== 'all') params.set('direction', direction);
  const query = params.toString();
  return query ? `/wallet/activity?${query}` : '/wallet/activity';
}

/** Only a server-proven lookahead can certify whether the bounded list is complete. */
export function activityCompletenessNotice(hasMore: boolean | undefined): string | null {
  if (hasMore === true) return '선택한 기간의 기록이 50건을 초과하여 최신 50건만 표시합니다. 이전 기록은 이 화면에서 조회할 수 없습니다.';
  if (hasMore === false) return null;
  return '기록이 모두 표시되었는지 확인할 수 없습니다. 잠시 후 다시 확인하세요.';
}

/** Opaque cursor never becomes an unescaped URL fragment. */
export function activityCursorUrl(period: ActivityPeriod, cursor: string | null, direction: ActivityDirection = 'all'): string {
  const params = new URLSearchParams();
  if (period !== 'all') params.set('period', period);
  if (direction !== 'all') params.set('direction', direction);
  if (cursor) params.set('cursor', cursor);
  const query = params.toString();
  return `/wallet/activity${query ? `?${query}` : ''}`;
}
