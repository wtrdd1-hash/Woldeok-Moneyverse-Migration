import { NextResponse } from 'next/server';
import { currentViewer, isAdministrator } from '@/lib/viewer';

export const dynamic = 'force-dynamic';

const BOT_BROADCAST_URL = process.env.DISCORD_BOT_BROADCAST_URL || 'http://127.0.0.1:3099/broadcast';
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || process.env.CRON_SECRET || 'mv-internal-secure-key-2026';

async function isAuthorized(req: Request): Promise<boolean> {
  // 1. 내부 시스템 및 스케줄러 시크릿 검증
  const secretHeader =
    req.headers.get('x-internal-secret') ||
    req.headers.get('x-cron-secret') ||
    req.headers.get('authorization')?.replace('Bearer ', '');
  if (secretHeader && secretHeader === INTERNAL_API_SECRET) {
    return true;
  }

  // 2. 관리자 세션 검증
  const viewer = await currentViewer();
  return isAdministrator(viewer);
}

export async function POST(req: Request) {
  try {
    // R03 가드: 무인증 호출 차단 (관리자 세션 또는 내부 API 시크릿 필수)
    const authorized = await isAuthorized(req);
    if (!authorized) {
      return NextResponse.json(
        { ok: false, message: '디스코드 브로드캐스트 권한이 없습니다. (관리자 세션 또는 내부 시크릿 필수)' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { title, description, fields, color, type, notifyAdminDm } = body;

    if (!title) {
      return NextResponse.json(
        { ok: false, message: '브로드캐스트 메시지 제목(title)은 필수입니다.' },
        { status: 400 }
      );
    }

    // 디스코드 봇 로컬 웹훅 서버로 전달
    try {
      const botRes = await fetch(BOT_BROADCAST_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-secret': INTERNAL_API_SECRET,
        },
        body: JSON.stringify({ title, description, fields, color, type, notifyAdminDm }),
        signal: AbortSignal.timeout(2500),
      });

      if (botRes.ok) {
        const data = await botRes.json().catch(() => ({ ok: true }));
        return NextResponse.json({ ok: true, deliveredToBot: true, ...data });
      }

      // R15 해결: 봇 응답이 비정상이면 가짜 큐 성공 대신 502 에러 반환
      return NextResponse.json(
        {
          ok: false,
          deliveredToBot: false,
          message: `디스코드 봇 서버가 오류를 반환했습니다. (HTTP ${botRes.status})`,
        },
        { status: 502 }
      );
    } catch (botErr: unknown) {
      // R15 해결: 봇 미응답 시 허위 200/큐 성공 반환 금지 -> 503 Service Unavailable 정직 반환
      const errorMsg = botErr instanceof Error ? botErr.message : 'Bot Offline or Timeout';
      return NextResponse.json(
        {
          ok: false,
          deliveredToBot: false,
          message: '디스코드 봇 서버에 연결할 수 없습니다. (Bot Offline or Timeout)',
          error: errorMsg,
        },
        { status: 503 }
      );
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : '브로드캐스트 처리 중 서버 오류가 발생했습니다.';
    return NextResponse.json(
      { ok: false, error: errorMsg },
      { status: 500 }
    );
  }
}
