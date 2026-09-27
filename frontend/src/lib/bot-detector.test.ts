import { describe, expect, it } from 'vitest';
import { detectCrawlerBot } from './bot-detector';

describe('bot-detector', () => {
  it('identifies Googlebot user agent correctly', () => {
    const result = detectCrawlerBot('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)');
    expect(result.isBot).toBe(true);
    expect(result.botName).toBe('Googlebot');
  });

  it('identifies Naver Yeti user agent correctly', () => {
    const result = detectCrawlerBot('Mozilla/5.0 (compatible; Yeti/1.1; +http://naver.me/bot)');
    expect(result.isBot).toBe(true);
    expect(result.botName).toBe('Naver Yeti');
  });

  it('identifies Bingbot user agent correctly', () => {
    const result = detectCrawlerBot('Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)');
    expect(result.isBot).toBe(true);
    expect(result.botName).toBe('Bingbot');
  });

  it('returns isBot: false for standard browsers', () => {
    const result = detectCrawlerBot('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    expect(result.isBot).toBe(false);
    expect(result.botName).toBe('');
  });

  it('handles empty or null inputs gracefully', () => {
    expect(detectCrawlerBot(null).isBot).toBe(false);
    expect(detectCrawlerBot('').isBot).toBe(false);
    expect(detectCrawlerBot(undefined).isBot).toBe(false);
  });
});
