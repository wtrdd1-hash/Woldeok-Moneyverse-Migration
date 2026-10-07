import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { safeFetch } from '../security/ssrf-defense';

export interface TwitterConfig {
  readonly apiKey: string;
  readonly apiSecret: string;
  readonly accessToken: string;
  readonly accessSecret: string;
}

export interface TweetResult {
  readonly success: boolean;
  readonly tweetId?: string | undefined;
  readonly text?: string | undefined;
  readonly error?: string | undefined;
  readonly configured: boolean;
}

@Injectable()
export class TwitterPublisherService {
  private readonly logger = new Logger(TwitterPublisherService.name);
  private readonly baseUrl = 'https://api.twitter.com/2/tweets';

  private getConfig(): TwitterConfig | null {
    const apiKey = (process.env.TWITTER_API_KEY || process.env.X_API_KEY || '').trim();
    const apiSecret = (process.env.TWITTER_API_SECRET || process.env.X_API_SECRET || '').trim();
    const accessToken = (process.env.TWITTER_ACCESS_TOKEN || process.env.X_ACCESS_TOKEN || '').trim();
    const accessSecret = (process.env.TWITTER_ACCESS_SECRET || process.env.X_ACCESS_SECRET || '').trim();

    if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
      return null;
    }

    return { apiKey, apiSecret, accessToken, accessSecret };
  }

  isConfigured(): boolean {
    return this.getConfig() !== null;
  }

  getStatus(): { configured: boolean; hasApiKey: boolean; hasAccessToken: boolean } {
    const config = this.getConfig();
    return {
      configured: config !== null,
      hasApiKey: Boolean(process.env.TWITTER_API_KEY || process.env.X_API_KEY),
      hasAccessToken: Boolean(process.env.TWITTER_ACCESS_TOKEN || process.env.X_ACCESS_TOKEN),
    };
  }

  /**
   * Twitter API v2 POST /2/tweets 엔드포인트로 OAuth 1.0a User Context 서명을 생성하여 트윗을 발행합니다.
   * Free 티어 월 1,500회 쓰기 한도를 엄격히 준수합니다.
   */
  async publishTweet(text: string): Promise<TweetResult> {
    const config = this.getConfig();
    if (!config) {
      this.logger.log(`Twitter API credentials not configured. Tweet skipped: "${text.slice(0, 50)}..."`);
      return {
        success: false,
        configured: false,
        error: 'TWITTER_CREDENTIALS_NOT_CONFIGURED',
      };
    }

    const trimmedText = text.trim();
    if (!trimmedText) {
      return {
        success: false,
        configured: true,
        error: 'EMPTY_TWEET_TEXT',
      };
    }

    try {
      const oauthHeader = this.generateOAuthHeader('POST', this.baseUrl, config);

      const response = await safeFetch(this.baseUrl, {
        method: 'POST',
        headers: {
          Authorization: oauthHeader,
          'Content-Type': 'application/json',
          'User-Agent': 'Moneyverse-X-Publisher/1.0',
        },
        body: JSON.stringify({ text: trimmedText }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.warn(`Twitter API post failed [${response.status}]: ${errorBody}`);
        return {
          success: false,
          configured: true,
          error: `HTTP_${response.status}: ${errorBody.slice(0, 200)}`,
        };
      }

      const json = (await response.json()) as { data?: { id?: string; text?: string } };
      const tweetId = json.data?.id;
      this.logger.log(`Tweet published successfully [ID: ${tweetId}]: "${trimmedText.slice(0, 40)}..."`);

      return {
        success: true,
        configured: true,
        tweetId: tweetId ?? undefined,
        text: trimmedText,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Exception while publishing tweet: ${message}`);
      return {
        success: false,
        configured: true,
        error: message,
      };
    }
  }

  /**
   * 일일 경제 시황 뉴스 생성 시 자동으로 X(트위터)에 요약과 백링크를 발행합니다.
   */
  async publishNewsBriefTweet(payload: {
    readonly headline: string;
    readonly summary: string;
    readonly path?: string;
  }): Promise<TweetResult> {
    const siteUrl = (process.env.APP_BASE_URL || 'https://easy-scraping.com').replace(/\/$/, '');
    const newsUrl = `${siteUrl}${payload.path || '/newspaper'}`;

    // 280자 제한에 맞춘 최적화 포맷
    const cleanHeadline = payload.headline.slice(0, 80);
    const cleanSummary = payload.summary.slice(0, 90);
    const tweetText = `📰 [월덕 머니버스 실전 경제 시황]\n${cleanHeadline}\n\n${cleanSummary}\n\n👉 브리프 전체보기: ${newsUrl}\n#가상주식 #재테크 #금융 #월덕머니버스`;

    return this.publishTweet(tweetText);
  }

  /**
   * OAuth 1.0a HMAC-SHA1 서명 생성기
   */
  private generateOAuthHeader(
    method: string,
    url: string,
    config: TwitterConfig,
  ): string {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(16).toString('hex');

    const oauthParams: Record<string, string> = {
      oauth_consumer_key: config.apiKey,
      oauth_nonce: nonce,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp,
      oauth_token: config.accessToken,
      oauth_version: '1.0',
    };

    // 1. 파라미터 정렬 및 인코딩
    const sortedKeys = Object.keys(oauthParams).sort();
    const paramString = sortedKeys
      .map((k) => `${this.percentEncode(k)}=${this.percentEncode(oauthParams[k]!)}`)
      .join('&');

    // 2. Base String 생성
    const baseString = `${method.toUpperCase()}&${this.percentEncode(url)}&${this.percentEncode(paramString)}`;

    // 3. Signing Key 생성
    const signingKey = `${this.percentEncode(config.apiSecret)}&${this.percentEncode(config.accessSecret)}`;

    // 4. HMAC-SHA1 서명 계산
    const signature = crypto
      .createHmac('sha1', signingKey)
      .update(baseString)
      .digest('base64');

    oauthParams.oauth_signature = signature;

    // 5. Authorization 헤더 생성
    const headerParams = Object.keys(oauthParams)
      .sort()
      .map((k) => `${this.percentEncode(k)}="${this.percentEncode(oauthParams[k]!)}"`)
      .join(', ');

    return `OAuth ${headerParams}`;
  }

  private percentEncode(str: string): string {
    return encodeURIComponent(str).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  }
}
