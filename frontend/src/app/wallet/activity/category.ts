/** Explicit allowlist; never reflect arbitrary search strings into a link or API request. */
export const ACTIVITY_CATEGORIES = [
  { value: 'all', label: '전체' },
  { value: 'rewards', label: '보상' },
  { value: 'transfers', label: '송금' },
  { value: 'banking', label: '은행' },
  { value: 'purchases', label: '구매' },
  { value: 'markets', label: '거래소' },
  { value: 'other', label: '기타' },
] as const;

export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number]['value'];

export function activityCategory(value: unknown): ActivityCategory {
  return typeof value === 'string' && ACTIVITY_CATEGORIES.some((item) => item.value === value)
    ? value as ActivityCategory
    : 'all';
}

export function activityCategoryHref(value: ActivityCategory): string {
  return value === 'all' ? '/wallet/activity' : `/wallet/activity?category=${value}`;
}
