import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Browser-accessible proxies must never carry internal credentials for
// privileged treasury operations. The elevated server actions own this flow.
const retired = () => NextResponse.json(
  { error: 'This endpoint has been retired. Use the administrator console.' },
  { status: 410, headers: { 'Cache-Control': 'private, no-store' } },
);

export const GET = retired;
export const POST = retired;
export const PUT = retired;
