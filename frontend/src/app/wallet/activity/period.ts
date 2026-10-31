/** Only the three server-supported, read-only owner-ledger windows are linkable. */
export type ActivityPeriod = 'all' | '7d' | '30d';

export function activityPeriod(value: string | undefined): ActivityPeriod {
  return value === '7d' || value === '30d' ? value : 'all';
}

export type ActivityDirection = 'all' | 'in' | 'out' | 'neutral';

export function activityDirection(value: string | undefined): ActivityDirection {
  return value === 'in' || value === 'out' || value === 'neutral' ? value : 'all';
}

/** Reject duplicate, fractional, exponent, negative and unsafe amount inputs without coercion. */
export function activityMinAmount(value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || !/^[1-9][0-9]{0,29}$/.test(value)) throw new Error('최소 금액은 1~30자리의 양의 WLD 정수여야 합니다.');
  return value;
}

export interface ActivityCalendarRange { readonly from: string; readonly to: string }

/** Validate KST calendar bounds before rendering or constructing any owner-private URL. */
export function activityCalendarRange(from: unknown, to: unknown, now: Date = new Date()): ActivityCalendarRange | null {
  if (from === undefined && to === undefined) return null;
  const parse = (value: unknown): { text: string; utc: number } => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('날짜는 YYYY-MM-DD 형식이어야 합니다.');
    const utc = Date.parse(`${value}T00:00:00.000Z`);
    if (!Number.isFinite(utc) || Number(value.slice(0, 4)) < 1 || new Date(utc).toISOString().slice(0, 10) !== value) throw new Error('유효하지 않은 날짜입니다.');
    return { text: value, utc };
  };
  const start = parse(from);
  const end = parse(to);
  const days = Math.round((end.utc - start.utc) / 86_400_000) + 1;
  const todayKst = new Date(now.getTime() + 9 * 3_600_000).toISOString().slice(0, 10);
  if (days < 1 || days > 366 || end.text > todayKst) throw new Error('날짜 범위는 1~366일이며 미래 날짜를 포함할 수 없습니다.');
  return { from: start.text, to: end.text };
}

/** Build only canonical allow-listed query parameters; never echo raw URL input. */
export function activityPeriodUrl(period: ActivityPeriod, direction: ActivityDirection = 'all', range?: ActivityCalendarRange | null, minAmount?: string | null): string {
  const params = new URLSearchParams();
  if (!range && period !== 'all') params.set('period', period);
  if (direction !== 'all') params.set('direction', direction);
  if (range) { params.set('from', range.from); params.set('to', range.to); }
  if (minAmount) params.set('minAmount', minAmount);
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
export function activityCursorUrl(period: ActivityPeriod, cursor: string | null, direction: ActivityDirection = 'all', range?: ActivityCalendarRange | null, minAmount?: string | null): string {
  const params = new URLSearchParams();
  if (!range && period !== 'all') params.set('period', period);
  if (direction !== 'all') params.set('direction', direction);
  if (range) { params.set('from', range.from); params.set('to', range.to); }
  if (minAmount) params.set('minAmount', minAmount);
  if (cursor) params.set('cursor', cursor);
  const query = params.toString();
  return `/wallet/activity${query ? `?${query}` : ''}`;
}
