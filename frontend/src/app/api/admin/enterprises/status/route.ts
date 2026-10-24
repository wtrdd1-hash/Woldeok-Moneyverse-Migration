import { NextResponse } from 'next/server';

// Browser-facing treasury writes are retired. The admin console uses an authenticated server action.
export async function PUT() {
  return NextResponse.json({ error: 'This endpoint has been retired.' }, { status: 410 });
}
