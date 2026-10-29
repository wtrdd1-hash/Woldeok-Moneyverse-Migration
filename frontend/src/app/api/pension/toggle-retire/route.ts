import { NextResponse } from 'next/server';
import { mutate } from '@/lib/mutate';

export const dynamic = 'force-dynamic';

const privateHeaders = { 'cache-control': 'private, no-store' };

export async function POST(req: Request) {
  // A BFF that mints its own CSRF token must reject cross-origin browser POSTs first.
  const origin = req.headers.get('origin');
  const site = req.headers.get('sec-fetch-site');
  if (!origin || origin !== new URL(req.url).origin || (site !== null && site !== 'same-origin')) {
    return NextResponse.json({ error: 'Forbidden request' }, { status: 403, headers: privateHeaders });
  }

  try {
    const data = await mutate('/api/v1/pension/toggle-retire', { method: 'POST' });
    return NextResponse.json(data, { headers: privateHeaders });
  } catch (error: unknown) {
    const failure = error as { message?: string; status?: number } | null;
    return NextResponse.json(
      { error: failure?.message || '은퇴 연금 상태 전환에 실패했습니다.' },
      { status: failure?.status || 500, headers: privateHeaders },
    );
  }
}
