import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { isLoggedInMember } from '@/lib/session';

export const dynamic = 'force-dynamic';

// The former file-backed votes had no voter identity, ledger settlement or
// authoritative PostgreSQL receipt. Never turn that local JSON into governance.
const UNVERIFIED = {
  ok: false,
  verified: false,
  proposals: [],
  code: 'treasury_proposals_unverified',
  message: '공공사업 제안과 투표 기록의 원장 검증이 준비되지 않아 이 기능을 일시 중단했습니다.',
} as const;

function unavailable(): NextResponse {
  return NextResponse.json(UNVERIFIED, {
    status: 503,
    headers: { 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex, nofollow' },
  });
}

export async function GET(): Promise<NextResponse> {
  try {
    // A successful HTTP response alone is not a verified governance receipt.
    // Require an explicit reviewed DB-backed contract before enabling reads.
    await api('/api/v1/treasury/citizen-proposals');
  } catch {
    // Never substitute demo proposals for a missing authoritative response.
  }
  return unavailable();
}

async function blockedMutation(): Promise<NextResponse> {
  if (!(await isLoggedInMember())) {
    return NextResponse.json({ ok: false, verified: false, code: 'authentication_required' }, {
      status: 401,
      headers: { 'cache-control': 'private, no-store' },
    });
  }
  // No filesystem write, guessed vote, synthetic proposal ID or WLD debit.
  return unavailable();
}

export async function POST(_request: Request): Promise<NextResponse> {
  return blockedMutation();
}

export async function PUT(_request: Request): Promise<NextResponse> {
  return blockedMutation();
}
