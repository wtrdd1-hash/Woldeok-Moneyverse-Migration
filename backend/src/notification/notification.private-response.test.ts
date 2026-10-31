import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { NotificationController } from './notification.controller';
import { NotificationModule } from './notification.module';

function captureNotificationMiddleware() {
  let handler: ((request: unknown, response: { setHeader: (name: string, value: string) => void }, next: () => void) => void) | undefined;
  let mappedController: unknown;
  const consumer = {
    apply: (middleware: typeof handler) => {
      handler = middleware;
      return { forRoutes: (controller: unknown) => { mappedController = controller; } };
    },
  };
  const notificationModule = new NotificationModule() as NotificationModule & { configure?: (consumer: unknown) => void };
  expect(notificationModule.configure).toBeTypeOf('function');
  notificationModule.configure!(consumer);
  expect(mappedController).toBe(NotificationController);
  expect(handler).toBeTypeOf('function');
  return handler!;
}

describe('owner notification HTTP privacy boundary', () => {
  it('sets private, no-store and noindex before guards reject an unauthenticated request', () => {
    const middleware = captureNotificationMiddleware();
    const headers = new Map<string, string>();
    let nextCalled = false;
    middleware({}, { setHeader: (name, value) => headers.set(name.toLowerCase(), value) }, () => {
      nextCalled = true;
    });
    expect(nextCalled).toBe(true);
    expect(headers.get('cache-control')).toBe('private, no-store');
    expect(headers.get('x-robots-tag')).toBe('noindex');
    expect(headers.get('referrer-policy')).toBe('no-referrer');
  });

  it('applies the same pre-guard policy to unread count and mutation receipts', () => {
    const middleware = captureNotificationMiddleware();
    for (const path of ['notifications/unread-count', 'notifications/123/read', 'notifications/read-all', 'notifications/read-all-receipt', 'notifications/claim-all']) {
      const headers = new Map<string, string>();
      middleware({ url: path }, { setHeader: (name, value) => headers.set(name.toLowerCase(), value) }, () => {});
      expect(headers.get('cache-control'), path).toBe('private, no-store');
      expect(headers.get('x-robots-tag'), path).toBe('noindex');
    }
  });

  it('preserves session, consent and CSRF requirements', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, NotificationController) ?? [];
    expect(guards).toEqual(expect.arrayContaining([SessionGuard, AuthenticatedGuard, ConsentGuard]));
    for (const method of ['markRead', 'markAllRead', 'markAllReadWithReceipt', 'claimAll'] as const) {
      const methodGuards = Reflect.getMetadata(GUARDS_METADATA, NotificationController.prototype[method]) ?? [];
      expect(methodGuards).toContain(CsrfGuard);
    }
  });
});
