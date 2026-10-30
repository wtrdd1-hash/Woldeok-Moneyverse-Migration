/** Private shop receipts: sums refer only to the rows in this response. */
export interface ShopPurchaseReceiptView {
  readonly purchaseId: string;
  readonly itemName: string;
  readonly amount: string;
  readonly purchasedAt: string;
}

export interface ShopPurchaseHistory {
  readonly purchases: readonly ShopPurchaseReceiptView[];
  readonly summary: {
    readonly count: number;
    readonly totalSpent: string;
    readonly scope: 'displayed';
  };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const POSITIVE_WLD = /^[1-9][0-9]{0,37}$/;
const NONNEGATIVE_WLD = /^(?:0|[1-9][0-9]*)$/;

export function parseShopPurchaseHistory(value: unknown): ShopPurchaseHistory | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const payload = value as Record<string, unknown>;
  if (!Array.isArray(payload.purchases) || payload.purchases.length > 100) return null;
  const summary = payload.summary;
  if (!summary || typeof summary !== 'object' || Array.isArray(summary)) return null;
  const fields = summary as Record<string, unknown>;
  if (
    fields.scope !== 'displayed' ||
    !Number.isSafeInteger(fields.count) ||
    fields.count !== payload.purchases.length ||
    typeof fields.totalSpent !== 'string' ||
    !NONNEGATIVE_WLD.test(fields.totalSpent)
  )
    return null;
  const purchases: ShopPurchaseReceiptView[] = [];
  const seen = new Set<string>();
  let sum = 0n;
  for (const row of payload.purchases as unknown[]) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return null;
    const receipt = row as Record<string, unknown>;
    if (
      typeof receipt.purchaseId !== 'string' ||
      !UUID.test(receipt.purchaseId) ||
      seen.has(receipt.purchaseId) ||
      typeof receipt.itemName !== 'string' ||
      !receipt.itemName.trim() ||
      receipt.itemName.length > 160 ||
      typeof receipt.amount !== 'string' ||
      !POSITIVE_WLD.test(receipt.amount) ||
      typeof receipt.purchasedAt !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}T/.test(receipt.purchasedAt) ||
      Number.isNaN(Date.parse(receipt.purchasedAt))
    )
      return null;
    seen.add(receipt.purchaseId);
    sum += BigInt(receipt.amount);
    purchases.push({
      purchaseId: receipt.purchaseId,
      itemName: receipt.itemName,
      amount: receipt.amount,
      purchasedAt: receipt.purchasedAt,
    });
  }
  if (sum.toString() !== fields.totalSpent) return null;
  return {
    purchases,
    summary: { count: purchases.length, totalSpent: fields.totalSpent, scope: 'displayed' },
  };
}
