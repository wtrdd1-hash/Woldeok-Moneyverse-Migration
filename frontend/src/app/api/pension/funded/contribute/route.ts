import { NextResponse } from 'next/server';
import { mutate } from '@/lib/mutate';
import { ApiError } from '@/lib/api';
export const dynamic = 'force-dynamic';
const headers = { 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex' };
export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  const site = request.headers.get('sec-fetch-site');
  if (!origin || origin !== new URL(request.url).origin
    || (site !== null && site !== 'same-origin')) {
    return NextResponse.json({ error: 'Forbidden request' }, { status: 403, headers });
  }
  try {
    const body = await request.json() as Record<string, unknown>;
    const amount = body.amountWld;
    const key = body.idempotencyKey;
    if (typeof amount !== 'string' || !/^[1-9][0-9]{0,79}$/.test(amount)
      || typeof key !== 'string'
      || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key)) {
      return NextResponse.json({ error: 'Invalid Treasury Core request' }, { status: 400, headers });
    }
    const result = await mutate('/api/v1/pension/funded/contribute', {
      method: 'POST',
      body: { amountWld: amount, idempotencyKey: key },
    }) as Record<string, unknown>;
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const wld = /^(?:0|[1-9][0-9]{0,79})$/;
    if (!result || typeof result.ledger_transaction_id !== 'string'
      || !uuid.test(result.ledger_transaction_id)
      || result.principal_wld !== amount
      || typeof result.user_disbursement_wld !== 'string'
      || typeof result.welfare_fee_wld !== 'string'
      || typeof result.fund_balance_wld !== 'string'
      || !wld.test(result.user_disbursement_wld)
      || !wld.test(result.welfare_fee_wld)
      || !wld.test(result.fund_balance_wld)
      || typeof result.replayed !== 'boolean') {
      throw new Error('Treasury Core DB-owned receipt was not certified');
    }
    const refunded = BigInt(result.user_disbursement_wld);
    const fee = BigInt(result.welfare_fee_wld);
    if (refunded !== 0n || fee !== 0n) {
      throw new Error('Treasury Core monetary conservation evidence failed');
    }
    return NextResponse.json(result, { headers });
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      return NextResponse.json({
        code: error.status === 401 ? 'AUTHENTICATION_REQUIRED' : 'AUTHORIZATION_DENIED',
      }, { status: error.status, headers });
    }
    return NextResponse.json(
      { code: 'TREASURY_CORE_SETTLEMENT_UNVERIFIED', error: '정식 원장 영수증 검증 또는 지급 재원이 부족합니다.' },
      { status: 503, headers },
    );
  }
}
