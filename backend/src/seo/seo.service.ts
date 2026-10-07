import { BadGatewayException, BadRequestException, Inject, Injectable, Logger, Optional } from '@nestjs/common';
import type { Pool } from 'pg';
import { PG_POOL } from '../core/pool.provider';
import { EncryptionService } from '../security/encryption.service';
import { safeFetch } from '../security/ssrf-defense';
import {
  fetchGscAnalyticsSnapshot,
  parseGscServiceAccount,
  submitGscSitemap as submitGscSitemapApi,
} from './gsc-client';
import type {
  GscAnalyticsSnapshot,
  GscServiceAccount,
  GscSitemapStatus,
  GscSitemapSubmissionResult,
} from './gsc-client';

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

export interface GscTimeSeriesEntry {
  readonly date: string;
  readonly clicks: number;
  readonly impressions: number;
  readonly ctr: number;
  readonly position: number;
}

export interface GscTopQueryEntry {
  readonly query: string;
  readonly clicks: number;
  readonly impressions: number;
  readonly ctr: number;
  readonly position: number;
}

export interface GscAnalyticsData {
  readonly hasCredentials: boolean;
  readonly clientEmail: string | null;
  readonly updatedAt: string | null;
  readonly propertyUrl: string | null;
  readonly source: 'unconfigured' | 'search-console' | 'error';
  readonly syncError: string | null;
  readonly totalClicks30d: number;
  readonly totalImpressions30d: number;
  readonly avgCtr30d: number;
  readonly avgPosition30d: number;
  readonly timeSeries: readonly GscTimeSeriesEntry[];
  readonly topQueries: readonly GscTopQueryEntry[];
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

  // 3 Key Hubs & Calculators
  { path: '/', category: 'hub', name: '월덕 머니버스 메인 포털' },
  { path: '/stocks', category: 'hub', name: '가상 주식 거래소 종합 허브' },
  { path: '/announcements', category: 'hub', name: '공식 공지사항 허브' },
  { path: '/tools', category: 'hub', name: '금융 & 시뮬레이터 도구 허브' },
  { path: '/tools/compound-calculator', category: 'guide', name: '복리 예금·적금 이자 계산기' },
  { path: '/tools/compound-calculator/10m-3y-5p', category: 'guide', name: '1천만원 3년 연 5% 복리 계산기' },
  { path: '/tools/compound-calculator/10m-5y-10p', category: 'guide', name: '1천만원 5년 연 10% 복리 시뮬레이터' },
  { path: '/tools/compound-calculator/monthly-1m-5y', category: 'guide', name: '월 100만원 5년 1억 모으기 적금' },
  { path: '/tools/compound-calculator/50m-1y-7p', category: 'guide', name: '5천만원 1년 연 7% 정기예금 이자' },
  { path: '/tools/compound-calculator/100m-10y-15p', category: 'guide', name: '1억원 10년 15% 가상 복리 투자' },
  { path: '/tools/stock-calculator', category: 'guide', name: '주식 물타기·평단가 계산기' },
  { path: '/tools/stock-calculator/chips-minus-20', category: 'guide', name: 'CHIPS -20% 물타기 계산기' },
  { path: '/tools/stock-calculator/ducks-minus-50', category: 'guide', name: 'DUCKS -50% 반토막 2배수 탈출' },
  { path: '/tools/stock-calculator/coin-minus-30', category: 'guide', name: 'COIN -30% 손익분기점 매도가' },
  { path: '/tools/farming-calculator', category: 'guide', name: '직업 파밍 수익 시뮬레이터' },
  { path: '/tools/farming-calculator/intern-vs-executive', category: 'guide', name: '인턴 vs 임원 17배 수익 비교' },
  { path: '/tools/farming-calculator/daily-100k-farming-route', category: 'guide', name: '하루 10만 WLD 4시간 파밍 루트' },
  { path: '/newspaper', category: 'hub', name: 'AI 경제 브리프 & 시황 뉴스' },
  { path: '/bonds', category: 'hub', name: '기획재정국채 (KTB) 거래소' },
  { path: '/pension', category: 'hub', name: '국민연금 (NPS) 대국민 포털' },
  { path: '/fx', category: 'hub', name: '서울외환시장 (FX) 실시간 환전' },
  { path: '/kdic', category: 'hub', name: '예금보험공사 (KDIC) 5천만원 예금자보호 포털' },
  { path: '/marketplace/auction', category: 'hub', name: 'P2P 실시간 경매장' },
];

