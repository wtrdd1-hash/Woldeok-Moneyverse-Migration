import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';
import { currentViewer, isAdministrator } from '@/lib/viewer';

const ALLOWED_PATHS = new Set([
  '/api/v1/admin/auth/channel-otp/request',
  '/api/v1/treasury/salary/disburse',
  '/api/v1/treasury/mint-topup',
]);

function response(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'private, no-store' },
  });
}

/** Same-origin Next-to-Nest bridge; never publish the internal backend prefix. */
export async function forwardAdministratorPost(request: Request, path: string): Promise<NextResponse> {
  if (!ALLOWED_PATHS.has(path)) return response({ error: 'INVALID_ADMIN_ACTION' }, 400);

  const origin = request.headers.get('origin');
  const site = request.headers.get('sec-fetch-site');
  if (!origin || origin !== new URL(request.url).origin || (site && site !== 'same-origin')) {
    return response({ error: 'CROSS_ORIGIN_FORBIDDEN' }, 403);
  }

  const raw = await request.text().catch(() => '');
  if (raw.length > 4096) return response({ error: 'PAYLOAD_TOO_LARGE' }, 413);
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return response({ error: 'INVALID_JSON' }, 400);
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return response({ error: 'INVALID_BODY' }, 400);
  }

  try {
    const viewer = await currentViewer();
    if (!isAdministrator(viewer)) return response({ error: 'ADMIN_REQUIRED' }, 403);

    const session = await api<{ csrfToken?: string }>('/api/v1/auth/session');
    if (!session.csrfToken) return response({ error: 'CSRF_REQUIRED' }, 403);

    const result = await api(path, { method: 'POST', body, csrfToken: session.csrfToken });
    return response(result);
  } catch (error: unknown) {
    const status = error instanceof ApiError ? error.status : 503;
    // Do not reflect raw upstream/internal infrastructure errors into administrator UI.
    const code = status === 429 ? 'OTP_RATE_LIMITED'
      : status === 403 ? 'OTP_OR_AUTHORIZATION_REJECTED'
      : status === 400 ? 'INVALID_ADMIN_REQUEST'
      : 'ADMIN_ACTION_UNAVAILABLE';
    return response({ error: code }, [400, 401, 403, 429].includes(status) ? status : 503);
  }
}
