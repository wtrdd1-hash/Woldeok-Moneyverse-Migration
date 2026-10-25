import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';
import { viewerOrUnknown } from '@/lib/viewer';
import { isLedgerUuid, verifiedP2PReceipt } from '@/lib/p2p-receipt';

export const dynamic = 'force-dynamic';

const PRIVATE_HEADERS = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
};

function reply(body: unknown, status: number): NextResponse {
  return NextResponse.json(body, { status, headers: PRIVATE_HEADERS });
}

export async function POST(req: Request): Promise<NextResponse> {
  const viewer = await viewerOrUnknown();
  if (!viewer?.signedIn) {
    return reply({ error: '로그인이 필요한 서비스입니다.' }, 401);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return reply({ error: '송금 요청 형식이 올바르지 않습니다.' }, 400);
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return reply({ error: '송금 요청 형식이 올바르지 않습니다.' }, 400);
  }

  const { recipientUserId, amount, idempotencyKey, message, sticker } = body as Record<string, unknown>;
  if (
    !isLedgerUuid(recipientUserId) ||
    !isLedgerUuid(idempotencyKey) ||
    typeof amount !== 'string' ||
    !/^[1-9][0-9]*$/.test(amount) ||
    (message !== undefined && (typeof message !== 'string' || message.length > 30)) ||
    (sticker !== undefined && (typeof sticker !== 'string' || sticker.length > 20))
  ) {
    return reply({ error: '수취인과 송금 금액을 올바르게 입력해주세요.' }, 400);
  }

  try {
    const upstream = await api<unknown>('/api/v1/wallet/transfers/p2p', {
      method: 'POST',
      body: {
        recipientUserId,
        amount,
        idempotencyKey,
        ...(message ? { message } : {}),
        ...(sticker ? { sticker } : {}),
      },
    });
    const receipt = verifiedP2PReceipt(upstream);
    if (!receipt) {
      // A malformed response may follow a committed ledger transfer.
      return reply({ code: 'TRANSFER_OUTCOME_UNKNOWN' }, 503);
    }
    return reply({ success: true, transactionId: receipt.transactionId }, 200);
  } catch (error: unknown) {
    if (error instanceof ApiError && [400, 401, 403, 404, 422].includes(error.status)) {
      return reply({ error: '송금 요청이 거절되었습니다.' }, error.status);
    }
    // 409, 5xx and network errors are not evidence that no WLD moved.
    return reply({ code: 'TRANSFER_OUTCOME_UNKNOWN' }, 503);
  }
}
