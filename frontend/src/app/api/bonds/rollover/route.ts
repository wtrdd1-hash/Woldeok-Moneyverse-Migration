import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';

const privateHeaders = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
};

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PUT(req: Request) {
  try {
    const body: unknown = await req.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'INVALID_ROLLOVER_REQUEST' }, { status: 400, headers: privateHeaders });
    }
    const { holdingId, enabled } = body as Record<string, unknown>;
    if (typeof holdingId !== 'string' || !uuid.test(holdingId) || typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'INVALID_ROLLOVER_REQUEST' }, { status: 400, headers: privateHeaders });
    }

    // Obtain CSRF from the current server-side session, never from client-supplied JSON.
    const session = await api<{ csrfToken?: string }>('/api/v1/auth/session');
    if (typeof session?.csrfToken !== 'string' || !session.csrfToken) {
      return NextResponse.json({ error: 'CSRF_REQUIRED' }, { status: 403, headers: privateHeaders });
    }

    const result = await api<{ success?: boolean; holdingId?: string; autoRollover?: boolean }>(
      `/api/v1/bonds/holdings/${holdingId}/rollover`,
      { method: 'PUT', body: { enabled }, csrfToken: session.csrfToken },
    );
    // A zero-row owner update must not become a successful client toast.
    if (result?.success !== true || result.holdingId !== holdingId || result.autoRollover !== enabled) {
      return NextResponse.json({ error: 'BOND_ROLLOVER_NOT_APPLIED' }, { status: 409, headers: privateHeaders });
    }
    return NextResponse.json(result, { headers: privateHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof ApiError ? error.code ?? 'BOND_ROLLOVER_UNAVAILABLE' : 'BOND_ROLLOVER_UNAVAILABLE' },
      { status: error instanceof ApiError ? error.status : 503, headers: privateHeaders },
    );
  }
}
