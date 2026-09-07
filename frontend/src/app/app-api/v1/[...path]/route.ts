import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { appGatewayOrigin, appGatewayPath } from '@/lib/app-gateway';

const API_ORIGIN = process.env.API_ORIGIN ?? 'http://127.0.0.1:3020';
const METHODS_WITH_BODY = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function internalToken(): string {
  const token = process.env.INTERNAL_API_TOKEN;
  if (!token) throw new Error('INTERNAL_API_TOKEN is not configured');
  return token;
}

async function proxy(request: NextRequest, parts: readonly string[]): Promise<NextResponse> {
  const path = appGatewayPath(parts);
  if (!path) return NextResponse.json({ title: 'Not Found' }, { status: 404 });

  const outgoing = new Headers({
    accept: request.headers.get('accept') ?? 'application/json',
    'x-internal-token': internalToken(),
  });
  for (const name of [
    'cookie',
    'content-type',
    'x-csrf-token',
    'user-agent',
    'cf-connecting-ip',
    'x-forwarded-for',
    'cf-ipcountry',
  ]) {
    const value = request.headers.get(name);
    if (value) outgoing.set(name, value);
  }
  const publicOrigin = appGatewayOrigin(request.headers);
  if (publicOrigin) outgoing.set('x-public-origin', publicOrigin);
  const target = new URL(path, API_ORIGIN);
  target.search = request.nextUrl.search;

  const response = await fetch(target, {
    method: request.method,
    headers: outgoing,
    ...(METHODS_WITH_BODY.has(request.method) ? { body: await request.arrayBuffer() } : {}),
    cache: 'no-store',
    redirect: 'manual',
    signal: AbortSignal.timeout(15_000),
  });

  const headers = new Headers();
  for (const name of ['content-type', 'cache-control', 'location']) {
    const value = response.headers.get(name);
    if (value) headers.set(name, value);
  }
  for (const cookie of response.headers.getSetCookie()) headers.append('set-cookie', cookie);

  return new NextResponse(response.body, { status: response.status, headers });
}

type Context = { params: Promise<{ path: string[] }> };
async function handle(request: NextRequest, context: Context) {
  return proxy(request, (await context.params).path);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
