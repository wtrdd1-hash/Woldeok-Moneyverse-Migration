import { NextResponse } from 'next/server';
import { apiOrNull } from '@/lib/api';
import { viewerOrUnknown } from '@/lib/viewer';

export const dynamic = 'force-dynamic';

const privateHeaders = { 'cache-control': 'private, no-store' };

export async function GET(req: Request): Promise<NextResponse> {
  const viewer = await viewerOrUnknown();

  if (!viewer || !viewer.signedIn) {
    return NextResponse.json({ recipients: [] }, { status: 200, headers: privateHeaders });
  }

  const { searchParams } = new URL(req.url);
  const query = (searchParams.get('query') || '').trim();

  const length = Array.from(query).length;
  if (length < 2 || length > 40) {
    return NextResponse.json({ recipients: [] }, { headers: privateHeaders });
  }

  const recipients = await apiOrNull<Array<{ userId: string; displayName: string }>>(`/api/v1/wallet/recipients/search?query=${encodeURIComponent(query)}`);

  return NextResponse.json({ recipients: recipients ?? [] }, { headers: privateHeaders });
}
