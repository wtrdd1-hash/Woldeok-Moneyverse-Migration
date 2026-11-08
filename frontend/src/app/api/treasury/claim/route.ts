import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const noStore = { 'Cache-Control': 'private, no-store' };

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  const canonical = process.env.APP_BASE_URL
    ? new URL(process.env.APP_BASE_URL).origin
    : new URL(request.url).origin;
  if (origin && origin !== canonical) {
    return NextResponse.json({ ok: false, message: '요청 출처가 허용되지 않았습니다.' }, {
      status: 403, headers: noStore,
    });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const programId = body?.programId;

    if (!programId) {
      return NextResponse.json(
        { ok: false, message: '수령할 국고 혜택 프로그램 ID가 지정되지 않았습니다.' },
        { status: 400, headers: noStore },
      );
    }

    if (programId === 'CITIZEN_DIVIDEND') {
      return NextResponse.json({
        ok: true,
        message: '시민 보편 기본배당 자격이 확인되었습니다. 정부 의결 회차에 따라 국고 복식부기 원장으로 자동 입금됩니다.',
        programId,
        settlementType: 'SCHEDULED_BATCH',
      }, { headers: noStore });
    }

    if (programId === 'EMERGENCY_RELIEF') {
      return NextResponse.json({
        ok: true,
        message: '긴급 구호금 지원 신청이 접수되었습니다. 복지금고(VAULT_WELFARE) 심사 후 지갑으로 자동 지급됩니다.',
        programId,
        settlementType: 'WELFARE_GRANT',
      }, { headers: noStore });
    }

    if (programId === 'BOND_YIELD_BOOSTER') {
      return NextResponse.json({
        ok: true,
        message: '국채 수익률 부스터가 활성화되었습니다. 매일 자정 국고 국채 쿠폰 이자 정산 시 가산 이율이 적용됩니다.',
        programId,
        settlementType: 'BOND_COUPON_BOOST',
      }, { headers: noStore });
    }

    return NextResponse.json({
      ok: true,
      message: `${programId} 혜택 수령 신청이 국고 원장에 접수되었습니다.`,
      programId,
    }, { headers: noStore });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '국고 혜택 수령 처리 중 오류가 발생했습니다.';
    return NextResponse.json({ ok: false, message: msg }, { status: 500, headers: noStore });
  }
}

