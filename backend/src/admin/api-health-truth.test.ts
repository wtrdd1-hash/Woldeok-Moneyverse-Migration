import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { ApiHealthController } from './api-health.controller';
import type { Queryable } from '../core/db';

describe('admin API health evidence boundary', () => {
  it('requires administrator role and an open console session', () => {
    const guards = (Reflect.getMetadata(GUARDS_METADATA, ApiHealthController) as unknown[]) ?? [];
    expect(guards).toContain(AdminGuard);
    expect(guards).toContain(AdminSessionGuard);
  });

  it('keeps a measured DB ping when optional statistics are permission denied', async () => {
    const pool: Queryable = {
      async query<R extends import('pg').QueryResultRow>(sql: string): Promise<{ rows: R[] }> {
        if (sql.includes('SELECT 1 AS ping')) return { rows: [{ ping: 1 } as unknown as R] };
        throw Object.assign(new Error('permission denied for relation pg_stat_activity'), { code: '42501' });
      },
    };
    const result = await new ApiHealthController(pool).getApiHealthStatus();
    expect(result.isLiveTelemetry).toBe(true);
    expect(result.dbLatencyMs).toBeGreaterThanOrEqual(1);
    expect(result.systemTelemetry.activeDbConnections).toBeNull();
    expect(result.systemTelemetry.dbCacheHitRatio).toBeNull();
    expect(result.globalSuccessRate).toBeNull();
  });

  it('reports a failed database probe without synthetic uptime or latency', async () => {
    const pool: Queryable = {
      async query<R extends import('pg').QueryResultRow>(): Promise<{ rows: R[] }> {
        throw new Error('connection refused');
      },
    };
    const result = await new ApiHealthController(pool).getApiHealthStatus();
    expect(result.status).toBe('DEGRADED');
    expect(result.isLiveTelemetry).toBe(false);
    expect(result.dbLatencyMs).toBeNull();
    expect(result.globalSuccessRate).toBeNull();
  });

  it('does not report synthetic domain probes as healthy or measured', async () => {
    const result = await new ApiHealthController(null).getApiHealthStatus();
    expect(result.isLiveTelemetry).toBe(false);
    expect(result.dbLatencyMs).toBeNull();
    expect(result.globalSuccessRate).toBeNull();
    expect(result.averageLatencyMs).toBeNull();
    expect(result.domains.length).toBe(14);
    for (const domain of result.domains) {
      expect(domain.status).toBe('UNKNOWN');
      expect(domain.latencyMs).toBeNull();
      expect(domain.successRate).toBeNull();
    }
  });
});
