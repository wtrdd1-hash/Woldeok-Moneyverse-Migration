import 'reflect-metadata';
import { HEADERS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { AccountSecurityController } from './account-security.controller';

/** The Android proxy and browser must not expose owner-only event history to shared caches. */
describe('security events HTTP privacy', () => {
  it('declares private no-store and noindex on the owner-only backend endpoint', () => {
    const headers = Reflect.getMetadata(HEADERS_METADATA, AccountSecurityController.prototype.events) as
      readonly { name: string; value: string }[];
    expect(headers).toContainEqual({ name: 'Cache-Control', value: 'private, no-store' });
    expect(headers).toContainEqual({ name: 'X-Robots-Tag', value: 'noindex' });
  });
});
