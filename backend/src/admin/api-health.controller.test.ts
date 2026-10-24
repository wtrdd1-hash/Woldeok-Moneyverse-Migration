import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import type { Queryable } from '../core/db';
import { ApiHealthController } from './api-health.controller';

describe('admin health authority and evidence', () => {
  it('requires an administrator with an open elevated console', () => {
    const guards: unknown[] = Reflect.getMetadata('__guards__', ApiHealthController) ?? [];
    expect(guards).toContain(AdminGuard);
    expect(guards).toContain(AdminSessionGuard);
  });

  it('never invents a healthy database or endpoint success when no pool is available', async () => {
    const response = await new ApiHealthController(null).getApiHealthStatus();
    expect(response).toMatchObject({ status: 'UNKNOWN', dbLatencyMs: null });
    expect(response).not.toHaveProperty('globalSuccessRate');
    expect(response).not.toHaveProperty('domains');
    expect(response.systemTelemetry.activeDbConnections).toBeNull();
    expect(response.systemTelemetry.dbCacheHitRatio).toBeNull();
  });

  it('reports only measured ping and PostgreSQL statistics', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [{ ping: 1 }] })
      .mockResolvedValueOnce({ rows: [{ count: '3' }] })
      .mockResolvedValueOnce({ rows: [{ ratio: '97.3' }] });
    const response = await new ApiHealthController({ query } as unknown as Queryable).getApiHealthStatus();
    expect(response.status).toBe('HEALTHY');
    expect(response.dbLatencyMs).toBeGreaterThanOrEqual(0);
    expect(response.systemTelemetry.activeDbConnections).toBe(3);
    expect(response.systemTelemetry.dbCacheHitRatio).toBe(97.3);
    expect(response).not.toHaveProperty('globalSuccessRate');
    expect(response).not.toHaveProperty('domains');
  });

  it('fails closed when the database ping fails', async () => {
    const query = vi.fn().mockRejectedValue(new Error('db unreachable'));
    const response = await new ApiHealthController({ query } as unknown as Queryable).getApiHealthStatus();
    expect(response).toMatchObject({ status: 'DEGRADED', dbLatencyMs: null });
    expect(response.systemTelemetry.activeDbConnections).toBeNull();
    expect(response.systemTelemetry.dbCacheHitRatio).toBeNull();
  });
});
