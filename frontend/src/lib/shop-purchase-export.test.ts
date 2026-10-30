import { describe, expect, it } from 'vitest';
import { parseShopPurchaseExport, shopPurchaseCsv } from './shop-purchase-export';

const purchase = {
  purchaseId: '00000000-0000-4000-8000-000000000002',
  itemId: '00000000-0000-4000-8000-000000000003',
  itemName: '  =HYPERLINK("https://evil.example","click")\r\nOther',
  transactionId: '00000000-0000-4000-8000-000000000004',
  amount: '9007199254740993',
  purchasedAt: '2026-10-30T03:00:00.000Z',
};

describe('owner-private shop purchase CSV', () => {
  it('keeps canonical high-precision integer strings and escapes spreadsheet formulas', () => {
    const verified = parseShopPurchaseExport({ scope: 'recent100', purchases: [purchase] });
    expect(verified).not.toBeNull();
    const csv = shopPurchaseCsv(verified!);
    expect(csv).toContain('9007199254740993');
    expect(csv).toContain('"\'  =HYPERLINK(""https://evil.example"",""click"")');
    expect(csv).toMatch(/^\uFEFFpurchase_id,item_name,amount_wld,purchased_at_utc\r\n/);
    expect(csv).toContain('\r\n');
  });
  it('rejects malformed, oversized and forged response shapes instead of exporting a false empty history', () => {
    for (const payload of [
      null,
      {},
      { scope: 'recent100', purchases: new Array(101).fill(purchase) },
      { scope: 'all', purchases: [] },
      { scope: 'recent100', purchases: [{ ...purchase, amount: Number('9007199254740993') }] },
      { scope: 'recent100', purchases: [{ ...purchase, amount: '01' }] },
      { scope: 'recent100', purchases: [{ ...purchase, itemId: 'foreign' }] },
      { scope: 'recent100', purchases: [purchase, purchase] },
      { scope: 'recent100', purchases: [{ ...purchase, purchasedAt: '2026-02-30T03:00:00.000Z' }] },
    ]) {
      expect(parseShopPurchaseExport(payload)).toBeNull();
    }
  });
});
