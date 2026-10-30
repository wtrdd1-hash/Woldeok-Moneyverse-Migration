import { GUARDS_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { describe, expect, it, vi } from 'vitest';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { StorageHeadroomController } from './storage-headroom.controller';

const verified = { status: 'VERIFIED', sourceKind: 'HOST_SIGNED', freshness: 'FRESH', observedAt: '2026-10-30T00:00:00.000Z', mounts: [] };

describe('operator-only storage headroom', () => {
  it('requires both admin role and admin session on a fixed read-only route', () => {
    expect(Reflect.getMetadata(PATH_METADATA, StorageHeadroomController)).toBe('admin/operations');
    expect(Reflect.getMetadata(PATH_METADATA, StorageHeadroomController.prototype.getStorage)).toBe('storage');
    const guards = Reflect.getMetadata(GUARDS_METADATA, StorageHeadroomController) as unknown[];
    expect(guards).toContain(AdminGuard);
    expect(guards).toContain(AdminSessionGuard);
  });

  it('returns signed evidence only, and refuses unavailable or forged source without leaking errors', () => {
    const controller = new StorageHeadroomController();
    vi.spyOn(controller, 'readSnapshot').mockReturnValue(verified as never);
    expect(controller.getStorage()).toEqual(verified);
    vi.spyOn(controller, 'readSnapshot').mockImplementation(() => { throw new Error('/etc/moneyverse/secret-key'); });
    expect(() => controller.getStorage()).toThrow('storage evidence unavailable');
  });
});
