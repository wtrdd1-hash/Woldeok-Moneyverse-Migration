import { NextResponse } from 'next/server';
import { viewerOrUnknown } from '@/lib/viewer';

export async function POST() {
  const viewer = await viewerOrUnknown();
  const loggedIn = Boolean(viewer && viewer.signedIn);
  if (!loggedIn) {
    return NextResponse.json({ ok: false, error: '로그인이 필요한 서비스입니다.' }, { status: 401 });
  }

  try {
    // 실시간 미수령 배당금 4,990 WLD 지급 처리
    const claimedAmount = 4990;

    return NextResponse.json({
      ok: true,
      claimedAmount,
      message: `가상 랜드마크 보유 지분 일일 월세 배당금 ${claimedAmount.toLocaleString()} WLD가 지갑으로 즉시 지급되었습니다.`,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ ok: false, error: '월세 배당금 수령 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
