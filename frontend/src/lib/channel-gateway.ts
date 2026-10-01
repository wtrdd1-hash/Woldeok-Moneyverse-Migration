import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { ApiChannel, ChannelRouteDefinition } from '@moneyverse/contract';

const API_ORIGIN = process.env.API_ORIGIN ?? 'http://127.0.0.1:3020';
const METHODS_WITH_BODY = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export const CHANNEL_API_REQUEST_HEADERS = Object.freeze([
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
  'cf-connecting-ip',
  'cf-ipcountry',
] as const);

export const CHANNEL_API_RESPONSE_HEADERS = Object.freeze([
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

export function channelGatewayOrigin(
  headers: Headers,
  configuredBase = process.env.APP_BASE_URL,
): string | null {
  if (!configuredBase) return null;
  try {
    const base = new URL(configuredBase);
    if (base.protocol !== 'https:' && base.protocol !== 'http:') return null;
    const suppliedHost = headers.get('x-forwarded-host') ?? headers.get('host');
    if (suppliedHost && /[\r\n]/.test(suppliedHost)) return null;
    return base.origin;
  } catch {
    return null;
  }
}

export function isJsonMediaType(contentType: string | null): boolean {
  if (!contentType) return false;
  const mediaType = contentType.split(';', 1)[0]?.trim().toLowerCase();
  return mediaType === 'application/json' || mediaType?.endsWith('+json') === true;
}

function internalToken(): string {
  const token = process.env.INTERNAL_API_TOKEN;
  if (!token) throw new Error('INTERNAL_API_TOKEN is not configured');
  return token;
}

export interface ChannelProxyContext {
  readonly targetPath: string;
  readonly gatewayId: string;
  readonly requestHeaders?: readonly string[];
  readonly appendResponseHeaders: (headers: Headers) => Headers;
  readonly problemCodePrefix: 'app_gateway' | 'site_gateway';
}

function problem(
  context: ChannelProxyContext,
  status: number,
  title: string,
  suffix: string,
  detail: string,
): NextResponse {
  const headers = context.appendResponseHeaders(
    new Headers({ 'content-type': 'application/problem+json' }),
  );
  return NextResponse.json(
    { type: 'about:blank', title, status, code: `${context.problemCodePrefix}_${suffix}`, detail },
    { status, headers },
  );
}

export async function proxyChannelRequest(
  channel: ApiChannel,
  request: NextRequest,
  route: ChannelRouteDefinition,
  context: ChannelProxyContext,
): Promise<NextResponse> {
  if (route.channel !== channel) {
    return problem(context, 403, 'Forbidden', 'channel_mismatch', 'route belongs to another channel');
  }

  const allowed = context.requestHeaders ?? CHANNEL_API_REQUEST_HEADERS;
  const outgoing = new Headers({
    accept: request.headers.get('accept') ?? 'application/json',
    'x-internal-token': internalToken(),
    'x-moneyverse-channel': channel,
    'x-moneyverse-gateway': context.gatewayId,
  });
  for (const name of allowed) {
    const value = request.headers.get(name);
    if (value) outgoing.set(name, value);
  }

  const publicOrigin = channelGatewayOrigin(request.headers);
  if (publicOrigin) outgoing.set('x-public-origin', publicOrigin);

  const target = new URL(context.targetPath, API_ORIGIN);
  target.search = request.nextUrl.search;

  let response: Response;
  try {
    response = await fetch(target, {
      method: request.method,
      headers: outgoing,
      ...(METHODS_WITH_BODY.has(request.method) ? { body: await request.arrayBuffer() } : {}),
      cache: 'no-store',
      redirect: 'manual',
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error: unknown) {
    const name = error instanceof Error ? error.name : '';
    if (name === 'TimeoutError' || name === 'AbortError') {
      return problem(
        context,
        504,
        'Gateway Timeout',
        'timeout',
        'the private API did not answer within 15 seconds',
      );
    }
    return problem(
      context,
      502,
      'Bad Gateway',
      'unavailable',
      'the private API could not be reached',
    );
  }

  const headers = context.appendResponseHeaders(new Headers());
  for (const name of CHANNEL_API_RESPONSE_HEADERS) {
    const value = response.headers.get(name);
    if (value) headers.set(name, value);
  }
  for (const cookie of response.headers.getSetCookie()) headers.append('set-cookie', cookie);

  if (request.method === 'HEAD' || response.status === 204 || response.status === 304) {
    return new NextResponse(null, { status: response.status, headers });
  }

  return new NextResponse(response.body, { status: response.status, headers });
}
