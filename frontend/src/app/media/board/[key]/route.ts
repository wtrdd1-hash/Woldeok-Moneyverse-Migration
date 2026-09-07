import { NextResponse } from 'next/server';

const API_ORIGIN = process.env.API_ORIGIN ?? 'http://127.0.0.1:3020';
const STORAGE_KEY = /^[0-9a-f-]{36}\.(png|jpg|webp)$/;

export async function GET(
  request: Request,
  context: { readonly params: Promise<{ readonly key: string }> },
): Promise<NextResponse> {
  const { key } = await context.params;
  if (!STORAGE_KEY.test(key)) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const token = process.env.INTERNAL_API_TOKEN;
  if (!token) throw new Error('INTERNAL_API_TOKEN is not configured');

  const response = await fetch(`${API_ORIGIN}/api/v1/board/images/${key}`, {
    headers: {
      'x-internal-token': token,
      ...(request.headers.get('cookie') ? { cookie: request.headers.get('cookie')! } : {}),
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    return NextResponse.json({ error: 'not found' }, { status: response.status });
  }
  return new NextResponse(response.body, {
    status: 200,
    headers: {
      'content-type': response.headers.get('content-type') ?? 'application/octet-stream',
      'cache-control': 'private, max-age=300',
      'content-disposition': 'inline',
      'x-content-type-options': 'nosniff',
    },
  });
}
