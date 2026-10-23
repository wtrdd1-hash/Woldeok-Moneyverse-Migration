import { describe, expect, it, vi } from 'vitest';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import type { Queryable } from '../core/db';
import { ApiHealthController } from './api-health.controller';

const healthyDb: Queryable = {
  query: vi.fn(async (sql: string) => ({
    rows: sql.includes('SELECT 1') ? [{ ping: 1 }] : sql.includes('pg_stat_activity') ? [{ count: '3' }] : [{ ratio: '97.5' }],
  })) as Queryable['query'],
};

describe('admin API health evidence boundary', () => {
  it('requires both an admin role and an elevated console session for host/DB telemetry', () => {
    const guards = (Reflect.getMetadata(GUARDS_METADATA, ApiHealthController) as unknown[]) ?? [];
    expect(guards).toContain(AdminGuard);
    expect(guards).toContain(AdminSessionGuard);
  });
  it('does not claim unprobed API domains are operational or report invented percentages', async () => {
    const result = await new ApiHealthController(healthyDb).getApiHealthStatus();
    expect(result.isLiveTelemetry).toBe(false);
    expect(result.totalDomains).toBe(14);
    expect(result.globalSuccessRate).toBeNull();
    expect(result.averageLatencyMs).toBeNull();
    expect(result.domains).toHaveLength(14);
    expect(result.domains.every((domain) => domain.status === 'UNVERIFIED' && domain.latencyMs === null && domain.successRate === null)).toBe(true);
    expect(result.dbProbeState).toBe('ok');
    expect(result.dbLatencyMs).toBeGreaterThanOrEqual(1);
    expect(result.systemTelemetry.activeDbConnections).toBe(3);
    expect(result.systemTelemetry.dbCacheHitRatio).toBe(97.5);
  });

  it('does not invent a successful DB ping when no pool exists', async () => {
    const result = await new ApiHealthController(null).getApiHealthStatus();
    expect(result.dbProbeState).toBe('unavailable');
    expect(result.dbLatencyMs).toBeNull();
    expect(result.systemTelemetry.activeDbConnections).toBeNull();
    expect(result.systemTelemetry.dbCacheHitRatio).toBeNull();
    expect(result.status).toBe('UNKNOWN');
  });

  it('does not disguise a failed DB probe as measured latency or healthy endpoints', async () => {
    const failing: Queryable = { query: vi.fn(async () => { throw new Error('offline'); }) as Queryable['query'] };
    const result = await new ApiHealthController(failing).getApiHealthStatus();
    expect(result.dbProbeState).toBe('failed');
    expect(result.dbLatencyMs).toBeNull();
    expect(result.status).toBe('DEGRADED');
    expect(result.domains.every((domain) => domain.status === 'UNVERIFIED')).toBe(true);
  });
});
