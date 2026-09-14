export interface ShopDeadlineItem {
  readonly catalog_id: string;
  readonly name: string;
  readonly category: string;
  readonly price: string;
  readonly sale_ends_at: string | null;
}

export function upcomingShopDeadlines(
  items: readonly ShopDeadlineItem[],
  limit = 6,
): readonly ShopDeadlineItem[] {
  return items
    .filter((item) => item.sale_ends_at !== null && Number.isFinite(Date.parse(item.sale_ends_at)))
    .sort((left, right) => Date.parse(left.sale_ends_at!) - Date.parse(right.sale_ends_at!))
    .slice(0, Math.max(0, limit));
}
