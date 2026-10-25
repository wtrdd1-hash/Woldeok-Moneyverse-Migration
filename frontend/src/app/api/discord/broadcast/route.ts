import { NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'node:crypto';
import { currentViewer, isAdministrator } from '@/lib/viewer';

export const dynamic = 'force-dynamic';

const BOT_BROADCAST_URL = process.env.DISCORD_BOT_BROADCAST_URL || 'http://127.0.0.1:3099/broadcast';
const noStore = { 'Cache-Control': 'private, no-store' } as const;

function matchesSecret(presented: string | null, configured: string | undefined): boolean {
  if (!configured || Buffer.byteLength(configured, 'utf8') < 32 || !presented || presented.length > 4096) return false;
  return timingSafeEqual(
    createHash('sha256').update(presented).digest(),
    createHash('sha256').update(configured).digest(),
  );
}

async function isAuthorized(req: Request): Promise<boolean> {
  const configured = process.env.INTERNAL_API_SECRET;
  const presented = req.headers.get('x-internal-secret') || req.headers.get('x-cron-secret') ||
    req.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1] || null;
  if (matchesSecret(presented, configured)) return true;

  // Session cookies alone cannot authorize cross-site POSTs.
  const origin = req.headers.get('origin');
  const site = req.headers.get('sec-fetch-site');
  if (origin !== new URL(req.url).origin || (site && site !== 'same-origin' && site !== 'none')) return false;
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
        { status: 403, headers: noStore }
      );
    }

    // Separate bot-to-bot credential; missing/weak configuration is a hard hold.
    const broadcastSecret = process.env.DISCORD_BROADCAST_SECRET;
    if (!broadcastSecret || Buffer.byteLength(broadcastSecret, 'utf8') < 32) {
      return NextResponse.json(
        { ok: false, code: 'BROADCAST_UNAVAILABLE', message: 'Broadcast transport is not configured' },
        { status: 503, headers: noStore },
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
          'x-internal-secret': broadcastSecret,
        },
        body: JSON.stringify({ title, description, fields, color, type, notifyAdminDm }),
        signal: AbortSignal.timeout(2500),
      });

      if (botRes.ok) {
        const data = await botRes.json().catch(() => ({ ok: true }));
        return NextResponse.json({ ok: true, deliveredToBot: true, ...data }, { headers: noStore });
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
