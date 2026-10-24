import os from 'node:os';
import { Controller, Get, Inject, Optional, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { Queryable } from '../core/db';
import { queryOne } from '../core/db';
import { PG_POOL } from '../core/pool.provider';

/**
 * A database ping measures one database request. It cannot establish
 * per-route availability, fleet-wide success rate or backup integrity.
 */
@ApiTags('admin')
@Controller('admin/api-health')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard, AdminSessionGuard)
export class ApiHealthController {
  constructor(@Optional() @Inject(PG_POOL) private readonly pool: Queryable | null = null) {}

  @Get('status')
  @ApiOperation({ summary: 'Read measured host and PostgreSQL telemetry for an open admin console' })
  async getApiHealthStatus() {
    let status: 'HEALTHY' | 'DEGRADED' | 'UNKNOWN' = 'UNKNOWN';
    let dbLatencyMs: number | null = null;
    let activeDbConnections: number | null = null;
    let dbCacheHitRatio: number | null = null;

    if (this.pool) {
      const started = performance.now();
      try {
        await queryOne(this.pool, 'SELECT 1 AS ping');
        dbLatencyMs = Math.max(0, Math.round(performance.now() - started));
        status = 'HEALTHY';

        // Statistics are optional. A restricted role may be able to ping
        // PostgreSQL without permission to inspect other sessions.
        try {
          const conn = await queryOne<{ count: string }>(
            this.pool,
            'SELECT count(*)::text AS count FROM pg_stat_activity WHERE datname = current_database()',
          );
          const parsed = Number(conn?.count);
          if (conn && Number.isFinite(parsed) && parsed >= 0) activeDbConnections = parsed;
        } catch {
          activeDbConnections = null;
        }

        try {
          const cache = await queryOne<{ ratio: string | null }>(
            this.pool,
            'SELECT round(sum(blks_hit)*100.0/nullif(sum(blks_hit+blks_read), 0), 1)::text AS ratio FROM pg_stat_database WHERE datname = current_database()',
          );
          const parsed = Number(cache?.ratio);
          if (cache?.ratio !== null && cache?.ratio !== undefined && Number.isFinite(parsed) && parsed >= 0 && parsed <= 100) {
            dbCacheHitRatio = parsed;
          }
        } catch {
          dbCacheHitRatio = null;
        }
      } catch {
        status = 'DEGRADED';
        dbLatencyMs = null;
      }
    }

    const memory = process.memoryUsage();
    return {
      status,
      serverTime: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      dbLatencyMs,
      systemTelemetry: {
        cpuLoad1m: os.loadavg()[0] ?? 0,
        cpuCores: os.availableParallelism(),
        totalMemMb: Math.round(os.totalmem() / (1024 * 1024)),
        freeMemMb: Math.round(os.freemem() / (1024 * 1024)),
        heapUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
        rssMb: Math.round(memory.rss / (1024 * 1024)),
        activeDbConnections,
        dbCacheHitRatio,
      },
    };
  }
}
