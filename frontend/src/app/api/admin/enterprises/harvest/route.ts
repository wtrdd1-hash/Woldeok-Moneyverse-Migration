import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { enterpriseMutationCsrf } from '../mutation-security';

export async function POST(req: Request) {
  try {
    const csrfToken = await enterpriseMutationCsrf(req);
    if (typeof csrfToken !== 'string') return csrfToken;
    const data = await api<{ total_dividends_collected?: string; treasury_balance_after?: string; enterprises_processed?: number }>('/api/v1/admin/enterprises/soes/harvest', {
      method: 'POST',
      body: {},
      csrfToken,
    });
    if (!data || typeof data.total_dividends_collected !== 'string' ||
        !/^(0|[1-9]\d*)$/.test(data.total_dividends_collected) ||
        typeof data.treasury_balance_after !== 'string' ||
        !/^(0|[1-9]\d*)$/.test(data.treasury_balance_after) ||
        typeof data.enterprises_processed !== 'number' ||
        !Number.isSafeInteger(data.enterprises_processed) || data.enterprises_processed < 0) {
      return NextResponse.json({ error: 'unverified dividend settlement response' }, { status: 502 });
    }
    return NextResponse.json(data, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || '공기업 배당금 국고 수취 요청에 실패했습니다.' },
      { status: error?.status || 500 },
    );
  }
}
