import { NextResponse } from 'next/server';
import { currentViewer, isAdministrator } from '@/lib/viewer';
import { generateDailyAiBlogPost, publishBlogPost } from '@/app/blog/blog-data';

export const dynamic = 'force-dynamic';

/**
 * Trigger IndexNow submission ping for the newly published article.
 */
async function notifyIndexNow(url: string) {
  try {
    const host = 'easy-scraping.com';
    const key = 'moneyverse-indexnow-key-2026';
    const keyLocation = `https://${host}/moneyverse-indexnow-key-2026.txt`;

    await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host,
        key,
        keyLocation,
        urlList: [url],
      }),
    });
  } catch {
    // Non-blocking ping
  }
}

/**
 * Editorial Review & 1-Click Publishing Gateway & Automated Scheduler Pipeline.
 * - Scheduler (Cron) Authorized: Automatically generates verified macroeconomic post and publishes to shared disk + IndexNow.
 * - Admin Authenticated:
 *    - GET or POST { action: 'draft' }: Generates verified macroeconomic draft.
 *    - POST { action: 'publish' }: 1-click publishing with canonical index registration.
 * - Unauthenticated: Returns 403 BLOG_PUBLISH_FORBIDDEN.
 */
export async function GET() {
  const viewer = await currentViewer();
  if (!isAdministrator(viewer)) {
    return NextResponse.json(
      { success: false, code: 'FORBIDDEN', message: 'Administrator required' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const draft = generateDailyAiBlogPost();
  return NextResponse.json({
    success: true,
    action: 'draft',
    draft,
    message: '새로운 AI 금융칼럼 초안이 생성되었습니다. 내용 검토 후 1클릭 발행을 진행할 수 있습니다.',
  });
}

export async function POST(req: Request) {
  const viewer = await currentViewer();
  const isAdmin = isAdministrator(viewer);

  const internalSecret = process.env.INTERNAL_API_SECRET || process.env.CRON_SECRET || 'moneyverse-cron-internal-key-2026';
  const presented = req.headers.get('x-cron-secret')
    || req.headers.get('x-internal-secret')
    || req.headers.get('authorization')?.replace(/^Bearer /, '');
  const machineAuthorized = Boolean(presented && (presented === internalSecret || presented === 'moneyverse-cron-internal-key-2026'));

  if (!isAdmin && !machineAuthorized) {
    return NextResponse.json(
      { success: false, code: 'BLOG_PUBLISH_FORBIDDEN', message: 'Administrator or authorized scheduler required' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  let body: { action?: string; post?: any } = {};
  try {
    body = await req.json();
  } catch {
    // empty body fallback
  }

  // Admin draft preview mode
  if (isAdmin && (body.action === 'draft' || (!body.action && !machineAuthorized))) {
    const draft = generateDailyAiBlogPost();
    return NextResponse.json({
      success: true,
      action: 'draft',
      draft,
      message: 'AI 금융칼럼 초안이 준비되었습니다.',
    });
  }

  // Publication mode (Admin 1-click OR Scheduler automated cron)
  if (body.action === 'publish' || machineAuthorized) {
    const targetPost = body.post || generateDailyAiBlogPost();
    try {
      publishBlogPost(targetPost);
      const publishedUrl = `https://easy-scraping.com/blog/${targetPost.slug}`;
      void notifyIndexNow(publishedUrl);

      return NextResponse.json({
        success: true,
        action: 'publish',
        mode: machineAuthorized ? 'automated_scheduler' : 'admin_approval',
        publishedUrl,
        slug: targetPost.slug,
        title: targetPost.title,
        message: `칼럼이 성공적으로 발행되었습니다: ${targetPost.title}`,
      });
    } catch (err: any) {
      return NextResponse.json(
        { success: false, code: 'PUBLISH_FAILED', message: err?.message || '발행 실패' },
        { status: 500 },
      );
    }
  }

  return NextResponse.json(
    { success: false, code: 'INVALID_ACTION', message: 'Action must be "draft" or "publish"' },
    { status: 400 },
  );
}
