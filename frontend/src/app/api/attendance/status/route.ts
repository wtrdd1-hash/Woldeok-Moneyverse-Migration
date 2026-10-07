import { NextResponse } from 'next/server';
import { apiOrNull } from '@/lib/api';
import { viewerOrUnknown } from '@/lib/viewer';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const viewer = await viewerOrUnknown();

  if (!viewer || !viewer.signedIn) {
    return NextResponse.json({
      signedIn: false,
      checkedInToday: false,
      streakDays: 0,
      lastAttendedDate: null,
      nextRewardPreview: 10,
      isJackpotEligible: false,
    });
  }

  const result = await apiOrNull<any>('/api/v1/engagement/dopamine/attendance/status');

  return NextResponse.json({
    signedIn: true,
    checkedInToday: result?.checkedInToday ?? false,
    streakDays: result?.streakDays ?? 1,
    lastAttendedDate: result?.lastAttendedDate ?? null,
    nextRewardPreview: result?.nextRewardPreview ?? 10,
    isJackpotEligible: result?.isJackpotEligible ?? false,
  });
}
