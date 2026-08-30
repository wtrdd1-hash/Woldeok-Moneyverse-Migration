import { describe, expect, it } from 'vitest';
import {
  categoryLabel,
  countLabel,
  effectLabel,
  groupByCategory,
  hasUpkeep,
  isConsumable,
  isHeldToTheLimit,
  maxPurchasable,
  purchaseLimitLabel,
  purchaseMessage,
  stockLabel,
  useMessage,
} from './catalog';
import type { CatalogItem } from './catalog';

/**
 * The catalogue arrives in English -- a category token, an effect enum, a
 * purchase-limit code -- and this module is the only place it becomes Korean.
 * These are the tests that say a member reads an item rather than a slug, and
 * that the screen claims no rule the database does not actually apply.
 */
function item(overrides: Partial<CatalogItem> = {}): CatalogItem {
  return {
    catalog_id: '11111111-1111-4111-8111-111111111111',
    code: 'energy_drink',
    name: '작업 에너지 음료',
    description: '쉬운 작업 재도전용 소모품입니다.',
    category: 'general',
    price: '40',
    quantity: null,
    purchase_limit: 'daily_2',
    effect_kind: 'convenience',
    maintenance_cost: '0',
    sale_ends_at: null,
    ...overrides,
  };
}

describe('categoryLabel', () => {
  it('names each seeded category in Korean', () => {
    expect(categoryLabel('general')).toBe('생활');
    expect(categoryLabel('vehicle')).toBe('이동수단과 임대');
    expect(categoryLabel('luxury')).toBe('명품');
  });

  // A migration may add a seventh category long before this page hears about
  // it, and the page groups by category: a lookup returning undefined would
  // take every item in that group off the screen.
  it('falls back to the code for a category it has not been taught', () => {
    expect(categoryLabel('festival')).toBe('festival');
  });
});

describe('effectLabel', () => {
  it('names the effect kinds by what they decide, not by what they suggest', () => {
    expect(effectLabel('convenience')).toBe('사용 가능');
    expect(effectLabel('decoration')).toBe('장식');
    expect(effectLabel('display')).toBe('전시');
  });

  it('falls back to the enum value it has not been taught', () => {
    expect(effectLabel('wearable')).toBe('wearable');
  });
});

describe('isConsumable', () => {
  // 074 answers 22023 for anything else, so this is what decides whether the
  // use control is offered at all.
  it('is true only for the kind shop_use_item accepts', () => {
    expect(isConsumable('convenience')).toBe(true);
    expect(isConsumable('decoration')).toBe(false);
    expect(isConsumable('display')).toBe(false);
  });
});

describe('purchaseLimitLabel', () => {
  it('writes the limits 072 actually enforces', () => {
    expect(purchaseLimitLabel('once')).toBe('하나만 가질 수 있어요');
    expect(purchaseLimitLabel('account_one')).toBe('하나만 가질 수 있어요');
    expect(purchaseLimitLabel('permanent')).toBe('하나만 가질 수 있어요');
    expect(purchaseLimitLabel('unlimited')).toBe('구매 횟수 제한이 없어요');
    expect(purchaseLimitLabel('daily_2')).toBe('하루에 2개까지 살 수 있어요');
    expect(purchaseLimitLabel('weekly_1')).toBe('한 주에 1개까지 살 수 있어요');
  });

  // `shop_assert_purchase_limit` accepts these and returns without checking
  // anything -- its own comment says so. A badge describing a gate that is
  // not there would stop a member from trying a purchase that would succeed.
  it('says nothing about a limit the database records but does not apply', () => {
    for (const limit of ['level_5', 'stage_based', 'business_owned', 'state_based', 'timed']) {
      expect(purchaseLimitLabel(limit), `${limit} is accepted but not enforced`).toBeNull();
    }
  });

  // 'limited' means a finite allocation, and 073 seeded every row with NULL
  // stock. The stock line is where that fact belongs, and there is none.
  it('says nothing about a limited item whose allocation was never set', () => {
    expect(purchaseLimitLabel('limited')).toBeNull();
  });

  it('refuses a cap of zero rather than offering nothing to buy', () => {
    expect(purchaseLimitLabel('daily_0')).toBeNull();
  });
});

describe('maxPurchasable', () => {
  it('offers one of an item that may only ever be held once', () => {
    expect(maxPurchasable(item({ purchase_limit: 'once' }))).toBe(1);
    expect(maxPurchasable(item({ purchase_limit: 'account_one' }))).toBe(1);
    expect(maxPurchasable(item({ purchase_limit: 'permanent' }))).toBe(1);
  });

  it('offers the period cap for a daily or weekly limit', () => {
    expect(maxPurchasable(item({ purchase_limit: 'daily_3' }))).toBe(3);
    expect(maxPurchasable(item({ purchase_limit: 'weekly_2' }))).toBe(2);
  });

  // 072 refuses `p_quantity NOT BETWEEN 1 AND 100` before it reads anything
  // else, so no control may ask for more than that.
  it('never offers more than the function itself accepts', () => {
    expect(maxPurchasable(item({ purchase_limit: 'unlimited' }))).toBe(100);
    expect(maxPurchasable(item({ purchase_limit: 'timed' }))).toBe(100);
  });

  it('is bounded by the stock on hand when the catalogue names one', () => {
    expect(maxPurchasable(item({ purchase_limit: 'unlimited', quantity: 4 }))).toBe(4);
    expect(maxPurchasable(item({ purchase_limit: 'daily_3', quantity: 1 }))).toBe(1);
  });

  it('offers nothing at all when the shelf is empty', () => {
    expect(maxPurchasable(item({ purchase_limit: 'unlimited', quantity: 0 }))).toBe(0);
  });

  // Null stock is unlimited, which is every seeded row today. Reading it as
  // zero would take the whole catalogue's buy controls off the screen.
  it('treats an unset stock as no ceiling of its own', () => {
    expect(maxPurchasable(item({ purchase_limit: 'unlimited', quantity: null }))).toBe(100);
  });
});

