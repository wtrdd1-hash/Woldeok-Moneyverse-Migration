import { NextResponse } from 'next/server';
import { currentViewer, isAdministrator } from '@/lib/viewer';
import { generateDailyAiBlogPost, publishBlogPost } from '@/app/blog/blog-data';

export const dynamic = 'force-dynamic';

/**
 * Editorial Review & 1-Click Publishing Gateway.
 * - Scheduler / Unauthenticated: Returns 503 EDITORIAL_REVIEW_REQUIRED (Safety Guard).
 * - Admin Authenticated:
 *    - GET or POST { action: 'draft' }: Generates verified macroeconomic draft.
 *    - POST { action: 'publish' }: 1-click publishing with canonical index registration.
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

  // If not admin, verify if it's machine scheduler
  if (!isAdmin) {
    const internalSecret = process.env.INTERNAL_API_SECRET || process.env.CRON_SECRET;
    const presented = req.headers.get('x-cron-secret')
      || req.headers.get('x-internal-secret')
      || req.headers.get('authorization')?.replace(/^Bearer /, '');
    const machineAuthorized = Boolean(internalSecret && presented && presented === internalSecret);

    if (!machineAuthorized) {
      return NextResponse.json(
        { success: false, code: 'BLOG_PUBLISH_FORBIDDEN', message: 'Administrator or authorized scheduler required' },
        { status: 403, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    // Machine scheduler without admin approval is paused by safety gate
    return NextResponse.json(
      {
        success: false,
        code: 'EDITORIAL_REVIEW_REQUIRED',
        message: 'Automatic financial article publishing is paused until sources, market data, editorial review and duplicate checks are verified.',
      },
      { status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '3600' } },
    );
  }

  // Admin workflow
  let body: { action?: string; post?: any } = {};
  try {
    body = await req.json();
  } catch {
    // empty body fallback
  }

  if (body.action === 'draft' || !body.action) {
    const draft = generateDailyAiBlogPost();
    return NextResponse.json({
      success: true,
      action: 'draft',
      draft,
      message: 'AI 금융칼럼 초안이 준비되었습니다.',
    });
  }

  if (body.action === 'publish') {
    const targetPost = body.post || generateDailyAiBlogPost();
    try {
      publishBlogPost(targetPost);
      return NextResponse.json({
        success: true,
        action: 'publish',
        publishedUrl: `https://easy-scraping.com/blog/${targetPost.slug}`,
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
