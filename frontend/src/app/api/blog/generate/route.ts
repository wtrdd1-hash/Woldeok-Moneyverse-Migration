import { NextResponse } from 'next/server';
import { verifySeoOperator, verifySeoWriteOrigin } from '@/lib/admin-seo-authority';
import { currentViewer, isAdministrator } from '@/lib/viewer';
import { generateDailyAiBlogPost, publishBlogPost } from '@/app/blog/blog-data';
import type { BlogCountry, BlogCategory } from '@/app/blog/blog.types';

export const dynamic = 'force-dynamic';

const headers = { 'Cache-Control': 'no-store' } as const;

export async function GET(_req: Request) {
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
      engine: 'AI Financial & Tech Multi-Country Editorial Engine v2026',
      supportedCountries: ['KR', 'US', 'JP', 'VN'],
      supportedCategories: ['WEALTH', 'COMPOUND', 'STOCKS', 'TAX', 'MACRO', 'TECH'],
      message: 'AI blog publication pipeline is active and ready for multi-country tech & finance generation.',
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

  // A browser session must prove same-origin intent and an open elevated console.
  // Scheduler credentials are independent of cookies and do not require Origin.
  if (!isAuthorized) {
    const viewer = await currentViewer();
    if (isAdministrator(viewer)) {
      const wrongOrigin = verifySeoWriteOrigin(req);
      if (wrongOrigin) return wrongOrigin;
      const denied = await verifySeoOperator();
      if (denied) return denied;
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    return NextResponse.json(
      { success: false, code: 'BLOG_PUBLISH_FORBIDDEN', message: 'Administrator or valid scheduler secret required' },
      { status: 403, headers },
    );
  }

  // Parse optional target country and category from JSON body or URL query
  let country: BlogCountry | undefined;
  let category: BlogCategory | undefined;

  try {
    const url = new URL(req.url);
    const qCountry = url.searchParams.get('country')?.toUpperCase();
    const qCategory = url.searchParams.get('category')?.toUpperCase();
    if (qCountry === 'KR' || qCountry === 'US' || qCountry === 'JP' || qCountry === 'VN') {
      country = qCountry;
    }
    if (qCategory && ['WEALTH', 'COMPOUND', 'STOCKS', 'TAX', 'MACRO', 'TECH'].includes(qCategory)) {
      category = qCategory as BlogCategory;
    }

    if (req.headers.get('content-type')?.includes('application/json')) {
      const body = await req.json().catch(() => null);
      if (body) {
        if (body.country && ['KR', 'US', 'JP', 'VN'].includes(body.country)) {
          country = body.country;
        }
        if (body.category && ['WEALTH', 'COMPOUND', 'STOCKS', 'TAX', 'MACRO', 'TECH'].includes(body.category)) {
          category = body.category;
        }
      }
    }
  } catch {
    // Ignore parameter parsing error and proceed with defaults
  }

  try {
    // Generate verified market-driven high quality AI blog post (multi-country & tech/finance)
    const postOptions: { country?: BlogCountry | undefined; category?: BlogCategory | undefined } = {};
    if (country) postOptions.country = country;
    if (category) postOptions.category = category;
    const post = generateDailyAiBlogPost(postOptions);
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
          country: post.country,
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
