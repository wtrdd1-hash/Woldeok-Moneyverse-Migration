import { NextResponse } from 'next/server';
import { ApiError } from '@/lib/api';
import { mutate } from '@/lib/mutate';
import { viewerOrUnknown } from '@/lib/viewer';

export const dynamic = 'force-dynamic';
const PRIVATE = { 'cache-control': 'private, no-store' };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const AMOUNT = /^[1-9][0-9]{0,37}$/;

function errorResponse(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status, headers: PRIVATE });
}

export async function POST(req: Request): Promise<NextResponse> {
  const site = req.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin' && site !== 'none') {
    return errorResponse('Forbidden request', 403);
  }
  if (!req.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return errorResponse('JSON request required', 415);
  }

  let viewer: Awaited<ReturnType<typeof viewerOrUnknown>>;
  try {
    viewer = await viewerOrUnknown();
  } catch {
    return errorResponse('Authentication status unavailable', 503);
  }
  if (!viewer) return errorResponse('Authentication status unavailable', 503);
  if (!viewer.signedIn) return errorResponse('로그인이 필요한 서비스입니다.', 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid JSON request', 400);
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return errorResponse('Invalid transfer request', 400);
  }
  const { recipientUserId, amount, idempotencyKey, message, sticker } = body as Record<string, unknown>;
  if (
    typeof recipientUserId !== 'string' || !UUID.test(recipientUserId) ||
    typeof amount !== 'string' || !AMOUNT.test(amount) ||
    typeof idempotencyKey !== 'string' || !UUID.test(idempotencyKey) ||
    (message !== undefined && (typeof message !== 'string' || message.length > 30)) ||
    (sticker !== undefined && (typeof sticker !== 'string' || sticker.length > 20))
  ) {
    return errorResponse('수취인과 송금 금액 및 요청 정보를 확인해주세요.', 400);
  }

  try {
    // The CSRF token is acquired and spent server-side; the caller's UUID
    // survives an uncertain network response so the ledger can deduplicate it.
    const result = await mutate<{ transactionId?: unknown }>('/api/v1/wallet/transfers/p2p', {
      body: {
        recipientUserId,
        amount,
        idempotencyKey,
        ...(message ? { message } : {}),
        ...(sticker ? { sticker } : {}),
      },
    });
    if (typeof result?.transactionId !== 'string' || !UUID.test(result.transactionId)) {
      return errorResponse('송금 결과를 확인할 수 없습니다. 거래내역을 확인해주세요.', 503);
    }
    return NextResponse.json({ success: true, transactionId: result.transactionId }, { headers: PRIVATE });
  } catch (error) {
    if (error instanceof ApiError && [400, 401, 403, 404, 409, 422, 429].includes(error.status)) {
      return errorResponse('송금이 완료되지 않았거나 결과를 확인할 수 없습니다.', error.status);
    }
    return errorResponse('송금 결과를 확인할 수 없습니다. 거래내역을 확인한 뒤 재시도해주세요.', 503);
  }
}
