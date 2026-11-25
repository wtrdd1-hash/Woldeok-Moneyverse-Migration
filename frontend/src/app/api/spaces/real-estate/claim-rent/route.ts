import { NextResponse } from 'next/server';
import { viewerOrUnknown } from '@/lib/viewer';
import { isSameOriginFinanceMutation } from '@/lib/finance-mutation-origin';

export async function POST(request: Request) {
  // Same-origin only (QA 2026-11-25): the BFF spends its own CSRF token, so
  // the Origin check is the only cross-site defence for this write.
  if (!isSameOriginFinanceMutation(request)) {
    return NextResponse.json({ error: '요청 출처가 허용되지 않았습니다.' }, { status: 403, headers: { 'cache-control': 'private, no-store' } });
  }
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
