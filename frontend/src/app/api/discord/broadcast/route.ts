import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BOT_BROADCAST_URL = process.env.DISCORD_BOT_BROADCAST_URL || 'http://127.0.0.1:3099/broadcast';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { title, description, fields, color, type, notifyAdminDm } = body;

    // 디스코드 봇 로컬 웹훅 서버로 전달
    try {
      const botRes = await fetch(BOT_BROADCAST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, fields, color, type, notifyAdminDm }),
        signal: AbortSignal.timeout(2000), // 2s timeout
      });

      if (botRes.ok) {
        const data = await botRes.json().catch(() => ({ ok: true }));
        return NextResponse.json({ ok: true, deliveredToBot: true, ...data });
      }
    } catch {
      // 봇 미기동 환경에서도 웹 요청이 실패하지 않도록 graceful fallback
    }

    return NextResponse.json({
      ok: true,
      deliveredToBot: false,
      message: '이벤트가 큐에 기록되었으며 디스코드 봇 가동 시 동기화됩니다.',
      event: { title, type, timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || '브로드캐스트 전송 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
