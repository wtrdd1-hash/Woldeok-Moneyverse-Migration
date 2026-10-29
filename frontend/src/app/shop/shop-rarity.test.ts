import { describe, expect, it } from 'vitest';
import { SHOP_RARITIES, shopFilterQuery, vipMembershipFromCatalog } from './shop-rarity';

describe('shop rarity query UI', () => {
  it('provides exactly the database-backed rarity values for accessible selectors', () => {
    expect(SHOP_RARITIES.map((option) => option.value)).toEqual([
      'common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic',
    ]);
  });

  it('preserves keyword and rarity together, URL-encoding user text', () => {
    const query = shopFilterQuery({ q: '프레임 & 효과', rarity: 'rare' });
    const params = new URLSearchParams(query.slice(1));
    expect(params.get('q')).toBe('프레임 & 효과');
    expect(params.get('rarity')).toBe('rare');
    expect(shopFilterQuery({})).toBe('');
  });

  it('does not mistake a filtered catalog without the VIP pass for an unowned pass', () => {
    const filtered = [{ code: 'rare_frame', user_owned_quantity: 1 }];
    const unfiltered = [...filtered, { code: 'item_vip_lounge_pass', user_owned_quantity: 1 }];
    expect(vipMembershipFromCatalog(unfiltered)).toBe(true);
    expect(vipMembershipFromCatalog(filtered)).toBe(false);
    expect(vipMembershipFromCatalog(null)).toBeNull();
  });

  it('does not silently convert unknown values into an unfiltered query', () => {
    expect(new URLSearchParams(shopFilterQuery({ rarity: 'mythic,rare' }).slice(1)).get('rarity'))
      .toBe('mythic,rare');
  });
});
