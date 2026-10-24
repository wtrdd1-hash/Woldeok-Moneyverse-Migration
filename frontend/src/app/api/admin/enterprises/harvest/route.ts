import { NextResponse } from 'next/server';

// Browser-facing treasury writes are retired. The admin console uses an authenticated server action.
export async function POST() {
  return NextResponse.json({ error: 'This endpoint has been retired.' }, { status: 410 });
}
