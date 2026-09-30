import { Injectable, Logger, Optional, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { DiscordAlertService } from '../discord/discord-alert.service';
import { MONITORED_TARGET_URLS, SeoService } from './seo.service';
import { safeFetch } from '../security/ssrf-defense';

export interface CrawlAuditResult {
  readonly timestamp: string;
  readonly totalUrlsChecked: number;
  readonly healthyUrls: number;
  readonly errorUrls: number;
  readonly issues: readonly {
    readonly path: string;
    readonly name: string;
    readonly statusCode: number;
    readonly reason: string;
  }[];
  readonly discordNotified: boolean;
}

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

@Injectable()
export class SeoCrawlerAuditService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SeoCrawlerAuditService.name);
  private timer: NodeJS.Timeout | null = null;
  private lastAuditResult: CrawlAuditResult | null = null;

  constructor(
    private readonly seoService: SeoService,
    @Optional() private readonly discordAlertService?: DiscordAlertService,
  ) {}

  onModuleInit() {
    // Start initial audit 45 seconds after boot, then every 6 hours
    setTimeout(() => {
      this.runCrawlAudit().catch((err) => {
        this.logger.error('Initial SEO crawl audit failed', err);
      });
    }, 45_000);

    this.timer = setInterval(() => {
      this.runCrawlAudit().catch((err) => {
        this.logger.error('Scheduled SEO crawl audit failed', err);
      });
    }, SIX_HOURS_MS);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  getLastAuditResult(): CrawlAuditResult | null {
    return this.lastAuditResult;
  }

  async runCrawlAudit(): Promise<CrawlAuditResult> {
    const baseUrl = (process.env.APP_BASE_URL || 'https://easy-scraping.com').replace(/\/$/, '');
    const issues: { path: string; name: string; statusCode: number; reason: string }[] = [];
    let healthyCount = 0;

    for (const target of MONITORED_TARGET_URLS) {
      try {
        const url = `${baseUrl}${target.path}`;
        const res = await safeFetch(url, {
          method: 'HEAD',
          headers: { 'User-Agent': 'Moneyverse-SEO-Sentinel/1.0 (AuditBot)' },
        });

        if (res.ok || res.status === 200 || res.status === 307 || res.status === 308) {
          healthyCount++;
          // Record internal audit bot hit
          await this.seoService.recordHit({
            botName: 'Moneyverse-SEO-Sentinel',
            path: target.path,
            statusCode: res.status,
            durationMs: 30,
          });
        } else {
          issues.push({
            path: target.path,
            name: target.name,
            statusCode: res.status,
            reason: `HTTP ${res.status} 비정상 응답`,
          });
        }
      } catch (err) {
        issues.push({
          path: target.path,
          name: target.name,
          statusCode: 503,
          reason: `연결 타임아웃/실패: ${(err as Error).message}`,
        });
      }
    }

    let discordNotified = false;
    if (issues.length > 0 && this.discordAlertService) {
      try {
        await this.discordAlertService.sendDiscordEmbed({
          title: '🚨 [SEO 경보] 검색 엔진 크롤링 실패 및 404/500 URL 감지',
          description: `총 ${MONITORED_TARGET_URLS.length}개 대상 URL 중 ${issues.length}개 경로에서 색인 실패 또는 오류가 감지되었습니다.`,
          color: 0xef4444,
          fields: issues.slice(0, 10).map((issue) => ({
            name: `${issue.name} (\`${issue.path}\`)`,
            value: `상태: **HTTP ${issue.statusCode}** (${issue.reason})`,
            inline: false,
          })),
        });
        discordNotified = true;
      } catch (err) {
        this.logger.warn(`Failed to dispatch discord SEO alert: ${(err as Error).message}`);
      }
    }

    const result: CrawlAuditResult = {
      timestamp: new Date().toISOString(),
      totalUrlsChecked: MONITORED_TARGET_URLS.length,
      healthyUrls: healthyCount,
      errorUrls: issues.length,
      issues,
      discordNotified,
    };

    this.lastAuditResult = result;
    this.logger.log(`SEO crawl audit completed: ${healthyCount}/${MONITORED_TARGET_URLS.length} healthy (${issues.length} issues)`);
    return result;
  }
}
