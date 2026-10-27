import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it, vi } from 'vitest';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { ApiHealthController } from './api-health.controller';

describe('admin API health evidence (QA #1510)', () => {
  it('reports unknown domains and no invented success rate when no pool is configured', async () => {
    const result = await new ApiHealthController().getApiHealthStatus();
    expect(result.status).toBe('UNKNOWN');
    expect(result.globalSuccessRate).toBeNull();
    expect(result.averageLatencyMs).toBeNull();
    expect(result.dbLatencyMs).toBeNull();
    expect(result.isLiveTelemetry).toBe(false);
    expect(result.domains.length).toBeGreaterThan(10);
    for (const domain of result.domains) {
      expect(domain.status).toBe('UNKNOWN');
      expect(domain.latencyMs).toBeNull();
      expect(domain.successRate).toBeNull();
      expect(domain.measuredAt).toBeNull();
      expect(domain.measurementSource).toBe('NOT_MEASURED');
    }
  });

  it('does not infer wallet/bank uptime from a successful DB ping', async () => {
    const query = vi.fn(async (sql: string) => {
      if (sql.includes('SELECT 1 AS ping')) return { rows: [{ ping: 1 }] };
      if (sql.includes('pg_stat_activity')) return { rows: [{ count: '3' }] };
      if (sql.includes('pg_stat_database')) return { rows: [{ ratio: '98.7' }] };
      throw new Error('unexpected query');
    });
    const result = await new ApiHealthController({ query }).getApiHealthStatus();
    expect(result.dbProbe.status).toBe('OPERATIONAL');
    expect(result.dbProbe.measuredAt).toMatch(/^\d{4}-\d\d-\d\dT/);
    expect(result.status).toBe('UNKNOWN');
    expect(result.globalSuccessRate).toBeNull();
    expect(result.domains.find((d) => d.id === 'wallet')).toMatchObject({
      status: 'UNKNOWN', latencyMs: null, successRate: null,
    });
    expect(result.domains.find((d) => d.id === 'bank')?.status).toBe('UNKNOWN');
    expect(query).toHaveBeenCalledTimes(3);
  });

  it('reports degraded DB and unknown API domains on a failed DB probe', async () => {
    const result = await new ApiHealthController({ query: vi.fn(async () => { throw new Error('offline'); }) }).getApiHealthStatus();
    expect(result.dbProbe.status).toBe('DEGRADED');
    expect(result.status).toBe('DEGRADED');
    expect(result.globalSuccessRate).toBeNull();
    expect(result.domains.every((d) => d.status === 'UNKNOWN')).toBe(true);
  });

  it('does not attest database health when the ping query returns no evidence', async () => {
    const result = await new ApiHealthController({ query: vi.fn(async () => ({ rows: [] })) }).getApiHealthStatus();
    expect(result.dbProbe.status).toBe('DEGRADED');
    expect(result.dbLatencyMs).toBeNull();
    expect(result.globalSuccessRate).toBeNull();
  });

  it('retains session, authentication, consent and admin guards', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, ApiHealthController) as unknown[];
    expect(guards).toEqual([SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard]);
  });
});
