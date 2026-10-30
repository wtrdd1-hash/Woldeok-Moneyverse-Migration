import { api } from '@/lib/api';
import { requireMember } from '@/lib/session';
import { parseSecurityEvents } from '../account-security-evidence';
import { securityEventsCsv } from './csv';

export const dynamic = 'force-dynamic';

const privateHeaders = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'X-Content-Type-Options': 'nosniff',
};

/** Never interpret a failed or malformed security audit read as an empty history. */
export async function GET(): Promise<Response> {
  await requireMember();
  try {
    const events = parseSecurityEvents(await api<unknown>('/api/v1/account/security/events'));
    if (events === null) throw new Error('security events are unverified');
    return new Response(securityEventsCsv(events), {
      status: 200,
      headers: {
        ...privateHeaders,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="moneyverse-security-events-recent.csv"',
      },
    });
  } catch {
    return new Response('Security activity unavailable', {
      status: 503,
      headers: { ...privateHeaders, 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
