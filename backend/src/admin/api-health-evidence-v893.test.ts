import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { ApiHealthController } from './api-health.controller';

describe('API health evidence', () => {
  it('does not claim unmeasured API availability', async () => {
    const result = await new ApiHealthController(null).getApiHealthStatus();
    expect(result.status).toBe('UNKNOWN');
    expect(result.globalSuccessRate).toBeNull();
    expect(result.averageLatencyMs).toBeNull();
    expect(result.dbLatencyMs).toBeNull();
    expect(result.domains.every(d => d.status === 'UNKNOWN' && d.latencyMs === null && d.successRate === null)).toBe(true);
  });

  it('requires admin role and active admin session', () => {
    const guards = (Reflect.getMetadata(GUARDS_METADATA, ApiHealthController) as unknown[]) ?? [];
    expect(guards).toContain(AdminGuard);
    expect(guards).toContain(AdminSessionGuard);
  });
  it('does not invent a cache hit ratio when no DB samples exist', async () => {
    const query = vi.fn(async (sql: string) => {
      if (sql.includes('SELECT 1 AS ping')) return { rows: [{ ping: 1 }] };
      if (sql.includes('pg_stat_activity')) return { rows: [{ count: '1' }] };
      if (sql.includes('pg_stat_database')) {
        expect(sql).not.toContain('99.9');
        return { rows: [{ ratio: null }] };
      }
      throw new Error('Unexpected SQL');
    });
    const result = await new ApiHealthController({ query } as unknown as Queryable).getApiHealthStatus();
    expect(result.dbStatus).toBe('OPERATIONAL');
    expect(result.systemTelemetry.dbCacheHitRatio).toBeNull();
    expect(result.globalSuccessRate).toBeNull();
  });

  it('does not report API success when the DB ping fails', async () => {
    const pool = { query: vi.fn(async () => { throw new Error('DB unavailable'); }) };
    const result = await new ApiHealthController(pool as unknown as Queryable).getApiHealthStatus();
    expect(result.dbStatus).toBe('DEGRADED');
    expect(result.status).toBe('DEGRADED');
    expect(result.globalSuccessRate).toBeNull();
    expect(result.dbLatencyMs).toBeNull();
  });

});
