import os from 'node:os';
import { Controller, Get, Inject, Optional, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { Queryable } from '../core/db';
import { queryOne } from '../core/db';
import { PG_POOL } from '../core/pool.provider';

export interface DomainHealthSummary {
  readonly id: string;
  readonly name: string;
  readonly nameEn: string;
  readonly endpointCount: number;
  readonly status: 'UNVERIFIED';
  readonly latencyMs: null;
  readonly successRate: null;
  readonly sampleEndpoints: readonly string[];
}

@ApiTags('admin')
@Controller('admin/api-health')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard, AdminSessionGuard, CsrfGuard)
export class ApiHealthController {
  constructor(@Optional() @Inject(PG_POOL) private readonly pool: Queryable | null = null) {}

  @Get('status')
  @ApiOperation({ summary: 'Get host and database probe telemetry plus the unverified API domain inventory' })
  async getApiHealthStatus() {
    let measuredDbLatency: number | null = null;
    let dbProbeState: 'ok' | 'failed' | 'unavailable' = 'unavailable';
    let activeConnections: number | null = null;
    let dbCacheHitRatio: number | null = null;

    if (this.pool) {
      const start = Date.now();
      try {
        await queryOne(this.pool, 'SELECT 1 AS ping');
        dbProbeState = 'ok';
        measuredDbLatency = Math.max(1, Date.now() - start);

        const connRow = await queryOne<{ count: string }>(
          this.pool,
          'SELECT count(*)::text AS count FROM pg_stat_activity WHERE datname = current_database()',
        );
        activeConnections = connRow?.count !== undefined && Number.isFinite(Number(connRow.count)) ? Number(connRow.count) : null;

        const cacheRow = await queryOne<{ ratio: string }>(
          this.pool,
          'SELECT round(sum(blks_hit)*100.0/nullif(sum(blks_hit+blks_read), 0), 1)::text AS ratio FROM pg_stat_database WHERE datname = current_database()',
        );
        if (cacheRow?.ratio && Number.isFinite(Number(cacheRow.ratio))) {
          dbCacheHitRatio = Number(cacheRow.ratio);
        }
      } catch {
        dbProbeState = 'failed';
        measuredDbLatency = null;
        activeConnections = null;
        dbCacheHitRatio = null;
      }
    }

    const memUsage = process.memoryUsage();
    const systemTelemetry = {
      cpuLoad1m: os.loadavg()[0] ?? 0,
      cpuCores: os.cpus().length,
      totalMemMb: Math.round(os.totalmem() / (1024 * 1024)),
      freeMemMb: Math.round(os.freemem() / (1024 * 1024)),
      heapUsedMb: Math.round(memUsage.heapUsed / (1024 * 1024)),
      rssMb: Math.round(memUsage.rss / (1024 * 1024)),
      activeDbConnections: activeConnections,
      dbCacheHitRatio,
    };

    const domains: Omit<DomainHealthSummary, 'status' | 'latencyMs' | 'successRate'>[] = [
      {
        id: 'auth',
        name: '인증 및 세션',
        nameEn: 'Authentication & Sessions',
        endpointCount: 9,
        sampleEndpoints: ['/api/v1/auth/session', '/api/v1/auth/local/login', '/api/v1/auth/bootstrap'],
      },
      {
        id: 'account',
        name: '계정 및 보안 센터',
        nameEn: 'Account & Security Center',
        endpointCount: 7,
        sampleEndpoints: ['/api/v1/account', '/api/v1/account/security/sessions', '/api/v1/privacy/data-export'],
      },
      {
        id: 'wallet',
        name: '지갑 및 자산 원장',
        nameEn: 'Wallet & Ledger',
        endpointCount: 4,
        sampleEndpoints: ['/api/v1/wallet/balance', '/api/v1/wallet/transfer', '/api/v1/wallet/transactions'],
      },
      {
        id: 'bank',
        name: '가상 중앙은행 및 채권',
        nameEn: 'Virtual Banking & Bonds',
        endpointCount: 9,
        sampleEndpoints: ['/api/v1/bank/summary', '/api/v1/bank/deposit', '/api/v1/bank/bonds'],
      },
      {
        id: 'work',
        name: '직업 및 일일 커리어',
        nameEn: 'Work & Career Mastery',
        endpointCount: 5,
        sampleEndpoints: ['/api/v1/work/status', '/api/v1/work/careers', '/api/v1/work/tasks/complete'],
      },
      {
        id: 'stocks',
        name: '가상 주식 거래소',
        nameEn: 'Virtual Stock Exchange',
        endpointCount: 8,
        sampleEndpoints: ['/api/v1/stocks', '/api/v1/stocks/CHIPS', '/api/v1/stocks/orders'],
      },
      {
        id: 'businesses',
        name: '사업체 운영 및 상업',
        nameEn: 'Businesses & Operations',
        endpointCount: 4,
        sampleEndpoints: ['/api/v1/businesses', '/api/v1/businesses/acquire', '/api/v1/businesses/:id/settle'],
      },
      {
        id: 'marketplace',
        name: 'P2P 마켓플레이스 및 제작',
        nameEn: 'Marketplace & Crafting',
        endpointCount: 6,
        sampleEndpoints: ['/api/v1/marketplace/listings', '/api/v1/crafting/recipes', '/api/v1/crafting/craft'],
      },
      {
        id: 'shop',
        name: '상점 및 도파민 보상',
        nameEn: 'Shop & Dopamine Engagement',
        endpointCount: 11,
        sampleEndpoints: ['/api/v1/shop/items', '/api/v1/engagement/dopamine/golden-duck', '/api/v1/engagement/dopamine/star-drop'],
      },
      {
        id: 'progression',
        name: '성장 및 시즌 패스',
        nameEn: 'Progression & Seasons',
        endpointCount: 4,
        sampleEndpoints: ['/api/v1/progression/summary', '/api/v1/progression/prestige', '/api/v1/season/current'],
      },
      {
        id: 'board',
        name: '커뮤니티 게시판 및 미디어',
        nameEn: 'Community Board & Media',
        endpointCount: 5,
        sampleEndpoints: ['/api/v1/board/posts', '/api/v1/content/photos/upload'],
      },
      {
        id: 'chat',
        name: '1:1 비공개 쪽지 및 안전',
        nameEn: 'Direct Messages & Safety',
        endpointCount: 5,
        sampleEndpoints: ['/api/v1/chat/threads', '/api/v1/chat/threads/:id/messages', '/api/v1/safety/takedown/request'],
      },
      {
        id: 'clubs',
        name: '클럽 및 개인 공간',
        nameEn: 'Clubs & Spaces',
        endpointCount: 4,
        sampleEndpoints: ['/api/v1/club', '/api/v1/club/create', '/api/v1/space/my-space'],
      },
      {
        id: 'admin',
        name: '관리자 관제 타워 및 국고',
        nameEn: 'Admin Control Tower & Treasury',
        endpointCount: 8,
        sampleEndpoints: ['/api/v1/admin/economy/overview', '/api/v1/admin/treasury/vaults', '/api/v1/admin/audit/logs'],
      },
    ];

    // This is a route catalogue, not an uptime monitor. A successful DB ping
    // must never be promoted into unmeasured domain latency or availability.
    const totalEndpoints = domains.reduce((acc, d) => acc + d.endpointCount, 0);
    return {
      status: dbProbeState === 'ok' ? 'DB_REACHABLE' : dbProbeState === 'failed' ? 'DEGRADED' : 'UNKNOWN',
      dbProbeState,
      serverTime: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      dbLatencyMs: measuredDbLatency,
      isLiveTelemetry: false,
      systemTelemetry,
      totalDomains: domains.length,
      totalEndpoints,
      averageLatencyMs: null,
      globalSuccessRate: null,
      domains: domains.map((domain): DomainHealthSummary => ({
        ...domain,
        status: 'UNVERIFIED',
        latencyMs: null,
        successRate: null,
      })),
    };
  }
}
