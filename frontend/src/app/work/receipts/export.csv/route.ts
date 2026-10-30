import { api } from '@/lib/api';
import { requireMember } from '@/lib/session';
import { parseWorkReceiptExport, workReceiptCsv } from '../../work-receipts-export';

export const dynamic = 'force-dynamic';
const privateHeaders = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
};

export async function GET(): Promise<Response> {
  await requireMember();
  try {
    const payload = await api<unknown>('/api/v1/work/receipts/export');
    const verified = parseWorkReceiptExport(payload);
    if (!verified) throw new Error('Unverified receipt export');
    return new Response(workReceiptCsv(verified), {
      status: 200,
      headers: {
        ...privateHeaders,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="moneyverse-work-receipts-recent-20.csv"',
      },
    });
  } catch {
    return new Response('Work receipt export unavailable', {
      status: 503,
      headers: { ...privateHeaders, 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
