import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { viewerOrUnknown } from '@/lib/viewer';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id: auctionId } = await params;
  try {
    const result = await api<Record<string, unknown>>(`/api/v1/market/secret-auction/${auctionId}/logs`, {
      method: 'GET',
    });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || '입찰 로그를 불러오지 못했습니다.' },
      { status: error?.status || 400 },
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const viewer = await viewerOrUnknown();
  if (!viewer || !viewer.signedIn) {
    return NextResponse.json({ error: '로그인이 필요한 서비스입니다.' }, { status: 401 });
  }

  const { id: auctionId } = await params;

  try {
    const body = await req.json();
    const { bidAmount } = body;

    if (!bidAmount || Number(bidAmount) <= 0) {
      return NextResponse.json({ error: '입찰 금액을 올바르게 입력해주세요.' }, { status: 400 });
    }

    const result = await api<Record<string, unknown>>(`/api/v1/market/secret-auction/${auctionId}/bid`, {
      method: 'POST',
      body: {
        bidAmount: Number(bidAmount),
      },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || '입찰 처리에 실패했습니다.' },
      { status: error?.status || 400 },
    );
  }
}
