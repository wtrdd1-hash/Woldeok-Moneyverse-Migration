import { NextResponse } from 'next/server';
import { generateDailyAiBlogPost } from '@/app/blog/blog-data';
import { currentViewer, isAdministrator } from '@/lib/viewer';

export const dynamic = 'force-dynamic';

const INDEXNOW_API_KEY = process.env.INDEXNOW_KEY || 'moneyverse-indexnow-key-2026';
const SITE_HOST = 'easy-scraping.com';
const BOT_BROADCAST_URL = process.env.DISCORD_BOT_BROADCAST_URL || 'http://127.0.0.1:3099/broadcast';
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || process.env.CRON_SECRET || 'mv-internal-secure-key-2026';

async function isAuthorized(req: Request): Promise<boolean> {
  // 1. 스케줄러 cron 또는 내부 백엔드 시크릿 헤더 검증
  const secret =
    req.headers.get('x-cron-secret') ||
    req.headers.get('x-internal-secret') ||
    req.headers.get('authorization')?.replace('Bearer ', '');
  if (secret && secret === INTERNAL_API_SECRET) {
    return true;
  }

  // 2. 로그인된 관리자 세션 검증
  const viewer = await currentViewer();
  return isAdministrator(viewer);
}

export async function POST(req: Request) {
  try {
    // R17 가드: 무인증 블로그 생성 및 외부 통지 호출 원천 차단
    const authorized = await isAuthorized(req);
    if (!authorized) {
      return NextResponse.json(
        { success: false, message: '블로그 발행 권한이 없습니다. (관리자 세션 또는 크론 시크릿 필수)' },
        { status: 403 }
      );
    }

    const post = generateDailyAiBlogPost();
    const postUrl = `https://${SITE_HOST}/blog/${post.slug}`;

    // 1. IndexNow 검색엔진 실시간 크롤링 핑 전송
    try {
      fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: SITE_HOST,
          key: INDEXNOW_API_KEY,
          keyLocation: `https://${SITE_HOST}/moneyverse-indexnow-key-2026.txt`,
          urlList: [postUrl],
        }),
      }).catch(() => {});
    } catch {
      // non-blocking
    }

    // 2. 디스코드 커뮤니티 공지 채널 브로드캐스트 (내부 인증 토큰 전달)
    try {
      fetch(BOT_BROADCAST_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-secret': INTERNAL_API_SECRET,
        },
        body: JSON.stringify({
          type: 'AI_BLOG_PUBLISHED',
          title: `📝 [월덕 금융칼럼] 신규 AI 블로그 발행!`,
          description: `**"${post.title}"**\n${post.excerpt}`,
          fields: [
            { name: '카테고리', value: post.categoryLabel, inline: true },
            { name: '에디터', value: post.author.name, inline: true },
            { name: '연관 계산기', value: post.relatedCalculatorName, inline: true },
            { name: '글 바로가기', value: postUrl, inline: false },
          ],
          color: 0x6366f1, // Indigo
          notifyAdminDm: false,
        }),
      }).catch(() => {});
    } catch {
      // non-blocking
    }

    return NextResponse.json({
      success: true,
      message: '신규 AI 금융 블로그 아티클이 성공적으로 생성 및 발행되었습니다! (IndexNow 색인 핑 전송 완료)',
      post,
      url: postUrl,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'AI 블로그 글 생성 실패';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
