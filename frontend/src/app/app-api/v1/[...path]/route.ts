import type { NextRequest } from 'next/server';
import { parseVipChestStatus } from '@/app/quests/vip-chest-status';
import { NextResponse } from 'next/server';
import {
  APP_API_REQUEST_HEADERS,
  APP_API_RESPONSE_HEADERS,
  addAppJsonCompatibility,
  appApiContract,
  appendAppContractHeaders,
  appGatewayOrigin,
  appGatewayPath,
  isJsonMediaType,
} from '@/lib/app-gateway';

const API_ORIGIN = process.env.API_ORIGIN ?? 'http://127.0.0.1:3020';
const METHODS_WITH_BODY = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const ANDROID_ONLY = process.env.APP_API_ANDROID_ONLY === 'true';

function isVipChestPath(parts: readonly string[]): boolean {
  return parts[0] === 'engagement' && parts[1] === 'dopamine' && parts[2] === 'vip-chest';
}

function parseAppVersion(value: string | null): [number, number, number] | null {
  const match = value?.trim().match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function isVersionBelow(current: [number, number, number], minimum: [number, number, number]): boolean {
  for (let i = 0; i < 3; i += 1) {
    if (current[i]! !== minimum[i]!) return current[i]! < minimum[i]!;
  }
  return false;
}

function looksLikeOfficialAndroid(request: NextRequest): boolean {
  const client = request.headers.get('x-moneyverse-client')?.toLowerCase();
  const userAgent = request.headers.get('user-agent') ?? '';
  return client === 'android' && /^WoldeokMoneyverse-Android\/[0-9]+\.[0-9]+\.[0-9]+(?:\s|$)/.test(userAgent);
}

function internalToken(): string {
  const token = process.env.INTERNAL_API_TOKEN;
  if (!token) throw new Error('INTERNAL_API_TOKEN is not configured');
  return token;
}

function contractJson(payload: unknown, init: ResponseInit = {}): NextResponse {
  const headers = appendAppContractHeaders(new Headers(init.headers));
  return NextResponse.json(payload, { ...init, headers });
}

function gatewayProblem(status: number, title: string, code: string, detail: string): NextResponse {
  return contractJson(
    { type: 'about:blank', title, status, code, detail },
    { status, headers: { 'content-type': 'application/problem+json', 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex' } },
  );
}

async function proxy(request: NextRequest, parts: readonly string[]): Promise<NextResponse> {
  if (parts.length === 2 && parts[0] === 'meta' && parts[1] === 'contract') {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return gatewayProblem(405, 'Method Not Allowed', 'app_gateway_method_not_allowed', 'contract metadata is read-only');
    }
    const origin = appGatewayOrigin(request.headers);
    if (!origin) return gatewayProblem(400, 'Bad Request', 'app_gateway_origin', 'public origin is unavailable');
    const response = contractJson(appApiContract(origin), { status: 200, headers: { 'cache-control': 'public, max-age=300' } });
    return request.method === 'HEAD' ? new NextResponse(null, { status: response.status, headers: response.headers }) : response;
  }

  const path = appGatewayPath(parts);
  if (!path) return gatewayProblem(404, 'Not Found', 'app_gateway_path', 'this path is not part of the public app API');

  const minimumVersionRaw = process.env.APP_API_MIN_VERSION?.trim();
  if (minimumVersionRaw) {
    const minimumVersion = parseAppVersion(minimumVersionRaw);
    if (!minimumVersion) {
      return gatewayProblem(503, 'Service Unavailable', 'app_gateway_version_policy_invalid', 'the app compatibility policy is unavailable');
    }
    const currentVersion = parseAppVersion(request.headers.get('x-moneyverse-app-version'));
    if (!currentVersion || isVersionBelow(currentVersion, minimumVersion)) {
      const response = gatewayProblem(426, 'Upgrade Required', 'app_upgrade_required', `app version ${minimumVersionRaw} or newer is required`);
      response.headers.set('x-moneyverse-min-app-version', minimumVersionRaw);
      return response;
    }
  }

  // Optional coarse filter for the native public surface only. Normal web
  // /api routes are unaffected. This is intentionally not cryptographic proof;
  // strong Android attestation must use a verified Play Integrity verdict.
  if (ANDROID_ONLY && !looksLikeOfficialAndroid(request)) {
    return gatewayProblem(
      403,
      'Forbidden',
      'android_client_required',
      'this app API is restricted to the Android client',
    );
  }

  if (
    parts.length === 3 &&
    parts[0] === 'auth' &&
    (parts[1] === 'google' || parts[1] === 'discord') &&
    parts[2] === 'authorize' &&
    request.nextUrl.searchParams.get('client') === 'mobile'
  ) {
    const origin = appGatewayOrigin(request.headers);
    if (!origin) return gatewayProblem(400, 'Bad Request', 'app_gateway_origin', 'public origin is unavailable');
    return contractJson({
      authorizationUrl: `${origin}/auth/${encodeURIComponent(parts[1])}/authorize?client=mobile`,
    });
  }

  const outgoing = new Headers({
    accept: request.headers.get('accept') ?? 'application/json',
    'x-internal-token': internalToken(),
    'x-moneyverse-gateway': 'app-api-v1',
  });
  for (const name of APP_API_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) outgoing.set(name, value);
  }
  const publicOrigin = appGatewayOrigin(request.headers);
  if (publicOrigin) outgoing.set('x-public-origin', publicOrigin);

  const target = new URL(path, API_ORIGIN);
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
      return gatewayProblem(504, 'Gateway Timeout', 'app_gateway_timeout', 'the private API did not answer within 15 seconds');
    }
    return gatewayProblem(502, 'Bad Gateway', 'app_gateway_unavailable', 'the private API could not be reached');
  }

  // Older backend images returned HTTP 200 without an actual WLD posting.
  // Do not let a mobile client interpret that legacy response as a receipt.
  if (isVipChestPath(parts)) {
    if (request.method === 'POST' && response.ok) {
      return gatewayProblem(503, 'Service Unavailable', 'vip_chest_unverified', 'VIP reward receipts are unavailable');
    }
    if (parts[3] === 'status' && request.method === 'GET' && response.ok) {
      try {
        if (!parseVipChestStatus(await response.clone().json())) {
          return gatewayProblem(503, 'Service Unavailable', 'vip_chest_unverified', 'VIP entitlement and receipt status are unverified');
        }
      } catch {
        return gatewayProblem(503, 'Service Unavailable', 'vip_chest_unverified', 'VIP status response is invalid');
      }
    }
  }

  const headers = appendAppContractHeaders(new Headers());
  for (const name of APP_API_RESPONSE_HEADERS) {
    const value = response.headers.get(name);
    if (value) headers.set(name, value);
  }
  for (const cookie of response.headers.getSetCookie()) headers.append('set-cookie', cookie);
  // Owner-scoped wallet balances and ledger activity must never inherit an
  // accidentally cacheable upstream response, including on Android clients.
  if (parts[0] === 'wallet' || parts[0] === 'privacy' || parts[0] === 'work' || (parts[0] === 'account' && parts[1] === 'security')) headers.set('cache-control', 'private, no-store');
  if (parts[0] === 'privacy' || parts[0] === 'work' || (parts[0] === 'account' && parts[1] === 'security')) headers.set('x-robots-tag', 'noindex');

  if (request.method === 'HEAD' || response.status === 204 || response.status === 304) {
    return new NextResponse(null, { status: response.status, headers });
  }

  if (isJsonMediaType(response.headers.get('content-type'))) {
    const bytes = await response.arrayBuffer();
    try {
      const text = new TextDecoder().decode(bytes);
      const parsed = JSON.parse(text) as unknown;
      const compatible = addAppJsonCompatibility(parsed);
      return new NextResponse(JSON.stringify(compatible), { status: response.status, headers });
    } catch {
      return new NextResponse(bytes, { status: response.status, headers });
    }
  }

  return new NextResponse(response.body, { status: response.status, headers });
}

type Context = { params: Promise<{ path: string[] }> };
async function handle(request: NextRequest, context: Context) {
  const parts = (await context.params).path;
  const response = await proxy(request, parts);
  // Help publication metadata and member-scoped reads must not inherit a
  // cacheable upstream policy, including when the upstream returns an error.
  if (parts[0] === 'help' || parts[0] === 'work' || (parts[0] === 'account' && parts[1] === 'security') || parts[0] === 'bank' || parts[0] === 'banking' || parts[0] === 'chat' || (parts[0] === 'content' && parts[1] === 'chat')) {
    response.headers.set('cache-control', 'private, no-store');
    if (parts[0] === 'help' || parts[0] === 'work' || (parts[0] === 'account' && parts[1] === 'security')) response.headers.set('x-robots-tag', 'noindex');
  }
  if (isVipChestPath(parts)) {
    response.headers.set('cache-control', 'private, no-store');
    response.headers.set('x-robots-tag', 'noindex');
  }
  return response;
}

export const GET = handle;
export const HEAD = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
