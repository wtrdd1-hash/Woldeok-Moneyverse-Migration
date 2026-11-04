import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'private, no-store' };

export async function POST() {
  try {
    const res = await api<unknown>('/api/v1/admin/economy/tax-policy/auto-adjust', {
      method: 'POST',
    });
    return NextResponse.json(res, { headers: noStore });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json(
      { error: 'Failed to auto-adjust tax policies' },
      { status, headers: noStore },
    );
  }
}
