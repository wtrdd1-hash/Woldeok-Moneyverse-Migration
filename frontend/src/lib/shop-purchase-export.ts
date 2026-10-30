/** Strictly verified owner-scoped recent purchase export, never a lifetime statement. */
export interface ShopPurchaseExportRow {
  readonly purchaseId: string;
  readonly itemId: string;
  readonly itemName: string;
  readonly transactionId: string;
  readonly amount: string;
  readonly purchasedAt: string;
}
export interface ShopPurchaseExport {
  readonly scope: 'recent100';
  readonly purchases: readonly ShopPurchaseExportRow[];
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const AMOUNT = /^[1-9][0-9]{0,37}$/;
const UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

export function parseShopPurchaseExport(value: unknown): ShopPurchaseExport | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const payload = value as Record<string, unknown>;
  if (
    payload.scope !== 'recent100' ||
    !Array.isArray(payload.purchases) ||
    payload.purchases.length > 100
  )
    return null;
  const purchases: ShopPurchaseExportRow[] = [];
  const seen = new Set<string>();
  for (const raw of payload.purchases as unknown[]) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const row = raw as Record<string, unknown>;
    if (
      typeof row.purchaseId !== 'string' ||
      !UUID.test(row.purchaseId) ||
      seen.has(row.purchaseId) ||
      typeof row.itemId !== 'string' ||
      !UUID.test(row.itemId) ||
      typeof row.transactionId !== 'string' ||
      !UUID.test(row.transactionId) ||
      typeof row.itemName !== 'string' ||
      !row.itemName.trim() ||
      row.itemName.length > 160 ||
      /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(row.itemName) ||
      typeof row.amount !== 'string' ||
      !AMOUNT.test(row.amount) ||
      typeof row.purchasedAt !== 'string' ||
      !UTC.test(row.purchasedAt) ||
      !Number.isFinite(Date.parse(row.purchasedAt)) ||
      new Date(row.purchasedAt).toISOString() !== row.purchasedAt
    )
      return null;
    seen.add(row.purchaseId);
    purchases.push({
      purchaseId: row.purchaseId,
      itemId: row.itemId,
      itemName: row.itemName,
      transactionId: row.transactionId,
      amount: row.amount,
      purchasedAt: row.purchasedAt,
    });
  }
  return { scope: 'recent100', purchases };
}

function csvCell(value: string): string {
  // Spreadsheet clients may evaluate leading = + - @ even after whitespace.
  const safe = /^\s*[=+\-@]/u.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe;
}

export function shopPurchaseCsv(exported: ShopPurchaseExport): string {
  const rows = exported.purchases.map((row) =>
    [row.purchaseId, row.itemName, row.amount, row.purchasedAt].map(csvCell).join(','),
  );
  return `\uFEFF${['purchase_id,item_name,amount_wld,purchased_at_utc', ...rows].join('\r\n')}\r\n`;
}
