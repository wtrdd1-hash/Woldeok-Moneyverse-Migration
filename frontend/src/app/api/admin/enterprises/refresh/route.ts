import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';
import { parseEnterpriseEvidence } from '@/app/admin/enterprises/enterprise-evidence';

export const dynamic = 'force-dynamic';

const privateHeaders = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
};

/** Read-only, authenticated proof before the console may announce a refresh. */
export async function GET() {
  // The backend enforces session, consent and administrator role. Check
  // console elevation here too; every subsequent Nest read repeats that gate.
  // Unlike page redirects, API errors must keep private headers even offline.
  try {
    const admin = await api<{ consoleSession?: { state?: string } }>('/api/v1/admin/security');
    if (admin?.consoleSession?.state !== 'open') {
      return NextResponse.json({ success: false, code: 'SOE_REFRESH_CONSOLE_LOCKED' }, {
        status: 403, headers: privateHeaders,
      });
    }
  } catch (error) {
    const status = error instanceof ApiError
      ? error.status === 401 ? 401 : [403, 428].includes(error.status) ? 403 : 503
      : 503;
    return NextResponse.json({ success: false, code: 'SOE_REFRESH_AUTH_UNAVAILABLE' }, {
      status, headers: privateHeaders,
    });
  }
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
