import { NextResponse } from 'next/server';
import { ApiError } from '@/lib/api';
import { mutate } from '@/lib/mutate';
import { viewerOrUnknown } from '@/lib/viewer';
import { verifiedNotificationReadSearch } from '@/lib/notification-read-search-proof';

export const dynamic = 'force-dynamic';
const privateHeaders = { 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex' };
const allowed = new Set(['query', 'category', 'unreadOnly', 'readOnly', 'fromUtc', 'toUtc', 'limit', 'cursor']);
const categories = new Set([
  'TRANSACTIONAL', 'PRODUCT_ACTIVITY', 'SEASON_LIVEOPS', 'SECURITY_CRITICAL',
  'BUSINESS', 'BANK', 'SEASON', 'SPACE', 'SECURITY', 'SYSTEM',
]);

export async function POST(req: Request): Promise<NextResponse> {
  const viewer = await viewerOrUnknown().catch(() => null);
  if (!viewer) return NextResponse.json({ error: 'Authentication unavailable' }, { status: 503, headers: privateHeaders });
  if (!viewer.signedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: privateHeaders });
  const fetchSite = req.headers.get('sec-fetch-site');
  if (req.headers.get('x-moneyverse-notification-search') !== '1' ||
      !req.headers.get('content-type')?.startsWith('application/json') ||
      (fetchSite !== null && !['same-origin', 'none'].includes(fetchSite)) ||
      Number(req.headers.get('content-length') ?? '0') > 4096) {
    return NextResponse.json({ error: 'Forbidden request' }, { status: 403, headers: privateHeaders });
  }
  let body: unknown;
  try {
    const raw = await req.text();
    if (raw.length > 4096) throw new Error('oversized');
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid search request' }, { status: 400, headers: privateHeaders });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body) ||
      Object.keys(body).some((key) => !allowed.has(key))) {
    return NextResponse.json({ error: 'Invalid search request' }, { status: 400, headers: privateHeaders });
  }
  const filter = body as Record<string, unknown>;
  if (typeof filter.query !== 'string' || [...filter.query.normalize('NFC').trim()].length < 2 ||
      [...filter.query.normalize('NFC').trim()].length > 80 ||
      typeof filter.fromUtc !== 'string' || typeof filter.toUtc !== 'string' ||
      (filter.category !== undefined && !categories.has(String(filter.category))) ||
      (filter.unreadOnly !== undefined && typeof filter.unreadOnly !== 'boolean') ||
      (filter.readOnly !== undefined && typeof filter.readOnly !== 'boolean') ||
      (filter.readOnly === true && filter.unreadOnly === true) ||
      (filter.limit !== undefined && (!Number.isInteger(filter.limit) || (filter.limit as number) < 1 || (filter.limit as number) > 50)) ||
      (filter.cursor !== undefined && (typeof filter.cursor !== 'string' || filter.cursor.length > 2048))) {
    return NextResponse.json({ error: 'Invalid search request' }, { status: 400, headers: privateHeaders });
  }
  try {
    const result = await mutate<unknown>('/api/v1/notifications/search', { body: filter });
    if (!result || typeof result !== 'object' || !('items' in result) || !Array.isArray(result.items) || result.items.length > 50 ||
        !('hasMore' in result) || typeof result.hasMore !== 'boolean' ||
        !('nextCursor' in result) || (result.nextCursor !== null && (typeof result.nextCursor !== 'string' || result.nextCursor.length > 2048)) ||
        !('asOfUtc' in result) || typeof result.asOfUtc !== 'string') {
      throw new Error('Invalid search envelope');
    }
    if (!verifiedNotificationReadSearch(result, filter.readOnly === true, filter.unreadOnly === true)) {
      throw new Error('Notification read state is unverified');
    }
    return NextResponse.json(result, { headers: privateHeaders });
  } catch (error: unknown) {
    const status = error instanceof ApiError && [400, 401, 403, 409, 410, 429].includes(error.status) ? error.status : 503;
    return NextResponse.json({ error: 'Notification search unavailable' }, { status, headers: privateHeaders });
  }
}
