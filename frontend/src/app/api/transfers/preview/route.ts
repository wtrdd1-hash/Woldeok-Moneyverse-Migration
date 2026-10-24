import { NextResponse } from 'next/server';
import { ApiError, api } from '@/lib/api';

export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' };

function problem(status: number) {
  return NextResponse.json({ error: 'transfer preview unavailable' }, { status, headers: PRIVATE_HEADERS });
}

export async function GET(request: Request): Promise<NextResponse> {
  const params = new URL(request.url).searchParams;
  const recipients = params.getAll('recipientUserId');
  const amounts = params.getAll('amount');
  if (recipients.length !== 1 || amounts.length !== 1 || !UUID.test(recipients[0]!) ||
    !/^[1-9][0-9]{0,37}$/.test(amounts[0]!)) return problem(400);

  const recipient = recipients[0]!.toLowerCase();
  const amount = amounts[0]!;
  try {
    const preview = await api<unknown>(
      '/api/v1/wallet/transfers/preview?recipientUserId=' + encodeURIComponent(recipient) + '&amount=' + encodeURIComponent(amount),
    );
    return NextResponse.json(preview, { headers: PRIVATE_HEADERS });
  } catch (error) {
    if (error instanceof ApiError && [400, 401, 403, 404, 428, 429, 503].includes(error.status)) {
      return problem(error.status);
    }
    return problem(502);
  }
}
