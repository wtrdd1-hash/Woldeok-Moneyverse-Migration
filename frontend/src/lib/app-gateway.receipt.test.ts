import { describe, expect, it } from 'vitest';
import { appGatewayPath, addAppJsonCompatibility } from './app-gateway';

describe('native wallet receipt compatibility', () => {
  it('routes the owner receipt through the authenticated private API gateway', () => {
    expect(appGatewayPath(['wallet', 'activity', '22222222-2222-4222-8222-222222222222']))
      .toBe('/api/v1/wallet/activity/22222222-2222-4222-8222-222222222222');
  });

  it('preserves canonical 38-digit integer strings without numeric conversion', () => {
    const huge = '90071992547409931234567890123456789012';
    const payload = addAppJsonCompatibility({ net_wallet_delta: '0', bank_delta: huge });
    expect(payload).toMatchObject({ net_wallet_delta: '0', bank_delta: huge, bankDelta: huge });
  });
});
