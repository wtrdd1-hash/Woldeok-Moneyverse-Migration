import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { viewerOrUnknown } from '@/lib/viewer';

export async function POST(request: Request) {
  try {
    const viewer = await viewerOrUnknown();
    if (viewer && viewer.adminRoles && viewer.adminRoles.length > 0) {
      return NextResponse.json({ recorded: 0, excluded: true });
    }

    const body = await request.json();
    const result = await api<{ recorded: number }>('/api/v1/activity/events', {
      method: 'POST',
      body,
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { recorded: 0, error: 'activity_delivery_failed' },
      { status: 503, headers: { 'Retry-After': '2' } },
    );
  }
}
