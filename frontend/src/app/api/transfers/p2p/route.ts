import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { viewerOrUnknown } from '@/lib/viewer';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: Request): Promise<NextResponse> {
  const viewer = await viewerOrUnknown();

  if (!viewer || !viewer.signedIn) {
    return NextResponse.json({ error: '로그인이 필요한 서비스입니다.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { recipientUserId, amount, message, sticker } = body;

    if (!recipientUserId || !amount) {
      return NextResponse.json({ error: '수취인과 송금 금액을 올바르게 입력해주세요.' }, { status: 400 });
    }

    const idempotencyKey = randomUUID();
    const result = await api<Record<string, unknown>>('/api/v1/wallet/transfers/p2p', {
      method: 'POST',
      body: {
        recipientUserId,
        amount: String(amount),
        idempotencyKey,
        ...(message ? { message: String(message).slice(0, 50) } : {}),
        ...(sticker ? { sticker: String(sticker).slice(0, 20) } : {}),
      },
    });

    return NextResponse.json({ success: true, ...result });

  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || '송금 처리에 실패했습니다. 잔액 또는 수취인 정보를 확인해주세요.' },
      { status: error?.status || 400 },
    );
  }
}
