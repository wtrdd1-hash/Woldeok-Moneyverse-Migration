import { createSign } from 'node:crypto';
import { safeFetch } from '../security/ssrf-defense';

const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const SEARCH_CONSOLE_API = 'https://www.googleapis.com/webmasters/v3';
const SEARCH_CONSOLE_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

export interface GscServiceAccount {
  readonly type: 'service_account';
  readonly clientEmail: string;
  readonly privateKey: string;
  readonly projectId: string | null;
}

export interface GscApiRow {
  readonly keys?: readonly string[];
  readonly clicks?: number;
  readonly impressions?: number;
  readonly ctr?: number;
  readonly position?: number;
}

export interface GscSearchAnalyticsPayload {
  readonly rows?: readonly GscApiRow[];
}

export interface GscSiteEntry {
  readonly siteUrl?: string;
  readonly permissionLevel?: string;
}

export interface GscSitesPayload {
  readonly siteEntry?: readonly GscSiteEntry[];
}

export interface GscAnalyticsSnapshot {
  readonly propertyUrl: string;
  readonly timeSeries: readonly {
    readonly date: string;
    readonly clicks: number;
    readonly impressions: number;
    readonly ctr: number;
    readonly position: number;
  }[];
  readonly topQueries: readonly {
    readonly query: string;
    readonly clicks: number;
    readonly impressions: number;
    readonly ctr: number;
    readonly position: number;
  }[];
  readonly totalClicks30d: number;
  readonly totalImpressions30d: number;
  readonly avgCtr30d: number;
  readonly avgPosition30d: number;
}

export type GscFetch = (url: string | URL, init?: RequestInit) => Promise<Response>;

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('service account key must be a JSON object');
  }
  return value as Record<string, unknown>;
}

function requiredString(object: Record<string, unknown>, key: string): string {
  const value = object[key];
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`service account key is missing ${key}`);
  }
  return value.trim();
}

export function parseGscServiceAccount(rawJson: string): GscServiceAccount {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    throw new Error('service account key is not valid JSON');
  }

  const object = asObject(parsed);
  if (object.type !== 'service_account') {
    throw new Error('Google service account JSON is required');
  }

  const clientEmail = requiredString(object, 'client_email');
  const privateKey = requiredString(object, 'private_key').replace(/\\n/g, '\n');
  if (!clientEmail.endsWith('.gserviceaccount.com')) {
    throw new Error('client_email is not a Google service account address');
  }
  if (!privateKey.includes('BEGIN PRIVATE KEY') || !privateKey.includes('END PRIVATE KEY')) {
    throw new Error('private_key is not a valid PKCS#8 private key');
  }

  return {
    type: 'service_account',
    clientEmail,
    privateKey,
    projectId: typeof object.project_id === 'string' && object.project_id.trim()
      ? object.project_id.trim()
      : null,
  };
}

function base64UrlJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');
}

export function createServiceAccountAssertion(
  credential: GscServiceAccount,
  nowSeconds = Math.floor(Date.now() / 1000),
): string {
  const header = base64UrlJson({ alg: 'RS256', typ: 'JWT' });
  const payload = base64UrlJson({
    iss: credential.clientEmail,
    scope: SEARCH_CONSOLE_SCOPE,
    aud: GOOGLE_TOKEN_ENDPOINT,
    iat: nowSeconds,
    exp: nowSeconds + 3600,
  });
  const unsigned = `${header}.${payload}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(credential.privateKey).toString('base64url');
  return `${unsigned}.${signature}`;
}

async function responseJson<T>(response: Response, label: string): Promise<T> {
  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      if (!response.ok) throw new Error(`${label} failed with HTTP ${response.status}`);
    }
  }

  if (!response.ok) {
    const object = payload && typeof payload === 'object' ? payload as Record<string, unknown> : null;
    const error = object?.error;
    let detail = '';
    if (typeof error === 'string') detail = error;
    else if (error && typeof error === 'object') {
      const errorObject = error as Record<string, unknown>;
      detail = typeof errorObject.message === 'string' ? errorObject.message : '';
    }
    throw new Error(`${label} failed with HTTP ${response.status}${detail ? `: ${detail}` : ''}`);
  }

  return payload as T;
}

export async function exchangeServiceAccountToken(
  credential: GscServiceAccount,
  fetcher: GscFetch = safeFetch,
): Promise<string> {
  const assertion = createServiceAccountAssertion(credential);
  const response = await fetcher(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }).toString(),
  });
  const payload = await responseJson<{ access_token?: unknown }>(response, 'Google OAuth token exchange');
  if (typeof payload.access_token !== 'string' || !payload.access_token) {
    throw new Error('Google OAuth token exchange returned no access_token');
  }
  return payload.access_token;
}

async function googleJson<T>(
  url: string,
  accessToken: string,
  fetcher: GscFetch,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetcher(url, {
    ...init,
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${accessToken}`,
      ...(init.body === undefined ? {} : { 'content-type': 'application/json' }),
      ...(init.headers ?? {}),
    },
  });
  return responseJson<T>(response, 'Google Search Console API');
}

