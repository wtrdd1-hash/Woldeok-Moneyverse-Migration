import { describe, expect, it } from 'vitest';
import { describeBondHoldingStatus } from './holding-status';

describe('bond holding status backed by Treasury settlement rows', () => {
  it('recognizes the persisted ACTIVE state as an open holding', () => {
    expect(describeBondHoldingStatus('ACTIVE')).toEqual({ label: '보유중 (이자수령)', active: true });
  });
  it('keeps legacy HOLDING rows recognizable', () => {
    expect(describeBondHoldingStatus('HOLDING')).toEqual({ label: '보유중 (이자수령)', active: true });
  });
  it('only labels redeemed states as matured', () => {
    expect(describeBondHoldingStatus('MATURED')).toEqual({ label: '만기상환 완료', active: false });
    expect(describeBondHoldingStatus('REDEEMED')).toEqual({ label: '만기상환 완료', active: false });
  });
  it('fails closed for unfamiliar statuses instead of claiming redemption', () => {
    expect(describeBondHoldingStatus('BROKEN')).toEqual({ label: '상태 확인 필요', active: false });
    expect(describeBondHoldingStatus('')).toEqual({ label: '상태 확인 필요', active: false });
  });
});
