import 'reflect-metadata';
import { HEADERS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { AccountSecurityController } from './account-security.controller';

/** All owner security/session responses must be ineligible for shared caches or indexing. */
describe('owner security session HTTP privacy', () => {
  const routes = [
    'sessions',
    'events',
    'revokeSession',
    'revokeOtherSessions',
  ] as const;

  for (const route of routes) {
    it(`${route} sets private, no-store, noindex and no-referrer`, () => {
      const headers = (Reflect.getMetadata(
        HEADERS_METADATA,
        AccountSecurityController.prototype[route],
      ) ?? []) as readonly { name: string; value: string }[];
      expect(headers).toContainEqual({ name: 'Cache-Control', value: 'private, no-store' });
      expect(headers).toContainEqual({ name: 'X-Robots-Tag', value: 'noindex' });
      expect(headers).toContainEqual({ name: 'Referrer-Policy', value: 'no-referrer' });
    });
  }
});
