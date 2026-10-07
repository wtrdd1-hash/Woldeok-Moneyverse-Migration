import { NextResponse } from 'next/server';
import { apiOrNull } from '@/lib/api';
import { viewerOrUnknown } from '@/lib/viewer';

export const dynamic = 'force-dynamic';

export async function GET(req: Request): Promise<NextResponse> {
  const viewer = await viewerOrUnknown();

  if (!viewer || !viewer.signedIn) {
    return NextResponse.json({ recipients: [] }, { status: 200 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') || '';

  if (!query.trim()) {
    return NextResponse.json({ recipients: [] });
  }

  const recipients = await apiOrNull<any[]>(`/api/v1/wallet/recipients/search?query=${encodeURIComponent(query)}`);

  return NextResponse.json({ recipients: recipients ?? [] });
}
