import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';
import { parseEnterpriseEvidence } from '@/app/admin/enterprises/enterprise-evidence';

export const dynamic = 'force-dynamic';

const privateHeaders = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
};

/** Read-only, authenticated proof before the console may announce a refresh. */
export async function GET() {
  // Session, role and open-console checks must run before any data access.
  // The Nest endpoints independently enforce those checks for every read.
  await requireAdminConsole('/admin/enterprises');
  try {
    const [overview, soes, privateEnterprises, dividendLogs] = await Promise.all([
      api<unknown>('/api/v1/admin/enterprises/overview'),
      api<unknown>('/api/v1/admin/enterprises/soes'),
      api<unknown>('/api/v1/admin/enterprises/private'),
      api<unknown>('/api/v1/admin/enterprises/dividend-logs'),
    ]);
    if (parseEnterpriseEvidence({ overview, soes, privateEnterprises, dividendLogs }) === null) {
      throw new Error('Unverified enterprise readback');
    }
    // Do not expose member, governance, or financial data in the browser readback.
    return NextResponse.json({ success: true, sourceStatus: 'VERIFIED' }, {
      headers: privateHeaders,
    });
  } catch {
    return NextResponse.json({ success: false, code: 'SOE_REFRESH_UNVERIFIED' }, {
      status: 503, headers: privateHeaders,
    });
  }
}
