import { api, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'no-store, max-age=0' };

/** Same-origin, read-only verification; the internal API credential never reaches the browser. */
export async function GET(request: Request): Promise<Response> {
  if (process.env.VERIFIED_HELP_CENTER_V1 !== 'true') {
    return Response.json({ current: false }, { status: 404, headers: noStore });
  }
  const params = new URL(request.url).searchParams;
  const locale = params.get('locale');
  const slug = params.get('slug');
  if (!['ko', 'en'].includes(locale ?? '') || !slug || slug.length > 100 ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return Response.json({ current: false }, { status: 404, headers: noStore });
  }
  try {
    const status = await api<{ current: true; articleId: string; publishedAt: string; reviewedUntil: string }>(
      `/api/v1/help/articles/${locale}/${encodeURIComponent(slug)}/status`, { timeoutMs: 5000 });
    return Response.json(status, { headers: noStore });
  } catch (error) {
    // A 404 is a withdrawal/not-found. An outage is unknown, never verified.
    return Response.json({ current: false }, {
      status: error instanceof ApiError && error.status === 404 ? 404 : 503,
      headers: noStore,
    });
  }
}
