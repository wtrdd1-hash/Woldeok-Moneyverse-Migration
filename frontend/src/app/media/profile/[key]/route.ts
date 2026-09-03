import { NextResponse } from 'next/server';

const API_ORIGIN = process.env.API_ORIGIN ?? 'http://127.0.0.1:3020';
const STORAGE_KEY =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpg|webp)$/;

/** Relays a profile picture while preserving the viewer the database checks. */
export async function GET(
  request: Request,
  context: { readonly params: Promise<{ readonly key: string }> },
): Promise<NextResponse> {
  const { key } = await context.params;
  if (!STORAGE_KEY.test(key)) {
    return NextResponse.json(
      { error: 'not found' },
      { status: 404, headers: { 'cache-control': 'private, no-store' } },
    );
  }

  const token = process.env.INTERNAL_API_TOKEN;
  if (!token) throw new Error('INTERNAL_API_TOKEN is not configured');

  const cookie = request.headers.get('cookie');
  const response = await fetch(`${API_ORIGIN}/media/profile/${key}`, {
    headers: {
      'x-internal-token': token,
      ...(cookie ? { cookie } : {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: 'not found' },
      { status: response.status, headers: { 'cache-control': 'private, no-store' } },
    );
  }

  return new NextResponse(await response.arrayBuffer(), {
    headers: {
      'content-type': response.headers.get('content-type') ?? 'application/octet-stream',
      'cache-control': response.headers.get('cache-control') ?? 'private, no-store',
      'content-disposition': 'inline',
      'x-content-type-options': 'nosniff',
    },
  });
}
