import { api } from '@/lib/api';
import { requireMember } from '@/lib/session';
import { bankStatementCsv, type BankStandingSnapshot } from '../bank-statement';

export const dynamic = 'force-dynamic';

const privateHeaders = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'X-Content-Type-Options': 'nosniff',
};

export async function GET(): Promise<Response> {
  await requireMember();
  try {
    const snapshot = await api<BankStandingSnapshot>('/api/v1/banking/standing/snapshot');
    const csv = bankStatementCsv(snapshot);
    return new Response(csv, {
      status: 200,
      headers: {
        ...privateHeaders,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="moneyverse-bank-statement.csv"',
      },
    });
  } catch {
    return new Response('Bank statement unavailable', {
      status: 503,
      headers: { ...privateHeaders, 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
