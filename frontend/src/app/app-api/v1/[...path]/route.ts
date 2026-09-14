import type { NextRequest } from 'next/server';
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
    { status, headers: { 'content-type': 'application/problem+json' } },
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

  const headers = appendAppContractHeaders(new Headers());
  for (const name of APP_API_RESPONSE_HEADERS) {
    const value = response.headers.get(name);
    if (value) headers.set(name, value);
  }
  for (const cookie of response.headers.getSetCookie()) headers.append('set-cookie', cookie);

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
      // A backend claiming JSON but returning malformed bytes is still an
      // upstream response. Preserve the body/status so diagnostics are not
      // hidden by a second gateway error.
      return new NextResponse(bytes, { status: response.status, headers });
    }
  }

  return new NextResponse(response.body, { status: response.status, headers });
}

type Context = { params: Promise<{ path: string[] }> };
async function handle(request: NextRequest, context: Context) {
  return proxy(request, (await context.params).path);
}

export const GET = handle;
export const HEAD = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
