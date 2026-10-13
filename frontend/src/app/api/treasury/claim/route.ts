import { NextResponse } from 'next/server';
import { isLoggedInMember } from '@/lib/session';
import type { TreasuryProgramId } from '@/app/treasury/treasury.types';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const isLoggedIn = await isLoggedInMember();
    if (!isLoggedIn) {
      return NextResponse.json(
        { ok: false, message: '로그인이 필요한 서비스입니다.' },
        { status: 401 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      programId?: TreasuryProgramId;
    };

    const programId = body.programId;
    if (!programId) {
      return NextResponse.json(
        { ok: false, message: '프로그램 식별자가 누락되었습니다.' },
        { status: 400 }
      );
    }

    let disbursedAmountWld = 0;
    let programName = '';

    switch (programId) {
      case 'CITIZEN_DIVIDEND':
        disbursedAmountWld = 1200;
        programName = '시민 보편 기본배당';
        break;
      case 'EMERGENCY_RELIEF':
        disbursedAmountWld = 3000;
        programName = '취약계층 긴급 구호 복지금';
        break;
      case 'BOND_YIELD_BOOSTER':
        disbursedAmountWld = 500;
        programName = '공공 국채 우대금리 부스터';
        break;
      default:
        return NextResponse.json(
          { ok: false, message: '즉시 수령이 지원되지 않는 프로그램입니다.' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      ok: true,
      message: `${programName} ${disbursedAmountWld.toLocaleString()} WLD가 귀하의 지갑 계좌로 즉시 지급되었습니다.`,
      disbursedAmountWld,
      programId,
      claimedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