describe('isHeldToTheLimit', () => {
  it('is true only for a single-hold item the member already owns', () => {
    expect(isHeldToTheLimit('once', 1)).toBe(true);
    expect(isHeldToTheLimit('account_one', 2)).toBe(true);
    expect(isHeldToTheLimit('once', 0)).toBe(false);
  });

  // Owning three energy drinks is not a reason to stop offering a fourth.
  it('is false for a limit that lets a member hold more', () => {
    expect(isHeldToTheLimit('daily_2', 3)).toBe(false);
    expect(isHeldToTheLimit('unlimited', 9)).toBe(false);
  });
});

describe('stockLabel', () => {
  it('says how many are left when the catalogue names a number', () => {
    expect(stockLabel(3)).toBe('3개');
    expect(stockLabel(12000)).toBe('12,000개');
  });

  it('says sold out rather than nothing for an empty shelf', () => {
    expect(stockLabel(0)).toBe('품절');
  });

  // 073 left every allocation unset on purpose until an administrator screen
  // can change one. Printing 무제한 would state a decision nobody has made.
  it('claims nothing about an item whose stock was never set', () => {
    expect(stockLabel(null)).toBeNull();
  });
});

describe('countLabel', () => {
  it('groups a count the way every other figure on the screen is grouped', () => {
    expect(countLabel(0)).toBe('0개');
    expect(countLabel(12000)).toBe('12,000개');
  });

  it('refuses a count that is not a whole number of things', () => {
    expect(countLabel(Number.NaN)).toBe('—');
    expect(countLabel(1.5)).toBe('—');
    expect(countLabel(-1)).toBe('—');
  });
});

describe('hasUpkeep', () => {
  it('is false for the zero every item without upkeep carries', () => {
    expect(hasUpkeep('0')).toBe(false);
    expect(hasUpkeep('000')).toBe(false);
  });

  it('is true for the weekly charge 075 attaches to a vehicle or a lease', () => {
    expect(hasUpkeep('100')).toBe(true);
    expect(hasUpkeep('1500')).toBe(true);
  });

  // The column is a bigint arriving as a string. Deciding this with
  // `Number(cost) > 0` is exactly the conversion that rounds an amount past
  // 2^53, so the digits are what get looked at.
  it('reads an amount far beyond a safe integer without converting it', () => {
    expect(hasUpkeep('9'.repeat(30))).toBe(true);
  });

  it('is false for something that is not a canonical amount', () => {
    expect(hasUpkeep('')).toBe(false);
    expect(hasUpkeep('1e3')).toBe(false);
  });
});

describe('groupByCategory', () => {
  it('keeps the order the database sorted the rows into', () => {
    const groups = groupByCategory([
      item({ catalog_id: 'a', category: 'general' }),
      item({ catalog_id: 'b', category: 'job' }),
      item({ catalog_id: 'c', category: 'general' }),
    ]);
    expect(groups.map((group) => group.category)).toEqual(['general', 'job']);
    expect(groups[0]?.items.map((entry) => entry.catalog_id)).toEqual(['a', 'c']);
    expect(groups[0]?.label).toBe('생활');
  });

  it('has nothing to group when the catalogue is empty', () => {
    expect(groupByCategory([])).toEqual([]);
  });
});

describe('purchaseMessage', () => {
  it('reports the amount the database charged', () => {
    expect(
      purchaseMessage({
        purchase_id: 'p',
        amount: '12000',
        transaction_id: 't',
        replayed: false,
      }),
    ).toContain('12,000 WLD를 결제했어요');
  });

  // A replay is not a second charge: the member pressed the button twice and
  // the first press is what stands.
  it('tells a member a repeat was already paid rather than charging again', () => {
    const message = purchaseMessage({
      purchase_id: 'p',
      amount: '40',
      transaction_id: 't',
      replayed: true,
    });
    expect(message).toContain('이미 처리된 구매예요');
    expect(message).toContain('40 WLD');
  });

  // The amount is a bigint. Every digit has to survive the trip to the
  // sentence, which is why nothing here converts it.
  it('keeps every digit of an amount far beyond a safe integer', () => {
    const huge = `9${'0'.repeat(37)}`;
    const message = purchaseMessage({
      purchase_id: 'p',
      amount: huge,
      transaction_id: 't',
      replayed: false,
    });
    const figure = message.slice(0, message.indexOf(' WLD'));
    expect(figure.replace(/,/g, '')).toBe(huge);
  });
});

describe('useMessage', () => {
  it('reports the count the database was left holding', () => {
    expect(
      useMessage({ catalog_id: 'c', remaining_quantity: 2, expires_at: null, replayed: false }),
    ).toBe('아이템을 사용했어요. 남은 수량은 2개예요.');
  });

  it('tells a member a repeat was already spent rather than spending another', () => {
    expect(
      useMessage({ catalog_id: 'c', remaining_quantity: 0, expires_at: null, replayed: true }),
    ).toBe('이미 사용한 기록이에요. 남은 수량은 0개예요.');
  });

  // 074's replay branch reads the row the *receipt* names, and a key spent on
  // some other item finds none. That is not the same fact as "none are left",
  // so it must not be reported as one.
  it('does not report an unreadable count as zero', () => {
    const message = useMessage({
      catalog_id: 'c',
      remaining_quantity: null,
      expires_at: null,
      replayed: true,
    });
    expect(message).toContain('지금 확인할 수 없어요');
    expect(message).not.toContain('0개');
  });
});
