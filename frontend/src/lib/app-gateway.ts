export const APP_API_VERSION = '1';
export const APP_API_CONTRACT_VERSION = 'v2026.09.15.115';

export const APP_API_GROUPS = Object.freeze([
  'account', 'activity', 'admin', 'auth', 'bank', 'banking', 'board', 'businesses',
  'casino', 'content', 'early-game', 'engagement', 'media', 'photos', 'privacy',
  'profile', 'progression', 'rewards', 'seasons', 'game-clock', 'shop', 'stocks', 'wallet', 'work',
] as const);

const APP_API_GROUP_SET = new Set<string>(APP_API_GROUPS);

export const APP_API_REQUEST_HEADERS = Object.freeze([
  'cookie',
  'content-type',
  'x-csrf-token',
  'user-agent',
  'accept-language',
  'range',
  'if-none-match',
  'if-modified-since',
  'if-range',
  'x-request-id',
  'x-moneyverse-client',
  'x-moneyverse-app-version',
  'x-moneyverse-android-sdk',
  'x-play-integrity-token',
  'cf-connecting-ip',
  'cf-ipcountry',
] as const);

export const APP_API_RESPONSE_HEADERS = Object.freeze([
  'content-type',
  'cache-control',
  'location',
  'retry-after',
  'www-authenticate',
  'etag',
  'last-modified',
  'accept-ranges',
  'content-range',
  'content-disposition',
  'x-request-id',
  'x-ratelimit-limit',
  'x-ratelimit-remaining',
  'x-ratelimit-reset',
] as const);

export function appGatewayPath(parts: readonly string[]): string | null {
  if (parts.length === 0) return null;
  const clean = parts.map((part) => part.trim());
  if (clean.some((part) => !part || part === '.' || part === '..' || part.includes('/'))) return null;
  if (!APP_API_GROUP_SET.has(clean[0]!)) return null;

  if (clean[0] === 'media') {
    return `/${clean.map(encodeURIComponent).join('/')}`;
  }
  if (
    clean[0] === 'auth' &&
    clean.length === 3 &&
    (clean[1] === 'discord' || clean[1] === 'google') &&
    (clean[2] === 'authorize' || clean[2] === 'callback')
  ) {
    return `/${clean.map(encodeURIComponent).join('/')}`;
  }

  return `/api/v1/${clean.map(encodeURIComponent).join('/')}`;
}

export function appGatewayOrigin(headers: Headers): string | null {
  const host = headers.get('x-forwarded-host') ?? headers.get('host');
  if (!host || /[\r\n]/.test(host)) return null;
  const proto = headers.get('x-forwarded-proto') === 'http' ? 'http' : 'https';
  return `${proto}://${host}`;
}

function camelAlias(key: string): string | null {
  if (!/^[a-z][a-z0-9]*(?:_[a-z0-9]+)+$/.test(key)) return null;
  return key.replace(/_([a-z0-9])/g, (_, letter: string) => letter.toUpperCase());
}

export function addAppJsonCompatibility(value: unknown, depth = 0): unknown {
  if (depth > 32 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((item) => addAppJsonCompatibility(item, depth + 1));

  const source = value as Record<string, unknown>;
  const result: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
  for (const [key, item] of Object.entries(source)) {
    result[key] = addAppJsonCompatibility(item, depth + 1);
  }
  for (const [key, item] of Object.entries(source)) {
    const alias = camelAlias(key);
    if (alias && !(alias in result)) {
      result[alias] = addAppJsonCompatibility(item, depth + 1);
    }
  }

  const purchaseCost = result.purchaseCost;
  const dailyRevenue = result.dailyRevenue;
  const dailyOperatingCost = result.dailyOperatingCost;
  if (typeof purchaseCost === 'string') {
    if (!('price' in result)) result.price = purchaseCost;
    if (!('purchasePrice' in result)) result.purchasePrice = purchaseCost;
  }
  if (
    typeof dailyRevenue === 'string' &&
    typeof dailyOperatingCost === 'string' &&
    /^-?\d+$/.test(dailyRevenue) &&
    /^-?\d+$/.test(dailyOperatingCost)
  ) {
    const netProfit = (BigInt(dailyRevenue) - BigInt(dailyOperatingCost)).toString();
    if (!('expectedProfit' in result)) result.expectedProfit = netProfit;
    if (!('dailyProfit' in result)) result.dailyProfit = netProfit;
    if (!('netProfit' in result)) result.netProfit = netProfit;
    if (!('profit' in result)) result.profit = netProfit;
  }
  return result;
}

export function isJsonMediaType(contentType: string | null): boolean {
  if (!contentType) return false;
  const mediaType = contentType.split(';', 1)[0]?.trim().toLowerCase();
  return mediaType === 'application/json' || mediaType?.endsWith('+json') === true;
}

export function appendAppContractHeaders(headers: Headers): Headers {
  headers.set('x-moneyverse-api-version', APP_API_VERSION);
  headers.set('x-moneyverse-contract-version', APP_API_CONTRACT_VERSION);
  headers.set('x-content-type-options', 'nosniff');
  headers.set('x-moneyverse-field-naming', 'camelCase+legacy');
  return headers;
}

export function appApiContract(origin: string) {
  return {
    apiVersion: APP_API_VERSION,
    contractVersion: APP_API_CONTRACT_VERSION,
    baseUrl: `${origin}/app-api/v1`,
    fieldNaming: 'camelCase+legacy',
    legacyCompatibility: 'Every JSON object preserves existing keys and adds non-conflicting camelCase aliases for snake_case keys. New native code should read camelCase; legacy snake_case remains available.',
    auth: {
      session: 'secure cookie',
      persistentCookieJarRequired: true,
      csrfHeader: 'x-csrf-token',
      loginTruthEndpoint: '/auth/viewer',
      loginTruthField: 'signedIn',
      adminRoleEndpoint: '/admin/me',
      adminRoleDoubleCheckRequired: true,
    },
    errors: {
      mediaType: 'application/problem+json',
      fields: ['type', 'title', 'status', 'detail', 'code', 'errors'],
      neverDecodeNon2xxAsSuccess: true,
    },
    nullHandling: {
      preserveNull: true,
      neverRenderLiteralNull: true,
      neverReplaceSuccessfulStateWithNullOnTransportFailure: true,
    },
    groups: [...APP_API_GROUPS],
  } as const;
}
