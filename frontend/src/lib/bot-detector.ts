export interface DetectedBot {
  readonly isBot: boolean;
  readonly botName: string;
}

export const KNOWN_SEARCH_BOTS: readonly { readonly name: string; readonly pattern: RegExp }[] = [
  { name: 'Googlebot', pattern: /googlebot/i },
  { name: 'Googlebot-Image', pattern: /googlebot-image/i },
  { name: 'Googlebot-Mobile', pattern: /googlebot-mobile/i },
  { name: 'Naver Yeti', pattern: /yeti/i },
  { name: 'Bingbot', pattern: /bingbot/i },
  { name: 'Daumoa', pattern: /daumoa/i },
  { name: 'DuckDuckBot', pattern: /duckduckbot/i },
  { name: 'Baiduspider', pattern: /baiduspider/i },
  { name: 'YandexBot', pattern: /yandexbot/i },
  { name: 'Applebot', pattern: /applebot/i },
  { name: 'Twitterbot', pattern: /twitterbot/i },
  { name: 'facebookexternalhit', pattern: /facebookexternalhit/i },
  { name: 'Slackbot', pattern: /slackbot/i },
  { name: 'Discordbot', pattern: /discordbot/i },
];

/**
 * Identify if a given User-Agent is a known search engine or social preview crawler.
 */
export function detectCrawlerBot(userAgent?: string | null): DetectedBot {
  if (!userAgent || typeof userAgent !== 'string') {
    return { isBot: false, botName: '' };
  }

  for (const bot of KNOWN_SEARCH_BOTS) {
    if (bot.pattern.test(userAgent)) {
      return { isBot: true, botName: bot.name };
    }
  }

  if (/bot|crawler|spider|crawling/i.test(userAgent)) {
    return { isBot: true, botName: 'GenericCrawler' };
  }

  return { isBot: false, botName: '' };
}
