import { Injectable, Logger, Optional, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { DiscordAlertService } from '../discord/discord-alert.service';
import { TwitterPublisherService } from './twitter-publisher.service';
import { SeoService } from './seo.service';

export interface DailyDigestResult {
  readonly timestamp: string;
  readonly totalClicks30d: number;
  readonly totalImpressions30d: number;
  readonly avgCtr30d: number;
  readonly avgPosition30d: number;
  readonly topQueriesCount: number;
  readonly discordNotified: boolean;
  readonly twitterPublished?: boolean;
  readonly message: string;
}

const DAILY_INTERVAL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class SeoDailyDigestService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SeoDailyDigestService.name);
  private timer: NodeJS.Timeout | null = null;
  private lastDigestResult: DailyDigestResult | null = null;

  constructor(
    private readonly seoService: SeoService,
    @Optional() private readonly discordAlertService?: DiscordAlertService,
    @Optional() private readonly twitterPublisher?: TwitterPublisherService,
  ) {}

  onModuleInit() {
    // Calculate initial delay to 09:00 KST (UTC+9)
    const now = new Date();
    const kstOffsetMs = 9 * 60 * 60 * 1000;
    const kstNow = new Date(now.getTime() + kstOffsetMs);

    const next0900Kst = new Date(kstNow);
    next0900Kst.setUTCHours(9, 0, 0, 0);
    if (next0900Kst.getTime() <= kstNow.getTime()) {
      next0900Kst.setUTCDate(next0900Kst.getUTCDate() + 1);
    }
    const initialDelayMs = next0900Kst.getTime() - kstNow.getTime();

    // Schedule next 09:00 KST execution
    this.timer = setTimeout(() => {
      this.sendDailyDigest().catch((err) => {
        this.logger.error('Scheduled daily SEO digest failed', err);
      });
      // Then repeat every 24 hours
      this.timer = setInterval(() => {
        this.sendDailyDigest().catch((err) => {
          this.logger.error('Scheduled daily SEO digest failed', err);
        });
      }, DAILY_INTERVAL_MS);
    }, Math.max(10_000, initialDelayMs));
  }

  onModuleDestroy() {
    if (this.timer) {
      clearTimeout(this.timer);
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  getLastDigestResult(): DailyDigestResult | null {
    return this.lastDigestResult;
  }

  async sendDailyDigest(): Promise<DailyDigestResult> {
    const analytics = await this.seoService.getGscAnalytics();
    const top5Queries = analytics.topQueries.slice(0, 5);
    const latestDay = analytics.timeSeries[analytics.timeSeries.length - 1];

    let discordNotified = false;
    if (this.discordAlertService) {
      try {
        const queryListText = top5Queries
          .map(
            (q, idx) =>
              `**${idx + 1}. ${q.query}** — 클릭: \`${q.clicks.toLocaleString()}회\` | 노출: \`${q.impressions.toLocaleString()}회\` | CTR: \`${q.ctr}%\` | 순위: \`${q.position}위\``,
          )
          .join('\n');

        await this.discordAlertService.sendDiscordEmbed({
          title: '📈 [Google Search Console] 일일 SEO 검색 실적 다이제스트',
          description: `월덕 머니버스 검색엔진 유입 지표 및 상위 검색어 랭킹 브리핑입니다. (기준: ${latestDay?.date || '전일'})`,
          color: 0x3b82f6, // Blue
          fields: [
            {
              name: '📊 최근 30일 총 노출수',
              value: `**${analytics.totalImpressions30d.toLocaleString()}회**`,
              inline: true,
            },
            {
              name: '👆 최근 30일 총 클릭수',
              value: `**${analytics.totalClicks30d.toLocaleString()}회**`,
              inline: true,
            },
            {
              name: '🎯 평균 클릭률 (CTR)',
              value: `**${analytics.avgCtr30d}%**`,
              inline: true,
            },
            {
              name: '📍 평균 게재 순위',
              value: `**${analytics.avgPosition30d}위**`,
              inline: true,
            },
            {
              name: '⚡ 최근 1일 성과',
              value: `클릭: **${latestDay?.clicks || 0}회** / 노출: **${(latestDay?.impressions || 0).toLocaleString()}회** (CTR: ${latestDay?.ctr || 0}%)`,
              inline: true,
            },
            {
              name: '🏆 인기 유입 검색어 Top 5',
              value: queryListText || '등록된 검색어 없음',
              inline: false,
            },
          ],
          footer: { text: 'Woldeok Moneyverse SEO Analytics Sentinel' },
          timestamp: new Date().toISOString(),
        });
        discordNotified = true;
      } catch (err) {
        this.logger.warn(`Failed to dispatch discord SEO daily digest: ${(err as Error).message}`);
      }
    }

    let twitterPublished = false;
    if (this.twitterPublisher && this.twitterPublisher.isConfigured()) {
      try {
        const topQueryStr = top5Queries.length > 0 ? top5Queries.map((q) => `#${q.query.replace(/\s+/g, '')}`).slice(0, 3).join(' ') : '#월덕머니버스';
        const tweetText = `📰 [월덕 머니버스 실전 경제 시황]\n가상 경제 시장 펄스 및 일일 경제 리포트가 업데이트되었습니다.\n\n👉 브리프 읽기: https://easy-scraping.com/newspaper\n👉 1초 금융 계산기: https://easy-scraping.com/tools\n\n${topQueryStr} #가상주식 #재테크`;
        const tweetRes = await this.twitterPublisher.publishTweet(tweetText);
        twitterPublished = tweetRes.success;
      } catch (err) {
        this.logger.warn(`Failed to publish daily tweet: ${(err as Error).message}`);
      }
    }

    const result: DailyDigestResult = {
      timestamp: new Date().toISOString(),
      totalClicks30d: analytics.totalClicks30d,
      totalImpressions30d: analytics.totalImpressions30d,
      avgCtr30d: analytics.avgCtr30d,
      avgPosition30d: analytics.avgPosition30d,
      topQueriesCount: top5Queries.length,
      discordNotified,
      twitterPublished,
      message: discordNotified
        ? 'Google Search Console 일일 SEO 요약 리포트가 Discord로 성공적으로 전송되었습니다.'
        : 'Google Search Console 일일 SEO 요약 리포트가 생성되었습니다 (Discord 웹훅 미설정).',
    };

    this.lastDigestResult = result;
    this.logger.log(`Daily SEO digest generated (discordNotified: ${discordNotified}, twitterPublished: ${twitterPublished})`);
    return result;
  }
}
