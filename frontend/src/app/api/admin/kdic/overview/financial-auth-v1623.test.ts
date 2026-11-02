import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock } = vi.hoisted(() => ({ apiMock: vi.fn() }));
vi.mock('@/lib/api', () => ({
  api: apiMock,
  ApiError: class ApiError extends Error {
    constructor(readonly status: number) { super('backend restricted detail'); }
  },
}));

import { ApiError } from '@/lib/api';
import { GET as getKdicOverview } from './route';
import { GET as getKdicLedger } from '../ledger-integrity/route';
import { GET as getPensionFunded } from '../../../pension/funded/position/route';

describe('v1623: authenticated financial read BFF never disguises login rejection as unverified money', () => {
  beforeEach(() => apiMock.mockReset());

  for (const [routeName, route] of [
    ['KDIC overview', getKdicOverview],
    ['KDIC ledger diagnostics', getKdicLedger],
    ['new funded pension position', getPensionFunded],
  ] as const) {
    it.each([
      [401, 'AUTHENTICATION_REQUIRED'],
      [403, 'AUTHORIZATION_DENIED'],
    ] as const)(`${routeName} preserves %s as %s`, async (status, code) => {
      apiMock.mockRejectedValueOnce(new ApiError(status));
      const response = await route();
      expect(response.status).toBe(status);
      expect(response.headers.get('cache-control')).toContain('no-store');
      const result = await response.json();
      expect(result.code).toBe(code);
      expect(JSON.stringify(result)).not.toContain('backend restricted detail');
      expect(JSON.stringify(result)).not.toContain('UNVERIFIED');
    });

    it(`${routeName} stays fail-closed on genuine broken ledger/DB responses`, async () => {
      apiMock.mockRejectedValueOnce(new Error('database access unavailable'));
      const response = await route();
      expect(response.status).toBe(503);
      expect(response.headers.get('cache-control')).toContain('no-store');
      expect(JSON.stringify(await response.json())).not.toContain('database access unavailable');
    });
  }
});
