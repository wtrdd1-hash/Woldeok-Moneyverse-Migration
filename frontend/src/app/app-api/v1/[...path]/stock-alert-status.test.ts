import { describe, expect, it } from 'vitest';
import { isVerifiedStockAlertStatusList, stockAlertStatusQuery } from './stock-alert-status';

const row = { alert_id: '00000000-0000-4000-8000-000000000003', stock_id: '00000000-0000-4000-8000-000000000002', condition_met: true, current_price: '9007199254740993', symbol: 'WLD' };
describe('Android stock alert status filter', () => {
  it('rejects unknown and repeated query parameters before forwarding', () => {
    expect(stockAlertStatusQuery(new URLSearchParams())).toBe('all');
    expect(stockAlertStatusQuery(new URLSearchParams('status=met'))).toBe('met');
    expect(stockAlertStatusQuery(new URLSearchParams('status=met&status=met'))).toBeNull();
    expect(stockAlertStatusQuery(new URLSearchParams('status=watched'))).toBeNull();
    expect(stockAlertStatusQuery(new URLSearchParams('status=met&owner=other'))).toBeNull();
  });
  it('rejects stale HTTP 200 lists that ignore requested status or fabricate precision', () => {
    expect(isVerifiedStockAlertStatusList({ alerts: [row], filterApplied: 'met' }, 'met')).toBe(true);
    expect(isVerifiedStockAlertStatusList({ alerts: [row] }, 'watching')).toBe(false);
    expect(isVerifiedStockAlertStatusList({ alerts: [{ ...row, condition_met: null }] }, 'watching')).toBe(false);
    expect(isVerifiedStockAlertStatusList({ alerts: [{ ...row, current_price: Number('9007199254740993') }] }, 'met')).toBe(false);
    expect(isVerifiedStockAlertStatusList({ alerts: [] }, 'watching')).toBe(false);
    expect(isVerifiedStockAlertStatusList({ alerts: [], filterApplied: 'watching' }, 'watching')).toBe(true);
    expect(isVerifiedStockAlertStatusList({ alerts: [row], filterApplied: 'watching' }, 'met')).toBe(false);
  });
});
