import { NextResponse } from 'next/server';
import { apiOrNull } from '@/lib/api';
import { viewerOrUnknown } from '@/lib/viewer';

export const dynamic = 'force-dynamic';

const PRIVATE_HEADERS = { 'cache-control': 'private, no-store' };

function verifiedStatus(value: unknown): value is {
  checkedInToday: boolean;
  streakDays: number;
  lastAttendedDate: string | null;
  nextRewardPreview: number;
  isJackpotEligible: boolean;
} {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return typeof record.checkedInToday === 'boolean'
    && Number.isInteger(record.streakDays) && (record.streakDays as number) >= 0 && (record.streakDays as number) <= 7
    && (record.lastAttendedDate === null || (typeof record.lastAttendedDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(record.lastAttendedDate)))
    && Number.isInteger(record.nextRewardPreview) && (record.nextRewardPreview as number) >= 0 && (record.nextRewardPreview as number) <= 1000
    && typeof record.isJackpotEligible === 'boolean';
}

export async function GET(): Promise<NextResponse> {
  const viewer = await viewerOrUnknown();
  if (!viewer?.signedIn) {
    return NextResponse.json({
      signedIn: false,
      checkedInToday: false,
      streakDays: 0,
      lastAttendedDate: null,
      claimAvailable: false,
    }, { headers: PRIVATE_HEADERS });
  }

  const result = await apiOrNull<unknown>('/api/v1/engagement/dopamine/attendance/status');
  if (!verifiedStatus(result)) {
    return NextResponse.json({
      ok: false,
      code: 'ATTENDANCE_STATUS_UNAVAILABLE',
      error: 'Verified attendance status is unavailable',
    }, { status: 503, headers: PRIVATE_HEADERS });
  }

  return NextResponse.json({
    signedIn: true,
    ...result,
    claimAvailable: false,
    settlementVerified: false,
  }, { headers: PRIVATE_HEADERS });
}
