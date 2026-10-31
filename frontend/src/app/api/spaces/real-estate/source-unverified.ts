import { NextResponse } from 'next/server';
import { viewerOrUnknown } from '@/lib/viewer';

const PRIVATE_HEADERS = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
  Vary: 'Cookie',
};

export function sourceUnavailable(code: 'LANDMARK_AUCTION_SOURCE_UNVERIFIED' | 'LANDMARK_RENT_LEDGER_UNVERIFIED') {
  return NextResponse.json({
    ok: false,
    code,
    error: 'Verified auction ownership and ledger-backed settlement are not available.',
  }, { status: 503, headers: PRIVATE_HEADERS });
}

export async function protectedLandmarkWrite(code: 'LANDMARK_AUCTION_SOURCE_UNVERIFIED' | 'LANDMARK_RENT_LEDGER_UNVERIFIED') {
  // An unknown identity is an unavailable source, not proof of a signed-out member.
  const viewer = await viewerOrUnknown();
  if (!viewer) {
    return NextResponse.json({ ok: false, code: 'AUTH_SOURCE_UNVERIFIED' }, {
      status: 503, headers: PRIVATE_HEADERS,
    });
  }
  if (!viewer.signedIn) {
    return NextResponse.json({ ok: false, code: 'AUTH_REQUIRED' }, {
      status: 401, headers: PRIVATE_HEADERS,
    });
  }
  return sourceUnavailable(code);
}
