import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { parseKdicLedgerIntegrity } from '@/app/admin/kdic/kdic-ledger-evidence';

const privateHeaders = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex' };

export async function GET() {
  try {
    const verified = parseKdicLedgerIntegrity(await api<unknown>('/api/v1/admin/kdic/ledger-integrity'));
    if (!verified) throw new Error('Unverified KDIC ledger evidence');
    return NextResponse.json({ success: true, data: verified }, { headers: privateHeaders });
  } catch {
    return NextResponse.json({ success: false, error: 'KDIC 원장 증거를 확인할 수 없습니다.' }, {
      status: 503, headers: privateHeaders,
    });
  }
}
