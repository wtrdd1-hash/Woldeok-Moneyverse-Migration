export function parseMembershipOffset(raw: string | undefined): number {
  if (!raw || !/^(0|[1-9]\d{0,6})$/.test(raw)) return 0;
  const value = Number(raw);
  return value <= 1_000_000 ? value : 0;
}

export function clubMembershipPageHref(offset: number, search: string): string {
  const params = new URLSearchParams({ myOffset: String(offset) });
  if (search) params.set('search', search);
  return `/clubs?${params.toString()}`;
}

export function formatClubExperience(value: string): string {
  if (!/^(0|[1-9]\d{0,37})$/.test(value)) return '—';
  return BigInt(value).toLocaleString('ko-KR');
}
