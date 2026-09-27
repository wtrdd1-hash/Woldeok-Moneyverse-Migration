import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SeoService } from './seo.service';

@Injectable()
export class SeoCronPingService implements OnModuleInit {
  private readonly logger = new Logger(SeoCronPingService.name);
  private timer: NodeJS.Timeout | null = null;
  private lastPingResult: {
    readonly timestamp: string;
    readonly success: boolean;
    readonly totalUrls: number;
  } | null = null;

  constructor(private readonly seoService: SeoService) {}

  onModuleInit() {
    // 6-hour interval (21,600,000 ms)
    const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

    // Initial delayed ping after 30 seconds of server boot
    setTimeout(() => {
      void this.executePeriodicPing();
    }, 30_000);

    this.timer = setInterval(() => {
      void this.executePeriodicPing();
    }, SIX_HOURS_MS);

    this.logger.log('SeoCronPingService initialized: 6-hour automated IndexNow & Sitemap ping scheduled.');
  }

  async executePeriodicPing(): Promise<{
    readonly success: boolean;
    readonly timestamp: string;
    readonly submittedUrlsCount: number;
  }> {
    try {
      this.logger.log('Executing automated 6-hour SEO IndexNow & Sitemap Ping...');
      const result = await this.seoService.submitUrls();

      this.lastPingResult = {
        timestamp: result.timestamp,
        success: result.success,
        totalUrls: result.submittedUrls.length,
      };

      this.logger.log(
        `Automated SEO Ping completed successfully: ${result.submittedUrls.length} URLs submitted to IndexNow & Google.`,
      );

      return {
        success: true,
        timestamp: result.timestamp,
        submittedUrlsCount: result.submittedUrls.length,
      };
    } catch (err) {
      this.logger.error(`Automated SEO Ping failed: ${(err as Error).message}`);
      return {
        success: false,
        timestamp: new Date().toISOString(),
        submittedUrlsCount: 0,
      };
    }
  }

  getLastPingResult() {
    return this.lastPingResult;
  }
}
