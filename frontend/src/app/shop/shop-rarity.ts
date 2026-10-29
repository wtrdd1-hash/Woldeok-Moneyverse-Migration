/** Mirrors the database rarity CHECK in migration 114. Never accept free-form rarity as SQL. */
export const SHOP_RARITIES = [
  { value: 'common', label: '일반' },
  { value: 'uncommon', label: '고급' },
  { value: 'rare', label: '희귀' },
  { value: 'epic', label: '영웅' },
  { value: 'legendary', label: '전설' },
  { value: 'mythic', label: '신화' },
] as const;

/** Preserve even invalid URL filters so the backend can reject, not silently broaden, them. */
export function shopFilterQuery({ q, rarity }: { readonly q?: string; readonly rarity?: string }): string {
  const params = new URLSearchParams();
  if (q?.trim()) params.set('q', q.trim());
  if (rarity) params.set('rarity', rarity);
  const query = params.toString();
  return query ? `?${query}` : '';
}

/** Unknown catalog state must not be mistaken for a confirmed non-member. */
export function vipMembershipFromCatalog(
  items: readonly { readonly code: string; readonly user_owned_quantity: number }[] | null,
): boolean | null {
  if (items === null) return null;
  const vipPass = items.find((item) =>
    item.code === 'item_vip_lounge_pass' || item.code.includes('vip_lounge'),
  );
  return Boolean(vipPass && vipPass.user_owned_quantity > 0);
}
