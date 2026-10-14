import { NextResponse } from 'next/server';
import { currentViewer, isAdministrator } from '@/lib/viewer';
import { api, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // R14 보안 가드: 관리자 세션 검증
    const viewer = await currentViewer();
    if (!isAdministrator(viewer)) {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 403 },
      );
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    // 표준 api()를 통해 x-internal-token, 쿠키, CSRF 토큰을 안전하게 주입
    const data = await api<Record<string, unknown>>('/api/v1/admin/discord/test-dm', {
      method: 'POST',
      body,
    });

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          success: false,
          error: error.detail || error.message,
        },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 },
    );
  }
}
