import 'reflect-metadata';
import { GUARDS_METADATA, HEADERS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { PrivacyController } from './privacy.controller';
import { PrivacyModule } from './privacy.module';

describe('private privacy request HTTP boundary', () => {
  it.each(['list', 'create'] as const)('%s forbids response caching and indexing', (method) => {
    const headers = Reflect.getMetadata(HEADERS_METADATA, PrivacyController.prototype[method]) ?? [];
    expect(headers).toEqual(expect.arrayContaining([
      { name: 'Cache-Control', value: 'private, no-store' },
      { name: 'X-Robots-Tag', value: 'noindex' },
    ]));
  });

  it('sets private headers before guards can reject the request', () => {
    let middleware: ((request: unknown, response: { setHeader: (key: string, value: string) => void }, next: () => void) => void) | undefined;
    let mappedController: unknown;
    const consumer = {
      apply: (handler: typeof middleware) => {
        middleware = handler;
        return { forRoutes: (controller: unknown) => { mappedController = controller; } };
      },
    };
    new PrivacyModule().configure(consumer as never);
    expect(mappedController).toBe(PrivacyController);
    const headers = new Map<string, string>();
    let nextCalled = false;
    expect(middleware).toBeTypeOf('function');
    middleware!({}, { setHeader: (key, value) => headers.set(key.toLowerCase(), value) }, () => { nextCalled = true; });
    expect(nextCalled).toBe(true);
    expect(headers.get('cache-control')).toBe('private, no-store');
    expect(headers.get('x-robots-tag')).toBe('noindex');
  });

  it('preserves session/consent/CSRF boundaries for private request receipts', () => {
    const classGuards = Reflect.getMetadata(GUARDS_METADATA, PrivacyController) ?? [];
    const writeGuards = Reflect.getMetadata(GUARDS_METADATA, PrivacyController.prototype.create) ?? [];
    expect(classGuards).toEqual(expect.arrayContaining([SessionGuard, AuthenticatedGuard, ConsentGuard]));
    expect(writeGuards).toContain(CsrfGuard);
  });
});
