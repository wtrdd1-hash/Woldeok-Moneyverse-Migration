import { NextResponse } from 'next/server';

const PRIVATE_HEADERS = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
};

export function realEstateUnavailable(kind: 'read' | 'settlement') {
  return NextResponse.json({
    ok: false,
    code: kind === 'read' ? 'REAL_ESTATE_SOURCE_UNVERIFIED' : 'REAL_ESTATE_LEDGER_UNAVAILABLE',
    error: 'Verified real-estate ownership, bidding and WLD settlement are temporarily unavailable.',
  }, { status: 503, headers: PRIVATE_HEADERS });
}

export function realEstateUnauthorized() {
  return NextResponse.json({ ok: false, error: '로그인이 필요한 서비스입니다.' }, {
    status: 401, headers: PRIVATE_HEADERS,
  });
}
