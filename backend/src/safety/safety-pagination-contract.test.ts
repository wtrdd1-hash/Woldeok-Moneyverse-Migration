import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it, vi } from 'vitest';
import { SafetyController } from './safety.controller';
import type { SafetyService } from './safety.service';
import type { RequestWithSession } from '../auth/session.context';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';

describe('admin safety queue pagination API contract', () => {
  const request = { session: { user_id: 'admin-actor' } } as unknown as RequestWithSession;

  it('forwards bounded offset to the authenticated PostgreSQL chat queue service', async () => {
    const service = { adminListChatReports: vi.fn().mockResolvedValue({ items: [], count: 0 }) };
    const controller = new SafetyController(service as unknown as SafetyService);
    await controller.adminListChatReports(request, undefined, '50', '100');
    expect(service.adminListChatReports).toHaveBeenCalledWith('admin-actor', undefined, 50, 100);
  });

  it('forwards bounded offset to the authenticated PostgreSQL takedown queue service', async () => {
    const service = { adminListTakedowns: vi.fn().mockResolvedValue({ items: [], count: 0 }) };
    const controller = new SafetyController(service as unknown as SafetyService);
    await controller.adminListTakedowns(request, undefined, '50', '150');
    expect(service.adminListTakedowns).toHaveBeenCalledWith('admin-actor', undefined, 50, 150);
  });

  it('keeps both queue endpoints behind member, admin role and admin-session guards', () => {
    for (const method of ['adminListChatReports', 'adminListTakedowns'] as const) {
      const guards = Reflect.getMetadata(GUARDS_METADATA, SafetyController.prototype[method]) as unknown[];
      expect(guards).toContain(SessionGuard);
      expect(guards).toContain(AuthenticatedGuard);
      expect(guards).toContain(AdminGuard);
      expect(guards).toContain(AdminSessionGuard);
    }
  });
});
