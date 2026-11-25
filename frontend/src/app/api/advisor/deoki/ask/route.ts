import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { isSameOriginFinanceMutation } from '@/lib/finance-mutation-origin';

export const dynamic = 'force-dynamic';

const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex' };

function unavailable(error: unknown): NextResponse {
  const status = typeof error === 'object' && error !== null && 'status' in error &&
    [401, 403, 428, 429].includes(Number(error.status)) ? Number(error.status) : 503;
  return NextResponse.json({ ok: false, error: 'advisor_source_unavailable' },
    { status, headers: PRIVATE_HEADERS });
}

export async function POST(req: Request): Promise<NextResponse> {
  // Shared same-origin guard (QA 2026-11-25): the hand-rolled check here either
  // failed open without an Origin or refused every proxied browser request.
  if (!isSameOriginFinanceMutation(req)) {
    return NextResponse.json({ ok: false, error: 'forbidden_origin' }, { status: 403, headers: PRIVATE_HEADERS });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400, headers: PRIVATE_HEADERS });
  }
  const question = typeof body === 'object' && body !== null && 'question' in body ? body.question : null;
  if (typeof question !== 'string' || !question.trim() || question.length > 2000) {
    return NextResponse.json({ ok: false, error: 'invalid_question' }, { status: 400, headers: PRIVATE_HEADERS });
  }

  try {
    // The backend's CSRF guard is authoritative; never manufacture a token.
    const session = await api<{ csrfToken?: string }>('/api/v1/auth/session');
    if (typeof session?.csrfToken !== 'string' || !session.csrfToken) {
      return NextResponse.json({ ok: false, error: 'csrf_unavailable' }, { status: 403, headers: PRIVATE_HEADERS });
    }
    const result = await api<{ success?: boolean; answer?: string }>('/api/v1/advisor/deoki/ask', {
      method: 'POST', csrfToken: session.csrfToken, body: { question },
    });
    if (result?.success !== true || typeof result.answer !== 'string') return unavailable(null);
    return NextResponse.json(result, { headers: PRIVATE_HEADERS });
  } catch (error: unknown) {
    // No fabricated WLD yield, Sharpe ratio, diagnosis, or advice on failure.
    return unavailable(error);
  }
}
