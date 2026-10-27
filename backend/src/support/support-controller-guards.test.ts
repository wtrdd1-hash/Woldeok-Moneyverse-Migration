import 'reflect-metadata';
import { GUARDS_METADATA, HEADERS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { AdminSupportController, SupportController } from './support.controller';

function methodGuards(name: 'reply' | 'status'): unknown[] {
  return Reflect.getMetadata(GUARDS_METADATA, AdminSupportController.prototype[name]) ?? [];
}

describe('admin support sensitive-action guards', () => {
  it.each(['reply', 'status'] as const)('%s requires CSRF protection', (method) => {
    const guards = methodGuards(method);
    expect(guards).toContain(CsrfGuard);
  });
});



describe('private support HTTP response policy', () => {
  it.each([
    [SupportController, 'threads'], [SupportController, 'messages'],
    [SupportController, 'create'], [SupportController, 'reply'],
    [AdminSupportController, 'threads'], [AdminSupportController, 'messages'],
    [AdminSupportController, 'reply'], [AdminSupportController, 'status'],
  ] as const)('%s.%s disables shared and browser caching', (controller, method) => {
    const headers = Reflect.getMetadata(HEADERS_METADATA, controller.prototype[method]) ?? [];
    expect(headers).toContainEqual({ name: 'Cache-Control', value: 'private, no-store' });
  });
});
