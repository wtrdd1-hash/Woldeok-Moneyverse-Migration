import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { matchChannelRoute } from '@moneyverse/contract';
import {
  CHANNEL_API_REQUEST_HEADERS,
  proxyChannelRequest,
} from '@/lib/channel-gateway';
import {
  appendSiteContractHeaders,
  siteApiContract,
  siteBackendPath,
  siteGatewayOrigin,
} from '@/lib/site-gateway';

function contractJson(payload: unknown, init: ResponseInit = {}): NextResponse {
  const headers = appendSiteContractHeaders(new Headers(init.headers));
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
        'site_gateway_method_not_allowed',
        'contract metadata is read-only',
      );
    }
    const origin = siteGatewayOrigin(request.headers);
    if (!origin) {
      return gatewayProblem(400, 'Bad Request', 'site_gateway_origin', 'public origin is unavailable');
    }
    const response = contractJson(siteApiContract(origin), {
      status: 200,
      headers: { 'cache-control': 'public, max-age=300' },
    });
    return request.method === 'HEAD'
      ? new NextResponse(null, { status: response.status, headers: response.headers })
      : response;
  }

  const manifestMethod = request.method === 'HEAD' ? 'GET' : request.method;
  const route = matchChannelRoute('SITE', manifestMethod, request.nextUrl.pathname);
  if (!route || route.availability !== 'LIVE') {
    return gatewayProblem(
      404,
      'Not Found',
      'site_gateway_path',
      'this path is not part of the live Site Core API',
    );
  }

  const targetPath = siteBackendPath(request.nextUrl.pathname);
  if (!targetPath) {
    return gatewayProblem(
      404,
      'Not Found',
      'site_gateway_path',
      'this path has no private API mapping',
    );
  }

  return proxyChannelRequest('SITE', request, route, {
    targetPath,
    gatewayId: 'site-api-v1',
    requestHeaders: CHANNEL_API_REQUEST_HEADERS,
    appendResponseHeaders: appendSiteContractHeaders,
    problemCodePrefix: 'site_gateway',
  });
}

export const GET = handle;
export const HEAD = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
