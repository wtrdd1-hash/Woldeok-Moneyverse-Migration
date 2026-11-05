import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const result = await api<{
      success: boolean;
      code: string;
      message: string;
      total_dividends_collected: string;
      enterprises_processed: number;
      treasury_balance_after: string;
      ledger_transaction_id?: string;
    }>('/api/v1/admin/enterprises/soes/harvest', {
      method: 'POST',
    });

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    const message = error instanceof ApiError ? error.message : '공기업 배당 수취 처리에 실패했습니다.';
    const code = error instanceof ApiError ? error.code ?? 'SOE_DIVIDEND_HARVEST_FAILED' : 'SOE_DIVIDEND_HARVEST_FAILED';

    return NextResponse.json(
      { code, error: message },
      { status, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
