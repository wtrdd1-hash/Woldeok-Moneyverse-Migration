import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TwitterPublisherService } from './twitter-publisher.service';

describe('TwitterPublisherService', () => {
  let service: TwitterPublisherService;

  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.TWITTER_API_KEY;
    delete process.env.TWITTER_API_SECRET;
    delete process.env.TWITTER_ACCESS_TOKEN;
    delete process.env.TWITTER_ACCESS_SECRET;
    delete process.env.X_API_KEY;
    delete process.env.X_API_SECRET;
    delete process.env.X_ACCESS_TOKEN;
    delete process.env.X_ACCESS_SECRET;
    service = new TwitterPublisherService();
  });

  it('should return configured false when credentials are missing', () => {
    expect(service.isConfigured()).toBe(false);
    const status = service.getStatus();
    expect(status.configured).toBe(false);
    expect(status.hasApiKey).toBe(false);
    expect(status.hasAccessToken).toBe(false);
  });

  it('should graceful skip when credentials are not configured', async () => {
    const result = await service.publishTweet('테스트 트윗');
    expect(result.success).toBe(false);
    expect(result.configured).toBe(false);
    expect(result.error).toBe('TWITTER_CREDENTIALS_NOT_CONFIGURED');
  });

  it('should detect configured status when environment variables are set', () => {
    process.env.TWITTER_API_KEY = 'test_api_key';
    process.env.TWITTER_API_SECRET = 'test_api_secret';
    process.env.TWITTER_ACCESS_TOKEN = 'test_token';
    process.env.TWITTER_ACCESS_SECRET = 'test_secret';

    expect(service.isConfigured()).toBe(true);
    const status = service.getStatus();
    expect(status.configured).toBe(true);
    expect(status.hasApiKey).toBe(true);
    expect(status.hasAccessToken).toBe(true);
  });

  it('should reject empty tweet text when configured', async () => {
    process.env.TWITTER_API_KEY = 'test_api_key';
    process.env.TWITTER_API_SECRET = 'test_api_secret';
    process.env.TWITTER_ACCESS_TOKEN = 'test_token';
    process.env.TWITTER_ACCESS_SECRET = 'test_secret';

    const result = await service.publishTweet('   ');
    expect(result.success).toBe(false);
    expect(result.configured).toBe(true);
    expect(result.error).toBe('EMPTY_TWEET_TEXT');
  });
});
