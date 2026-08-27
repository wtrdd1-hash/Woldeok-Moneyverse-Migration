import { NextResponse } from 'next/server';

/**
 * Relays the bytes of a published photo.
 *
 * The browser never talks to the API — it talks to Next — so this path has to
 * exist on this origin. It is the `imageUrl` stored on every photo row
 * already in production, which is why it keeps that exact shape.
 *
 * Nothing is decided here. Whether a key names a *published* photo is the
 * API's answer, and this forwards it: 404 stays 404, so an operator's
 * unreviewed upload is as unreachable through Next as it is directly.
 */
const API_ORIGIN = process.env.API_ORIGIN ?? 'http://127.0.0.1:3020';

/** Exactly what the store generates: a v4 UUID and one of three extensions. */
const STORAGE_KEY = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpg|webp)$/;

export async function GET(
  _request: Request,
  context: { readonly params: Promise<{ readonly key: string }> },
): Promise<NextResponse> {
  const { key } = await context.params;

  // Rejected before the request is made, not because the API would accept a
  // malformed key — it re-validates the shape itself — but because there is
  // no reason to forward one.
  if (!STORAGE_KEY.test(key)) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const token = process.env.INTERNAL_API_TOKEN;
  if (!token) throw new Error('INTERNAL_API_TOKEN is not configured');

  const response = await fetch(`${API_ORIGIN}/media/${key}`, {
    headers: { 'x-internal-token': token },
    // The key is a random UUID that never names different bytes, so the
    // cached copy is correct for as long as the photo stays published.
    next: { revalidate: 86_400 },
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'not found' }, { status: response.status });
  }

  return new NextResponse(await response.arrayBuffer(), {
    headers: {
      'content-type': response.headers.get('content-type') ?? 'application/octet-stream',
      'cache-control': 'public, max-age=86400, immutable',
      'x-content-type-options': 'nosniff',
    },
  });
}
