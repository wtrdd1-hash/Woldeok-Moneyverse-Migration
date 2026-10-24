import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const route = readFileSync(new URL('../../api/admin/bonds/distribute-coupons/route.ts', import.meta.url), 'utf8');
const tower = readFileSync(new URL('./bond-control-tower.tsx', import.meta.url), 'utf8');

describe('treasury bond coupon settlement fail-closed UI', () => {
  it('returns 503 without calling the backend from the legacy public POST proxy', () => {
    expect(route).toContain('status: 503');
    expect(route).not.toContain("api('/api/v1/admin/bonds/distribute-coupons'");
  });
  it('disables manual coupon payout and never claims settlement succeeded', () => {
    expect(tower).toContain('쿠폰 이자 지급 일시 중지');
    expect(tower).not.toContain('handleDistributeCoupons');
    expect(tower).not.toContain('WLD 정산 완료!');
  });
});
