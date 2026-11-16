import 'server-only';

import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { api, ApiError } from '@/lib/api';

const cacheHeaders = { 'Cache-Control': 'private, no-store' };

export function seoResponse(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, { status, headers: cacheHeaders });
}

/** Reject cross-site browser mutation and requests without trustworthy Origin. */
export function verifySeoWriteOrigin(request: Request): NextResponse | null {
  const origin = request.headers.get('origin');
  const site = request.headers.get('sec-fetch-site');
  if (!origin || origin !== new URL(request.url).origin || (site && site !== 'same-origin')) {
    return seoResponse({ success: false, error: 'cross_origin_forbidden' }, 403);
  }
  return null;
}

/** The operator's backend role and elevated console session are both authoritative. */
export async function verifySeoOperator(): Promise<NextResponse | null> {
  try {
    const security = await api<{ consoleSession?: { state?: string } }>('/api/v1/admin/security');
    if (security.consoleSession?.state !== 'open') {
      return seoResponse({ success: false, error: 'console_locked' }, 403);
    }
    // The transitional Spring admin/security endpoint can trust an internal
    // service token. It authenticates the Next process, not the user. A real
    // human admin must additionally pass Nest's verified cookie/role/console
    // guards before any SEO dashboard read or external search-engine write.
    await api('/api/v1/seo/status/admin');
    return null;
  } catch (error) {
    const status =
      error instanceof ApiError
        ? error.status === 401
          ? 401
          : [403, 428].includes(error.status)
            ? 403
            : 503
        : 503;
    return seoResponse(
      {
        success: false,
        error:
          status === 401
            ? 'login_required'
            : status === 403
              ? 'forbidden'
              : 'authority_unavailable',
      },
      status,
    );
  }
}

/** Block server-rendered SEO administrator pages, even behind an edge gate. */
export async function requireSeoPageOperator(): Promise<void> {
  const denied = await verifySeoOperator();
  if (!denied) return;
  if (denied.status === 401) redirect('/login?error=login_required');
  if (denied.status === 403) redirect('/admin?error=console_locked');
  // A missing/outage authority is not permission to render an admin page.
  throw new Error('SEO operator authority unavailable');
}
