import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { AdminSupportController } from './support.controller';

function methodGuards(name: 'reply' | 'status'): unknown[] {
  return Reflect.getMetadata(GUARDS_METADATA, AdminSupportController.prototype[name]) ?? [];
}

describe('admin support sensitive-action guards', () => {
  it.each(['reply', 'status'] as const)('%s requires CSRF protection', (method) => {
    const guards = methodGuards(method);
    expect(guards).toContain(CsrfGuard);
  });
});

