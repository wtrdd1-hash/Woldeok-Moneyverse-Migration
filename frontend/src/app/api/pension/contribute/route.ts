import { NextResponse } from 'next/server';
import { mutate } from '@/lib/mutate';

export const dynamic = 'force-dynamic';

const privateHeaders = { 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex' };

export async function POST(req: Request) {
  // The BFF obtains a session CSRF token itself. Reject foreign browser origins
  // before doing so, or a cross-site request could spend that token.
  const origin = req.headers.get('origin');
  const site = req.headers.get('sec-fetch-site');
  if (!origin || origin !== new URL(req.url).origin || (site !== null && site !== 'same-origin')) {
    return NextResponse.json({ error: 'Forbidden request' }, { status: 403, headers: privateHeaders });
  }

  try {
    const body = await req.json();
    const data = await mutate('/api/v1/pension/contribute', { method: 'POST', body });
    return NextResponse.json(data, { headers: privateHeaders });
  } catch (error: unknown) {
    const failure = error as { message?: string; status?: number } | null;
    return NextResponse.json(
      { error: failure?.message || '국민연금 기여금 납입에 실패했습니다.' },
      { status: failure?.status || 500, headers: privateHeaders },
    );
  }
}
