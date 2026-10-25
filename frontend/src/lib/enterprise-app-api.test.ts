import { describe, expect, it } from 'vitest';
import { appGatewayPath, addAppJsonCompatibility } from './app-gateway';

describe('public enterprise Android gateway', () => {
  it('exposes the same public enterprise disclosure path and exact WLD strings', () => {
    expect(appGatewayPath(['enterprises', 'public'])).toBe('/api/v1/enterprises/public');
    const body = addAppJsonCompatibility({ source: 'DATABASE_SNAPSHOT', settlementStatus: 'NOT_VERIFIED', overview: { total_soe_assets_wld: '9007199254740993' } });
    expect((body as { overview: { totalSoeAssetsWld: string } }).overview.totalSoeAssetsWld).toBe('9007199254740993');
  });
});
