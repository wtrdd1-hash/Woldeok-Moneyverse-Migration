import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { viewerOrUnknown } from '@/lib/viewer';

export const dynamic = 'force-dynamic';

const privateHeaders = {
  'cache-control': 'private, no-store',
  'x-robots-tag': 'noindex, nofollow',
  'x-content-type-options': 'nosniff',
};

type NotificationRow = {
  id: string;
  category: string;
  title: string;
  body: string;
  link: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
};

function validDate(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 40 &&
    /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,6})?Z$/.test(value) &&
    !Number.isNaN(Date.parse(value));
}

function isNotification(value: unknown): value is NotificationRow {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  return typeof row.id === 'string' && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(row.id) &&
    typeof row.category === 'string' && row.category.length <= 80 &&
    typeof row.title === 'string' && row.title.length <= 512 &&
    typeof row.body === 'string' && row.body.length <= 4000 &&
    (row.link === null || (typeof row.link === 'string' && row.link.length <= 2048)) &&
    typeof row.is_read === 'boolean' && validDate(row.created_at) &&
    (row.read_at === null || validDate(row.read_at));
}

function csvField(input: string): string {
  const cleaned = input.replace(/[\u0000-\u001f\u007f]/g, ' ');
  // Spreadsheet formula evaluation can begin after whitespace, including a leading tab.
  const safe = /^\s*[=+\-@]/u.test(cleaned) ? `'${cleaned}` : cleaned;
  return `"${safe.replace(/"/g, '""')}"`;
}

function problem(status: number, error: string): NextResponse {
  return NextResponse.json({ error }, { status, headers: privateHeaders });
}

export async function GET(): Promise<NextResponse> {
  const viewer = await viewerOrUnknown().catch(() => null);
  if (!viewer) return problem(503, 'Authentication unavailable');
  if (!viewer.signedIn) return problem(401, 'Unauthorized');

  try {
    const snapshot = await api<unknown>('/api/v1/notifications/archive-snapshot');
    if (snapshot === null || typeof snapshot !== 'object' || Array.isArray(snapshot)) throw new Error('Invalid snapshot');
    const { notifications, complete } = snapshot as Record<string, unknown>;
    if (complete !== true || !Array.isArray(notifications) || notifications.length > 100 || !notifications.every(isNotification)) {
      throw new Error('Incomplete or invalid notification snapshot');
    }
    const header = ['id', 'created_at', 'category', 'title', 'body', 'link', 'is_read', 'read_at'];
    const rows = (notifications as NotificationRow[]).map((row) => [
      row.id, row.created_at, row.category, row.title, row.body, row.link ?? '',
      row.is_read ? 'true' : 'false', row.read_at ?? '',
    ].map(csvField).join(','));
    return new NextResponse(`\uFEFF${header.join(',')}\r\n${rows.join('\r\n')}${rows.length ? '\r\n' : ''}`, {
      status: 200,
      headers: {
        ...privateHeaders,
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': 'attachment; filename="moneyverse-notifications.csv"',
      },
    });
  } catch {
    return problem(503, 'Notification archive unavailable');
  }
}
