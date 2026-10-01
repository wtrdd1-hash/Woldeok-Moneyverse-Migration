import { channelGatewayOrigin } from './channel-gateway';

export const SITE_API_VERSION = '1';
export const SITE_API_CONTRACT_VERSION = 'v2026.10.01.501';

export function appendSiteContractHeaders(headers: Headers): Headers {
  headers.set('x-moneyverse-api-version', SITE_API_VERSION);
  headers.set('x-moneyverse-contract-version', SITE_API_CONTRACT_VERSION);
  headers.set('x-content-type-options', 'nosniff');
  headers.set('x-moneyverse-channel', 'SITE');
  return headers;
}

export function siteGatewayOrigin(
  headers: Headers,
  configuredBase = process.env.APP_BASE_URL,
): string | null {
  return channelGatewayOrigin(headers, configuredBase);
}

export function siteBackendPath(publicPath: string): string | null {
  const prefix = '/site-api/v1';
  if (!publicPath.startsWith(`${prefix}/`)) return null;
  const relative = publicPath.slice(prefix.length);
  if (!relative || relative.includes('..')) return null;
  return `/api/v1${relative}`;
}

export function siteApiContract(origin: string) {
  return {
    apiVersion: SITE_API_VERSION,
    contractVersion: SITE_API_CONTRACT_VERSION,
    baseUrl: `${origin}/site-api/v1`,
    channel: 'SITE',
    auth: {
      session: 'same-origin HttpOnly cookie',
      csrfHeader: 'x-csrf-token',
      serverAuthoritative: true,
    },
    errors: {
      mediaType: 'application/problem+json',
      neverDecodeNon2xxAsSuccess: true,
    },
  } as const;
}
