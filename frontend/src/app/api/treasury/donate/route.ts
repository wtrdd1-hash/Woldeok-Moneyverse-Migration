import { isSameOriginFinanceMutation } from '@/lib/finance-mutation-origin';
import { NextResponse } from 'next/server';
import { mutate } from '@/lib/mutate';
import { ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';
const headers = { 'cache-control':'private, no-store', 'x-robots-tag':'noindex' };
const keyPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const nonNegativeMoney = /^(?:0|[1-9][0-9]*)$/;

export async function POST(request: Request) {
  if (!isSameOriginFinanceMutation(request)) {
    return NextResponse.json({ code: 'REQUEST_ORIGIN_FORBIDDEN' }, { status: 403, headers });
  }
  try {
    const body = await request.json() as Record<string, unknown>;
    const amount = body.amountWld;
    const key = body.idempotencyKey;
    const memo = body.memo === undefined ? '국고 자발적 공공 기부' : body.memo;
    if (typeof amount !== 'string' || !/^[1-9][0-9]{0,15}$/.test(amount)
      || BigInt(amount) > 1000000000000000n
      || typeof key !== 'string' || !keyPattern.test(key)
      || typeof memo !== 'string' || memo.length > 300) {
      return NextResponse.json({code:'INVALID_TREASURY_DONATION'}, {status:400,headers});
    }
    const response = await mutate<Record<string, unknown>>('/api/v1/treasury/donate', {
      method:'POST', body:{amountWld:amount,memo,idempotencyKey:key},
    });
    if (response?.success !== true || typeof response.donation_id !== 'string' || !uuidPattern.test(response.donation_id)
      || typeof response.ledger_transaction_id !== 'string' || !uuidPattern.test(response.ledger_transaction_id)
      || response.donated_amount_wld !== amount || typeof response.user_balance_after !== 'string'
      || typeof response.vault_balance_after !== 'string'
      || !nonNegativeMoney.test(response.user_balance_after) || !nonNegativeMoney.test(response.vault_balance_after)
      || typeof response.honor_title !== 'string' || !response.honor_title) {
      throw new Error('DB-owned donation receipt did not match the verified request');
    }
    return NextResponse.json(response, {headers});
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403 || error.status === 400 || error.status === 422)) {
      return NextResponse.json({
        code: error.status === 401 ? 'AUTHENTICATION_REQUIRED' : error.status === 403 ? 'AUTHORIZATION_DENIED' : 'INVALID_TREASURY_DONATION',
      }, {status:error.status === 422 ? 400 : error.status,headers});
    }
    return NextResponse.json({code:'TREASURY_DONATION_RECEIPT_UNVERIFIED'}, {status:503,headers});
  }
}
