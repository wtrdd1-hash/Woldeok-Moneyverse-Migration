import { NextRequest, NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'private, no-store' };

export async function GET() {
  try {
    const res = await api<unknown>('/api/v1/admin/economy/tax-policy');
    return NextResponse.json(res, { headers: noStore });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json(
      { error: 'Failed to fetch tax policies' },
      { status, headers: noStore },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await api<unknown>('/api/v1/admin/economy/tax-policy', {
      method: 'POST',
      body,
    });
    return NextResponse.json(res, { headers: noStore });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json(
      { error: 'Failed to update tax policy' },
      { status, headers: noStore },
    );
  }
}