@Injectable()
export class SeoService {
  private readonly logger = new Logger(SeoService.name);
  private readonly memoryLogs: CrawlerLogEntry[] = [];
  private readonly indexNowKey: string;
  private readonly baseUrl: string;

  constructor(
    @Optional() @Inject(PG_POOL) private readonly pool?: Pool,
    @Optional() @Inject(EncryptionService) private readonly encryptionService?: EncryptionService,
  ) {
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

    // 실제 외부 검색엔진 봇만 엄격히 필터링 (내부 테스트/센티널 봇 배제)
    const externalLogs = logs.filter((l) => {
      const name = (l.botName || '').toLowerCase();
      const ua = (l.userAgent || '').toLowerCase();
      const isInternal = name.includes('sentinel') || name.includes('internal') || ua.includes('sentinel');
      return !isInternal;
    });

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    const logs24h = externalLogs.filter((l) => new Date(l.createdAt).getTime() >= oneDayAgo);
    const logs7d = externalLogs.filter((l) => new Date(l.createdAt).getTime() >= sevenDaysAgo);

    const botDistribution: Record<string, number> = {};
    const statusDistribution: Record<string, number> = {};
    let totalDuration = 0;

    for (const log of logs24h) {
      botDistribution[log.botName] = (botDistribution[log.botName] || 0) + 1;
      const statusKey = String(log.statusCode);
      statusDistribution[statusKey] = (statusDistribution[statusKey] || 0) + 1;
      totalDuration += log.durationMs;
    }

    const avgDurationMs = logs24h.length > 0 ? Math.round(totalDuration / logs24h.length) : 0;

    // Calculate Target URL Health (외부 검색엔진 봇 방문 기록 기준)
    const targetUrls: TargetUrlHealth[] = MONITORED_TARGET_URLS.map((target) => {
      const targetLogs = externalLogs.filter((l) => l.path === target.path || l.path.startsWith(`${target.path}?`));
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
          const res = await safeFetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify(indexNowPayload),
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

    // Google Sitemap Ping: Deprecated by Google (2023). External HTTP ping omitted to prevent dead calls.
    const googlePingStatus = 410; // 410 Gone (officially retired by Google)

    return {
      success: true,
      submittedUrls: urlsToSubmit,
      indexNowResponses,
      googlePingStatus,
      timestamp: new Date().toISOString(),
    };
  }

  // --- Google Search Console API & Analytics ---
  private gscCredentialsState: {
    clientEmail: string;
    keyJson: string;
    propertyUrl: string | null;
    updatedAt: string;
  } | null = null;
  private cachedGscAnalytics: { data: GscAnalyticsData; cachedAt: number; ttlMs: number } | null = null;

  private emptyGscAnalytics(
    state: {
      readonly clientEmail: string | null;
      readonly updatedAt: string | null;
      readonly propertyUrl: string | null;
      readonly source: 'unconfigured' | 'error';
      readonly syncError: string | null;
    },
  ): GscAnalyticsData {
    return {
      hasCredentials: state.clientEmail !== null,
      clientEmail: state.clientEmail,
      updatedAt: state.updatedAt,
      propertyUrl: state.propertyUrl,
      source: state.source,
      syncError: state.syncError,
      totalClicks30d: 0,
      totalImpressions30d: 0,
      avgCtr30d: 0,
      avgPosition30d: 0,
      timeSeries: [],
      topQueries: [],
    };
  }

  private encryption(): EncryptionService {
    return this.encryptionService ?? new EncryptionService();
  }

  private safeGscError(error: unknown): string {
    const message = error instanceof Error ? error.message : 'unknown Search Console error';
    return message.replace(/[\r\n]+/g, ' ').slice(0, 300);
  }

  private async loadGscCredentials(): Promise<typeof this.gscCredentialsState> {
    if (this.gscCredentialsState) return this.gscCredentialsState;

    if (this.pool) {
      try {
        const result = await this.pool.query<{
          readonly clientEmail: string;
          readonly keyJsonSealed: string;
          readonly propertyUrl: string | null;
          readonly updatedAt: Date | string;
        }>(
          `SELECT client_email AS "clientEmail",
                  key_json_sealed AS "keyJsonSealed",
                  property_url AS "propertyUrl",
                  updated_at AS "updatedAt"
             FROM public.seo_gsc_credential_runtime()`,
        );
        const row = result.rows[0];
        if (row) {
          const keyJson = this.encryption().decrypt(row.keyJsonSealed);
          if (!keyJson || keyJson.startsWith('enc:v1:')) {
            throw new Error('stored Search Console credential cannot be decrypted');
          }
          const parsed = parseGscServiceAccount(keyJson);
          this.gscCredentialsState = {
            clientEmail: parsed.clientEmail,
            keyJson,
            propertyUrl: row.propertyUrl,
            updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
          };
          return this.gscCredentialsState;
        }
      } catch (error) {
        this.logger.warn(`Failed to load persisted GSC credential: ${this.safeGscError(error)}`);
      }
    }

    const environmentKey = process.env.GSC_SERVICE_ACCOUNT_KEY;
    if (!environmentKey) return null;

    try {
      const parsed = parseGscServiceAccount(environmentKey);
      this.gscCredentialsState = {
        clientEmail: parsed.clientEmail,
        keyJson: environmentKey,
        propertyUrl: process.env.GSC_SITE_URL?.trim() || null,
        updatedAt: new Date().toISOString(),
      };
      return this.gscCredentialsState;
    } catch (error) {
      this.logger.error(`Configured GSC_SERVICE_ACCOUNT_KEY is invalid: ${this.safeGscError(error)}`);
      return null;
    }
  }

  async getGscAnalytics(): Promise<GscAnalyticsData> {
    const now = Date.now();
    if (
      this.cachedGscAnalytics &&
      now - this.cachedGscAnalytics.cachedAt < this.cachedGscAnalytics.ttlMs
    ) {
      return this.cachedGscAnalytics.data;
    }

    const stored = await this.loadGscCredentials();
    if (!stored) {
      const result = this.emptyGscAnalytics({
        clientEmail: null,
        updatedAt: null,
        propertyUrl: null,
        source: 'unconfigured',
        syncError: null,
      });
      this.cachedGscAnalytics = { data: result, cachedAt: now, ttlMs: 60 * 60 * 1000 };
      return result;
    }

    try {
      const credential = parseGscServiceAccount(stored.keyJson);
      const snapshot = await fetchGscAnalyticsSnapshot(
        credential,
        this.baseUrl,
        stored.propertyUrl || process.env.GSC_SITE_URL?.trim() || null,
      );
      if (stored.propertyUrl !== snapshot.propertyUrl) {
        stored.propertyUrl = snapshot.propertyUrl;
      }

      const result: GscAnalyticsData = {
        hasCredentials: true,
        clientEmail: stored.clientEmail,
        updatedAt: stored.updatedAt,
        propertyUrl: snapshot.propertyUrl,
        source: 'search-console',
        syncError: null,
        totalClicks30d: snapshot.totalClicks30d,
        totalImpressions30d: snapshot.totalImpressions30d,
        avgCtr30d: snapshot.avgCtr30d,
        avgPosition30d: snapshot.avgPosition30d,
        timeSeries: snapshot.timeSeries,
        topQueries: snapshot.topQueries,
      };
      this.cachedGscAnalytics = { data: result, cachedAt: now, ttlMs: 60 * 60 * 1000 };
      return result;
    } catch (error) {
      const syncError = this.safeGscError(error);
      this.logger.warn(`Google Search Console sync failed: ${syncError}`);
      const result = this.emptyGscAnalytics({
        clientEmail: stored.clientEmail,
        updatedAt: stored.updatedAt,
        propertyUrl: stored.propertyUrl,
        source: 'error',
        syncError,
      });
      this.cachedGscAnalytics = { data: result, cachedAt: now, ttlMs: 5 * 60 * 1000 };
      return result;
    }
  }

  async saveGscCredentials(
    rawJson: string,
  ): Promise<{ success: boolean; clientEmail: string; propertyUrl: string; message: string }> {
    let credential: GscServiceAccount;
    try {
      credential = parseGscServiceAccount(rawJson);
    } catch (error) {
      throw new BadRequestException(`서비스 계정 키 형식 오류: ${this.safeGscError(error)}`);
    }

    let snapshot: GscAnalyticsSnapshot;
    try {
      snapshot = await fetchGscAnalyticsSnapshot(
        credential,
        this.baseUrl,
        process.env.GSC_SITE_URL?.trim() || null,
      );
    } catch (error) {
      throw new BadRequestException(
        `Google Search Console 연결 검증 실패: ${this.safeGscError(error)}`,
      );
    }

    const sealed = this.encryption().encrypt(rawJson);
    if (!sealed) {
      throw new Error('Search Console credential encryption failed');
    }

    const updatedAt = new Date().toISOString();
    if (this.pool) {
      try {
        const result = await this.pool.query<{ readonly updatedAt: Date | string }>(
          `SELECT public.seo_gsc_credential_set($1, $2, $3) AS "updatedAt"`,
          [credential.clientEmail, sealed, snapshot.propertyUrl],
        );
        const persisted = result.rows[0]?.updatedAt;
        if (persisted) {
          const parsed = persisted instanceof Date ? persisted.toISOString() : String(persisted);
          this.gscCredentialsState = {
            clientEmail: credential.clientEmail,
            keyJson: rawJson,
            propertyUrl: snapshot.propertyUrl,
            updatedAt: parsed,
          };
        }
      } catch (error) {
        this.logger.error(`Failed to persist GSC credential: ${this.safeGscError(error)}`);
        throw new Error('Google Search Console credential persistence failed');
      }
    }

    this.gscCredentialsState ??= {
      clientEmail: credential.clientEmail,
      keyJson: rawJson,
      propertyUrl: snapshot.propertyUrl,
      updatedAt,
    };

    const analytics: GscAnalyticsData = {
      hasCredentials: true,
      clientEmail: credential.clientEmail,
      updatedAt: this.gscCredentialsState.updatedAt,
      propertyUrl: snapshot.propertyUrl,
      source: 'search-console',
      syncError: null,
      totalClicks30d: snapshot.totalClicks30d,
      totalImpressions30d: snapshot.totalImpressions30d,
      avgCtr30d: snapshot.avgCtr30d,
      avgPosition30d: snapshot.avgPosition30d,
      timeSeries: snapshot.timeSeries,
      topQueries: snapshot.topQueries,
    };
    this.cachedGscAnalytics = {
      data: analytics,
      cachedAt: Date.now(),
      ttlMs: 60 * 60 * 1000,
    };

    return {
      success: true,
      clientEmail: credential.clientEmail,
      propertyUrl: snapshot.propertyUrl,
      message: `Google Search Console 서비스 계정(${credential.clientEmail}) 연결을 검증하고 저장했습니다.`,
    };
  }

  async submitGscSitemap(
    customSitemapUrl?: string,
  ): Promise<GscSitemapStatus & { readonly success: true; readonly message: string; readonly directConsoleUrl: string }> {
    if (process.env.SEO_INDEXING_ENABLED === 'false') {
      throw new BadRequestException('Google Search Console 사이트맵 제출은 운영 환경에서만 허용됩니다.');
    }

    const stored = await this.loadGscCredentials();
    if (!stored) {
      throw new BadRequestException('Google Search Console 서비스 계정을 먼저 등록해 주세요.');
    }

    const credential = parseGscServiceAccount(stored.keyJson);
    const sitemapUrl = customSitemapUrl?.trim() || `${this.baseUrl}/sitemap.xml`;
    try {
      const status = await submitGscSitemapApi(
        credential,
        this.baseUrl,
        stored.propertyUrl || process.env.GSC_SITE_URL?.trim() || null,
        sitemapUrl,
      );
      if (stored.propertyUrl !== status.propertyUrl) {
        stored.propertyUrl = status.propertyUrl;
      }
      const directConsoleUrl = `https://search.google.com/search-console/sitemaps?resource_id=${encodeURIComponent(status.propertyUrl)}`;
      return {
        success: true,
        ...status,
        directConsoleUrl,
        message: 'Google Search Console에 운영 사이트맵을 등록/갱신했습니다.',
      };
    } catch (error) {
      throw new BadGatewayException(
        `Google Search Console 사이트맵 제출 실패: ${this.safeGscError(error)}`,
      );
    }
  }

  async deleteGscCredentials(): Promise<{ success: boolean; message: string }> {
    if (process.env.GSC_SERVICE_ACCOUNT_KEY) {
      throw new BadRequestException('배포 환경변수로 설정된 Search Console 키는 관리자 화면에서 삭제할 수 없습니다.');
    }
    if (this.pool) {
      await this.pool.query('SELECT public.seo_gsc_credential_delete()');
    }
    this.gscCredentialsState = null;
    this.cachedGscAnalytics = null;
    return {
      success: true,
      message: 'Google Search Console 서비스 계정 키가 삭제되었습니다.',
    };
  }
}

