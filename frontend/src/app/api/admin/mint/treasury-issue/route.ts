import { type NextRequest, NextResponse } from 'next/server';
import { ApiError } from '@/lib/api';
import { mutate } from '@/lib/mutate';
import { isSameOriginFinanceMutation } from '@/lib/finance-mutation-origin';

export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  if (!isSameOriginFinanceMutation(req)) {
    return NextResponse.json({ code: 'REQUEST_ORIGIN_FORBIDDEN' }, { status: 403, headers });
  }
  try {
    const body = await req.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)
      || typeof body.policy_order_id !== 'string' || !uuid.test(body.policy_order_id)
      || typeof body.request_key !== 'string' || !uuidV4.test(body.request_key)
      || typeof body.amount_wld !== 'string' || !/^[1-9][0-9]{0,7}$/.test(body.amount_wld)
      || BigInt(body.amount_wld) > 10000000n) {
      return NextResponse.json({ code: 'INVALID_TREASURY_ISSUANCE',
        error: '승인된 명령서·1~10,000,000 WLD·요청 ID를 확인해 주세요.' },
      { status: 422, headers });
    }
    const receipt = await mutate<Record<string, unknown>>('/api/v1/admin/economy/monetary/execute-treasury-mint', {
      method: 'POST', body: {
        policy_order_id: body.policy_order_id,
        amount_wld: body.amount_wld,
        request_key: body.request_key,
      },
    });
    if (receipt?.success !== true || receipt?.code !== 'TREASURY_MINT_SETTLED'
      || receipt.amount_wld !== body.amount_wld || typeof receipt.ledger_transaction_id !== 'string'
      || !uuid.test(receipt.ledger_transaction_id) || typeof receipt.mint_certificate_id !== 'string'
      || !uuid.test(receipt.mint_certificate_id)
      || typeof receipt.vault_after_wld !== 'string' || !/^(0|[1-9][0-9]*)$/.test(receipt.vault_after_wld)) {
      return NextResponse.json({ code: 'TREASURY_MINT_RECEIPT_UNVERIFIED' }, { status: 503, headers });
    }
    return NextResponse.json(receipt, { headers });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 503;
    const safe = status === 400 || status === 401 || status === 403 || status === 409 || status === 422;
    return NextResponse.json({
      code: safe ? 'TREASURY_MINT_DENIED' : 'TREASURY_MINT_UNAVAILABLE',
      error: safe ? '동결·관리자 권한·정책 한도 또는 중복 요청을 확인해 주세요.' : '국고 정본 발행 영수증을 검증할 수 없습니다.',
    }, { status: safe ? status : 503, headers });
  }
}
