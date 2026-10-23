import { NextResponse } from 'next/server';
import { currentViewer, isAdministrator } from '@/lib/viewer';
import { generateDailyAiBlogPost, publishBlogPost } from '@/app/blog/blog-data';

export const dynamic = 'force-dynamic';

const headers = { 'Cache-Control': 'no-store' } as const;

export async function GET() {
  const viewer = await currentViewer();
  if (!isAdministrator(viewer)) {
    return NextResponse.json(
      { success: false, code: 'FORBIDDEN', message: 'Administrator required' },
      { status: 403, headers },
    );
  }
  return NextResponse.json(
    {
      success: true,
      status: 'READY',
      engine: 'AI Financial Editorial Publication Engine v2026',
      message: 'AI blog publication pipeline is active and ready for generation.',
    },
    { status: 200, headers },
  );
}

export async function POST(req: Request) {
  const configuredSecret = process.env.INTERNAL_API_SECRET || process.env.CRON_SECRET;
  const presented = req.headers.get('x-cron-secret')
    || req.headers.get('x-internal-secret')
    || req.headers.get('authorization')?.replace(/^Bearer /, '');

  let isAuthorized = false;

  // 1. Cron or internal scheduler credential check
  if (configuredSecret && presented && presented === configuredSecret) {
    isAuthorized = true;
  }

  // 2. Administrator session check if not authenticated via scheduler secret
  if (!isAuthorized) {
    const viewer = await currentViewer();
    if (isAdministrator(viewer)) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    return NextResponse.json(
      { success: false, code: 'BLOG_PUBLISH_FORBIDDEN', message: 'Administrator or valid scheduler secret required' },
      { status: 403, headers },
    );
  }

  try {
    // Generate verified market-driven high quality AI blog post
    const post = generateDailyAiBlogPost();
    // Publish to durable shared disk store
    publishBlogPost(post);

    return NextResponse.json(
      {
        success: true,
        message: 'AI blog post successfully generated and published.',
        post: {
          slug: post.slug,
          title: post.title,
          category: post.category,
          categoryLabel: post.categoryLabel,
          publishedAt: post.publishedAt,
          url: `/blog/${post.slug}`,
        },
      },
      { status: 201, headers },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown generation failure';
    return NextResponse.json(
      {
        success: false,
        code: 'GENERATION_FAILED',
        message,
      },
      { status: 500, headers },
    );
  }
}