export async function listAccessibleGscSites(
  accessToken: string,
  fetcher: GscFetch = safeFetch,
): Promise<readonly GscSiteEntry[]> {
  const payload = await googleJson<GscSitesPayload>(`${SEARCH_CONSOLE_API}/sites`, accessToken, fetcher);
  return payload.siteEntry ?? [];
}

function normalizedPrefix(baseUrl: string): string {
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
}

export function chooseGscProperty(
  sites: readonly GscSiteEntry[],
  baseUrl: string,
  configuredProperty?: string | null,
): string {
  const usable = sites
    .map((site) => site.siteUrl)
    .filter((siteUrl): siteUrl is string => typeof siteUrl === 'string' && siteUrl.length > 0);
  if (usable.length === 0) {
    throw new Error('service account has no Search Console properties; add it as a property user first');
  }

  if (configuredProperty) {
    if (!usable.includes(configuredProperty)) {
      throw new Error(`configured Search Console property is not accessible: ${configuredProperty}`);
    }
    return configuredProperty;
  }

  const hostname = new URL(baseUrl).hostname;
  const domainProperty = `sc-domain:${hostname}`;
  if (usable.includes(domainProperty)) return domainProperty;

  const prefix = normalizedPrefix(baseUrl);
  if (usable.includes(prefix)) return prefix;
  if (usable.includes(baseUrl)) return baseUrl;

  const hostMatch = usable.find((siteUrl) => {
    if (siteUrl.startsWith('sc-domain:')) return siteUrl.slice('sc-domain:'.length) === hostname;
    try {
      return new URL(siteUrl).hostname === hostname;
    } catch {
      return false;
    }
  });
  if (hostMatch) return hostMatch;

  if (usable.length === 1) return usable[0]!;
  throw new Error('multiple Search Console properties are accessible; configure GSC_SITE_URL explicitly');
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 86_400_000);
}

async function searchAnalytics(
  propertyUrl: string,
  accessToken: string,
  request: Record<string, unknown>,
  fetcher: GscFetch,
): Promise<GscSearchAnalyticsPayload> {
  const url = `${SEARCH_CONSOLE_API}/sites/${encodeURIComponent(propertyUrl)}/searchAnalytics/query`;
  return googleJson<GscSearchAnalyticsPayload>(url, accessToken, fetcher, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

function numberOrZero(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export async function fetchGscAnalyticsSnapshot(
  credential: GscServiceAccount,
  baseUrl: string,
  configuredProperty?: string | null,
  fetcher: GscFetch = safeFetch,
): Promise<GscAnalyticsSnapshot> {
  const accessToken = await exchangeServiceAccountToken(credential, fetcher);
  const sites = await listAccessibleGscSites(accessToken, fetcher);
  const propertyUrl = chooseGscProperty(sites, baseUrl, configuredProperty);

  const startDate = isoDate(daysAgo(29));
  const endDate = isoDate(new Date());
  const common = { startDate, endDate, type: 'web', dataState: 'all' };

  const [summary, byDate, byQuery] = await Promise.all([
    searchAnalytics(propertyUrl, accessToken, common, fetcher),
    searchAnalytics(propertyUrl, accessToken, { ...common, dimensions: ['date'], rowLimit: 25000 }, fetcher),
    searchAnalytics(propertyUrl, accessToken, { ...common, dimensions: ['query'], rowLimit: 10 }, fetcher),
  ]);

  const dateRows = new Map<string, GscApiRow>();
  for (const row of byDate.rows ?? []) {
    const date = row.keys?.[0];
    if (date) dateRows.set(date, row);
  }

  const timeSeries = Array.from({ length: 30 }, (_, index) => {
    const date = isoDate(daysAgo(29 - index));
    const row = dateRows.get(date);
    return {
      date,
      clicks: Math.round(numberOrZero(row?.clicks)),
      impressions: Math.round(numberOrZero(row?.impressions)),
      ctr: Number((numberOrZero(row?.ctr) * 100).toFixed(2)),
      position: Number(numberOrZero(row?.position).toFixed(1)),
    };
  });

  const topQueries = (byQuery.rows ?? []).slice(0, 10).map((row) => ({
    query: row.keys?.[0] ?? '(unknown)',
    clicks: Math.round(numberOrZero(row.clicks)),
    impressions: Math.round(numberOrZero(row.impressions)),
    ctr: Number((numberOrZero(row.ctr) * 100).toFixed(2)),
    position: Number(numberOrZero(row.position).toFixed(1)),
  }));

  const aggregate = summary.rows?.[0];
  const totalClicks30d = Math.round(numberOrZero(aggregate?.clicks));
  const totalImpressions30d = Math.round(numberOrZero(aggregate?.impressions));

  return {
    propertyUrl,
    timeSeries,
    topQueries,
    totalClicks30d,
    totalImpressions30d,
    avgCtr30d: Number((numberOrZero(aggregate?.ctr) * 100).toFixed(2)),
    avgPosition30d: Number(numberOrZero(aggregate?.position).toFixed(1)),
  };
}
