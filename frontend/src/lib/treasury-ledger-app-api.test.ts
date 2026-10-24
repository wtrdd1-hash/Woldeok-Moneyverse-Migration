import { describe, expect, it } from 'vitest';
import { APP_API_RESPONSE_HEADERS, appGatewayPath } from './app-gateway';

describe('Android treasury ledger parity', () => {
  it('forwards the owner-scoped GET through existing app-api and preserves privacy headers', () => {
    expect(appGatewayPath(['wallet', 'treasury-outflows'])).toBe('/api/v1/wallet/treasury-outflows');
    expect(APP_API_RESPONSE_HEADERS).toContain('cache-control');
  });
});
