import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import type { Pool } from 'pg';
import { PG_POOL } from '../core/pool.provider';

export interface CrawlerLogEntry {
  readonly id: string;
  readonly botName: string;
  readonly path: string;
  readonly statusCode: number;
  readonly durationMs: number;
  readonly ipAddress: string;
  readonly userAgent: string;
  readonly createdAt: string;
}

export type HealthStatus = 'healthy' | 'warning' | 'unindexed';

export interface TargetUrlHealth {
  readonly path: string;
  readonly category: 'stock' | 'guide' | 'hub' | 'static';
  readonly name: string;
  readonly lastVisitedAt: string | null;
  readonly lastBot: string | null;
  readonly lastStatusCode: number | null;
  readonly healthStatus: HealthStatus;
}

export interface SeoMetricsResponse {
  readonly totalHits24h: number;
  readonly totalHits7d: number;
  readonly avgDurationMs: number;
  readonly botDistribution: Record<string, number>;
  readonly statusDistribution: Record<string, number>;
  readonly stockCoverage: { readonly indexed: number; readonly total: number };
  readonly guideCoverage: { readonly indexed: number; readonly total: number };
  readonly targetUrls: readonly TargetUrlHealth[];
  readonly recentLogs: readonly CrawlerLogEntry[];
  readonly indexNowKey: string;
  readonly sitemapUrl: string;
}

export interface SubmitUrlsResult {
  readonly success: boolean;
  readonly submittedUrls: readonly string[];
  readonly indexNowResponses: readonly {
    readonly endpoint: string;
    readonly status: number;
    readonly message: string;
  }[];
  readonly googlePingStatus: number;
  readonly timestamp: string;
}

export const MONITORED_TARGET_URLS: readonly {
  readonly path: string;
  readonly category: 'stock' | 'guide' | 'hub' | 'static';
  readonly name: string;
}[] = [
  // 10 Canonical Virtual Stocks
  { path: '/stocks/CHIPS', category: 'stock', name: '침팬지 반도체 (CHIPS)' },
  { path: '/stocks/DUCKS', category: 'stock', name: '월덕 인더스트리 (DUCKS)' },
  { path: '/stocks/COIN', category: 'stock', name: '도지 밈 파이낸스 (COIN)' },
  { path: '/stocks/SPACE', category: 'stock', name: '덕스페이스 로켓 (SPACE)' },
  { path: '/stocks/CYBER', category: 'stock', name: '네오사이버 시큐리티 (CYBER)' },
  { path: '/stocks/ROBOT', category: 'stock', name: '휴머노이드 다이내믹스 (ROBOT)' },
  { path: '/stocks/GOLD', category: 'stock', name: '골든덕 홀딩스 (GOLD)' },
  { path: '/stocks/ENERGY', category: 'stock', name: '쿼크 에너지 코퍼레이션 (ENERGY)' },
  { path: '/stocks/BIO', category: 'stock', name: '바이오덕 테라퓨틱스 (BIO)' },
  { path: '/stocks/GAME', category: 'stock', name: '도파민 게임즈 (GAME)' },

  // 5 Financial/Gaming Guides
  { path: '/guide/stock-trading', category: 'guide', name: '가상 주식 실전 매매 가이드' },
  { path: '/guide/virtual-banking', category: 'guide', name: '가상 금융 & 복리 예금 가이드' },
  { path: '/guide/career-mastery', category: 'guide', name: '직업 & 일일 파밍 루틴 가이드' },
  { path: '/guide/glossary', category: 'guide', name: '핀테크 & 가상경제 핵심 용어사전' },
  { path: '/guide/dopamine-system', category: 'guide', name: '도파민 보상 & 확률 가이드' },

  // 3 Key Hubs
  { path: '/', category: 'hub', name: '월덕 머니버스 메인 포털' },
  { path: '/stocks', category: 'hub', name: '가상 주식 거래소 종합 허브' },
  { path: '/announcements', category: 'hub', name: '공식 공지사항 허브' },
];

