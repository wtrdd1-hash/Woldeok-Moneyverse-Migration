import { GUARDS_METADATA } from '@nestjs/common/constants';
import { expect, it, vi } from 'vitest';
import { SeoController } from './seo.controller';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';

it('admin SEO details require the existing five backend guards', () => {
  expect(Reflect.getMetadata(GUARDS_METADATA, SeoController.prototype.getAdminStatus)).toEqual([
    SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard, AdminSessionGuard,
  ]);
});

it('admin SEO details preserve crawler records for authorized operators', async () => {
  const metrics = { recentLogs: [{ path: '/example' }], indexNowKey: 'example-key' };
  const service = { getSeoMetrics: vi.fn().mockResolvedValue(metrics) };
  const controller = new SeoController(service as never, {} as never, {} as never, {} as never);
  expect(await controller.getAdminStatus()).toBe(metrics);
});