import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { verifiedArticlesForAdmin } from '@/app/blog/blog-verified-client';
import { currentViewer, isAdministrator } from '@/lib/viewer';

export const dynamic = 'force-dynamic';

const privateHeaders = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
} as const;

function reply(payload: unknown, status: number) {
  return NextResponse.json(payload, { status, headers: privateHeaders });
}

/**
 * Read-only, elevated-session backend proof. Never replace a failed source
 * with an empty list: that would erase the operator's view of real articles.
 */
export async function GET() {
  try {
    if (!isAdministrator(await currentViewer())) {
      return reply({ success: false, code: 'FORBIDDEN' }, 403);
    }
    const response: unknown = await api('/api/v1/admin/blog-verified', { timeoutMs: 5000 });
    if (!response || typeof response !== 'object') throw new Error('invalid response');
    const rows = (response as Record<string, unknown>).posts;
    if (!Array.isArray(rows) || rows.length > 200) throw new Error('invalid list');
    const posts = verifiedArticlesForAdmin(rows);
    if (posts.length !== rows.length || new Set(posts.map((post) => post.slug)).size !== posts.length) {
      throw new Error('partial, duplicate or unverified list');
    }
    return reply({ success: true, posts, verifiedCount: posts.length, observedAt: new Date().toISOString() }, 200);
  } catch {
    return reply({ success: false, code: 'VERIFIED_BLOG_UNAVAILABLE' }, 503);
  }
}