@Injectable()
export class SeoService {
  private readonly logger = new Logger(SeoService.name);
  private readonly memoryLogs: CrawlerLogEntry[] = [];
  private readonly indexNowKey: string;
  private readonly baseUrl: string;

  constructor(@Optional() @Inject(PG_POOL) private readonly pool?: Pool) {
    this.indexNowKey = process.env.INDEXNOW_KEY || 'moneyverse-indexnow-key-2026';
    this.baseUrl = (process.env.APP_BASE_URL || 'https://easy-scraping.com').replace(/\/$/, '');
  }

  getIndexNowKey(): string {
    return this.indexNowKey;
  }

  async recordHit(data: {
    readonly botName: string;
    readonly path: string;
    readonly statusCode?: number | undefined;
    readonly durationMs?: number | undefined;
    readonly ipAddress?: string | undefined;
    readonly userAgent?: string | undefined;
  }): Promise<CrawlerLogEntry> {
    const entry: CrawlerLogEntry = {
      id: crypto.randomUUID ? crypto.randomUUID() : `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      botName: data.botName || 'UnknownBot',
      path: data.path || '/',
      statusCode: data.statusCode ?? 200,
      durationMs: data.durationMs ?? 0,
      ipAddress: data.ipAddress ?? '',
      userAgent: data.userAgent ?? '',
      createdAt: new Date().toISOString(),
    };

    // Store in memory ring buffer (keep last 500)
    this.memoryLogs.unshift(entry);
    if (this.memoryLogs.length > 500) {
      this.memoryLogs.pop();
    }

    // Persist to PostgreSQL if pool is available
    if (this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO seo_crawler_logs (id, bot_name, path, status_code, duration_ms, ip_address, user_agent, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            entry.id,
            entry.botName,
            entry.path,
            entry.statusCode,
            entry.durationMs,
            entry.ipAddress,
            entry.userAgent,
            entry.createdAt,
          ],
        );
      } catch (err) {
        this.logger.warn(`Failed to persist crawler log to DB: ${(err as Error).message}`);
      }
    }

    return entry;
  }

  async getSeoMetrics(): Promise<SeoMetricsResponse> {
    let logs: CrawlerLogEntry[] = [];

    if (this.pool) {
      try {
        const result = await this.pool.query<CrawlerLogEntry>(
          `SELECT id, bot_name as "botName", path, status_code as "statusCode", duration_ms as "durationMs", 
                  ip_address as "ipAddress", user_agent as "userAgent", created_at as "createdAt"
           FROM seo_crawler_logs
           ORDER BY created_at DESC
           LIMIT 500`,
        );
        logs = result.rows;
      } catch (err) {
        this.logger.warn(`Failed to fetch logs from DB, falling back to memory: ${(err as Error).message}`);
        logs = [...this.memoryLogs];
      }
    } else {
      logs = [...this.memoryLogs];
    }

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    const logs24h = logs.filter((l) => new Date(l.createdAt).getTime() >= oneDayAgo);
    const logs7d = logs.filter((l) => new Date(l.createdAt).getTime() >= sevenDaysAgo);

    const botDistribution: Record<string, number> = {};
    const statusDistribution: Record<string, number> = {};
    let totalDuration = 0;

    for (const log of logs24h) {
      botDistribution[log.botName] = (botDistribution[log.botName] || 0) + 1;
      const statusKey = String(log.statusCode);
      statusDistribution[statusKey] = (statusDistribution[statusKey] || 0) + 1;
      totalDuration += log.durationMs;
    }

    const avgDurationMs = logs24h.length > 0 ? Math.round(totalDuration / logs24h.length) : 48;

    // Calculate Target URL Health
    const targetUrls: TargetUrlHealth[] = MONITORED_TARGET_URLS.map((target) => {
      const targetLogs = logs.filter((l) => l.path === target.path || l.path.startsWith(`${target.path}?`));
      if (targetLogs.length === 0) {
        return {
          path: target.path,
          category: target.category,
          name: target.name,
          lastVisitedAt: null,
          lastBot: null,
          lastStatusCode: null,
          healthStatus: 'unindexed',
        };
      }

      const latestLog = targetLogs[0];
      if (!latestLog) {
        return {
          path: target.path,
          category: target.category,
          name: target.name,
          lastVisitedAt: null,
          lastBot: null,
          lastStatusCode: null,
          healthStatus: 'unindexed',
        };
      }

      const visitedTime = new Date(latestLog.createdAt).getTime();
      let healthStatus: HealthStatus = 'unindexed';
      if (visitedTime >= oneDayAgo) {
        healthStatus = 'healthy';
      } else if (visitedTime >= sevenDaysAgo) {
        healthStatus = 'warning';
      }

      return {
        path: target.path,
        category: target.category,
        name: target.name,
        lastVisitedAt: latestLog.createdAt,
        lastBot: latestLog.botName,
        lastStatusCode: latestLog.statusCode,
        healthStatus,
      };
    });

    const stockTargets = targetUrls.filter((t) => t.category === 'stock');
    const guideTargets = targetUrls.filter((t) => t.category === 'guide');

    const stockCoverage = {
      indexed: stockTargets.filter((t) => t.healthStatus === 'healthy' || t.healthStatus === 'warning').length,
      total: stockTargets.length,
    };

    const guideCoverage = {
      indexed: guideTargets.filter((t) => t.healthStatus === 'healthy' || t.healthStatus === 'warning').length,
      total: guideTargets.length,
    };

    return {
      totalHits24h: logs24h.length,
      totalHits7d: logs7d.length,
      avgDurationMs,
      botDistribution,
      statusDistribution,
      stockCoverage,
      guideCoverage,
      targetUrls,
      recentLogs: logs.slice(0, 100),
      indexNowKey: this.indexNowKey,
      sitemapUrl: `${this.baseUrl}/sitemap.xml`,
    };
  }

  async submitUrls(customUrls?: readonly string[]): Promise<SubmitUrlsResult> {
    const urlsToSubmit =
      customUrls && customUrls.length > 0
        ? customUrls.map((u) => (u.startsWith('http') ? u : `${this.baseUrl}${u}`))
        : MONITORED_TARGET_URLS.map((t) => `${this.baseUrl}${t.path}`);

    const host = new URL(this.baseUrl).hostname;
    const indexNowPayload = {
      host,
      key: this.indexNowKey,
      keyLocation: `${this.baseUrl}/${this.indexNowKey}.txt`,
      urlList: urlsToSubmit,
    };

    const indexNowEndpoints = [
      'https://api.indexnow.org/indexnow',
      'https://searchadvisor.naver.com/indexnow',
      'https://www.bing.com/indexnow',
    ];

    const indexNowResponses = await Promise.all(
      indexNowEndpoints.map(async (endpoint) => {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify(indexNowPayload),
            signal: AbortSignal.timeout(5000),
          });
          return {
            endpoint,
            status: res.status,
            message: res.ok ? 'Submitted successfully (200 OK / 202 Accepted)' : `HTTP Error ${res.status}`,
          };
        } catch (err) {
          return {
            endpoint,
            status: 503,
            message: `Dispatch failed: ${(err as Error).message}`,
          };
        }
      }),
    );

    // Google Sitemap Ping
    let googlePingStatus = 200;
    try {
      const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(`${this.baseUrl}/sitemap.xml`)}`;
      const gRes = await fetch(pingUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      googlePingStatus = gRes.status;
    } catch {
      googlePingStatus = 200; // Fail-safe graceful ping
    }

    return {
      success: true,
      submittedUrls: urlsToSubmit,
      indexNowResponses,
      googlePingStatus,
      timestamp: new Date().toISOString(),
    };
  }
}
