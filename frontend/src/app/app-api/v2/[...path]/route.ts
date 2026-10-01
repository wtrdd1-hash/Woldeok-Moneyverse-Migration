import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { matchChannelRoute } from '@moneyverse/contract';
import {
  APP_API_REQUEST_HEADERS,
  appApiV2Contract,
  appendAppV2ContractHeaders,
  appGatewayOrigin,
  appGatewayPath,
  isAppVersionBelow,
  looksLikeOfficialAndroid,
  parseAppVersion,
} from '@/lib/app-gateway';
import { proxyChannelRequest } from '@/lib/channel-gateway';

const ANDROID_ONLY = process.env.APP_API_ANDROID_ONLY === 'true';

function contractJson(payload: unknown, init: ResponseInit = {}): NextResponse {
  const headers = appendAppV2ContractHeaders(new Headers(init.headers));
  return NextResponse.json(payload, { ...init, headers });
}

function gatewayProblem(status: number, title: string, code: string, detail: string): NextResponse {
  return contractJson(
    { type: 'about:blank', title, status, code, detail },
    { status, headers: { 'content-type': 'application/problem+json' } },
  );
}

type Context = { params: Promise<{ path: string[] }> };

async function handle(request: NextRequest, context: Context): Promise<NextResponse> {
  const parts = (await context.params).path;

  if (parts.length === 2 && parts[0] === 'meta' && parts[1] === 'contract') {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return gatewayProblem(
        405,
        'Method Not Allowed',
        'app_gateway_method_not_allowed',
        'contract metadata is read-only',
      );
    }
    const origin = appGatewayOrigin(request.headers);
    if (!origin) {
      return gatewayProblem(400, 'Bad Request', 'app_gateway_origin', 'public origin is unavailable');
    }
    const response = contractJson(appApiV2Contract(origin), {
      status: 200,
      headers: { 'cache-control': 'public, max-age=300' },
    });
    return request.method === 'HEAD'
      ? new NextResponse(null, { status: response.status, headers: response.headers })
      : response;
  }

  const manifestMethod = request.method === 'HEAD' ? 'GET' : request.method;
  const route = matchChannelRoute('APP', manifestMethod, request.nextUrl.pathname);
  if (!route || route.availability !== 'LIVE') {
    return gatewayProblem(
      404,
      'Not Found',
      'app_gateway_path',
      'this path is not part of the live App Core API',
    );
  }

  const targetPath = appGatewayPath(parts);
  if (!targetPath) {
    return gatewayProblem(
      404,
      'Not Found',
      'app_gateway_path',
      'this path has no private API mapping',
    );
  }

  const minimumVersionRaw = process.env.APP_API_MIN_VERSION?.trim();
  if (minimumVersionRaw) {
    const minimumVersion = parseAppVersion(minimumVersionRaw);
    if (!minimumVersion) {
      return gatewayProblem(
        503,
        'Service Unavailable',
        'app_gateway_version_policy_invalid',
        'the app compatibility policy is unavailable',
      );
    }
    const currentVersion = parseAppVersion(request.headers.get('x-moneyverse-app-version'));
    if (!currentVersion || isAppVersionBelow(currentVersion, minimumVersion)) {
      const response = gatewayProblem(
        426,
        'Upgrade Required',
        'app_upgrade_required',
        `app version ${minimumVersionRaw} or newer is required`,
      );
      response.headers.set('x-moneyverse-min-app-version', minimumVersionRaw);
      return response;
    }
  }

  if (ANDROID_ONLY && !looksLikeOfficialAndroid(request.headers)) {
    return gatewayProblem(
      403,
      'Forbidden',
      'android_client_required',
      'this app API is restricted to the Android client',
    );
  }

  if (route.integrityPolicy !== 'NONE' && process.env.APP_API_INTEGRITY_ENFORCEMENT === 'true') {
    if (!request.headers.get('x-play-integrity-token')) {
      return gatewayProblem(
        403,
        'Forbidden',
        'app_integrity_required',
        'this economic action requires mobile integrity evidence',
      );
    }

    // A raw Play Integrity token is not a verdict. The repository does not yet
    // contain a server-side verifier/requestHash validator, so enforcement must
    // fail closed rather than treating attacker-controlled token text as proof.
    return gatewayProblem(
      503,
      'Service Unavailable',
      'app_integrity_verifier_unavailable',
      'mobile integrity enforcement is enabled but verified verdict processing is not available',
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
    if (!origin) {
      return gatewayProblem(400, 'Bad Request', 'app_gateway_origin', 'public origin is unavailable');
    }
    return contractJson({
      authorizationUrl: `${origin}/auth/${encodeURIComponent(parts[1])}/authorize?client=mobile`,
    });
  }

  return proxyChannelRequest('APP', request, route, {
    targetPath,
    gatewayId: 'app-api-v2',
    requestHeaders: APP_API_REQUEST_HEADERS,
    appendResponseHeaders: appendAppV2ContractHeaders,
    problemCodePrefix: 'app_gateway',
  });
}

export const GET = handle;
export const HEAD = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
