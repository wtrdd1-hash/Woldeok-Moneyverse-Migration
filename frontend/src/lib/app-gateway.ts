import {
  CHANNEL_API_REQUEST_HEADERS,
  CHANNEL_API_RESPONSE_HEADERS,
  channelGatewayOrigin,
  isJsonMediaType,
} from './channel-gateway';

export { isJsonMediaType };

export const APP_API_VERSION = '1';
export const APP_API_CONTRACT_VERSION = 'v2026.09.22.359';

export const APP_API_GROUPS = Object.freeze([
  'account', 'activity', 'admin', 'auth', 'bank', 'banking', 'board', 'businesses',
  'casino', 'chat', 'clubs', 'collections', 'content', 'crafting', 'developer', 'early-game', 'engagement', 'marketplace', 'media', 'newspaper', 'notifications', 'photos', 'privacy',
  'profile', 'progression', 'rewards', 'seasons', 'game-clock', 'shop', 'spaces', 'stocks', 'support', 'wallet', 'work',
] as const);

const APP_API_GROUP_SET = new Set<string>(APP_API_GROUPS);

export const APP_API_REQUEST_HEADERS = Object.freeze([
  ...CHANNEL_API_REQUEST_HEADERS,
  'x-moneyverse-client',
  'x-moneyverse-app-version',
  'x-moneyverse-android-sdk',
  'x-play-integrity-token',
] as const);

export const APP_API_RESPONSE_HEADERS = CHANNEL_API_RESPONSE_HEADERS;

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

export function appGatewayOrigin(
  headers: Headers,
  configuredBase = process.env.APP_BASE_URL,
): string | null {
  return channelGatewayOrigin(headers, configuredBase);
}

export function parseAppVersion(value: string | null): [number, number, number] | null {
  const match = value?.trim().match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function isAppVersionBelow(
  current: [number, number, number],
  minimum: [number, number, number],
): boolean {
  for (let i = 0; i < 3; i += 1) {
    if (current[i] !== minimum[i]) return current[i]! < minimum[i]!;
  }
  return false;
}

export function looksLikeOfficialAndroid(headers: Headers): boolean {
  const client = headers.get('x-moneyverse-client')?.toLowerCase();
  const userAgent = headers.get('user-agent') ?? '';
  return client === 'android' && /^WoldeokMoneyverse-Android\/[0-9]+\.[0-9]+\.[0-9]+(?:\s|$)/.test(userAgent);
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

export const APP_API_V2_VERSION = '2';
export const APP_API_V2_CONTRACT_VERSION = 'v2026.10.01.501';

export function appendAppV2ContractHeaders(headers: Headers): Headers {
  headers.set('x-moneyverse-api-version', APP_API_V2_VERSION);
  headers.set('x-moneyverse-contract-version', APP_API_V2_CONTRACT_VERSION);
  headers.set('x-content-type-options', 'nosniff');
  headers.set('x-moneyverse-field-naming', 'camelCase');
  headers.set('x-moneyverse-channel', 'APP');
  return headers;
}

export function appApiV2Contract(origin: string) {
  return {
    apiVersion: APP_API_V2_VERSION,
    contractVersion: APP_API_V2_CONTRACT_VERSION,
    baseUrl: `${origin}/app-api/v2`,
    fieldNaming: 'camelCase',
    legacyCompatibility: false,
    auth: {
      session: 'secure cookie',
      persistentCookieJarRequired: true,
      csrfHeader: 'x-csrf-token',
      loginTruthEndpoint: '/auth/viewer',
      loginTruthField: 'signedIn',
    },
    integrity: {
      policySource: 'channel route manifest',
      enforcementEnv: 'APP_API_INTEGRITY_ENFORCEMENT',
    },
    errors: {
      mediaType: 'application/problem+json',
      neverDecodeNon2xxAsSuccess: true,
    },
  } as const;
}
