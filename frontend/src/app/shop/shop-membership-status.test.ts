import { describe, expect, it } from 'vitest';
import { hasVerifiedVipPass } from './shop-membership-status';

describe('shop filters must not change membership identity', () => {
  it('reads the original unfiltered member catalogue even if the visible result hides VIP', () => {
    const unfiltered = [{ code: 'item_vip_lounge_pass', user_owned_quantity: 1 }];
    const visible = [{ code: 'work_gloves', user_owned_quantity: 0 }];
    expect(hasVerifiedVipPass(unfiltered)).toBe(true);
    expect(hasVerifiedVipPass(visible)).toBe(false);
  });
  it('does not accept a missing, unrelated or unowned pass', () => {
    expect(hasVerifiedVipPass([])).toBe(false);
    expect(hasVerifiedVipPass([{ code: 'vip_lounge_fake', user_owned_quantity: 0 }])).toBe(false);
  });
});
