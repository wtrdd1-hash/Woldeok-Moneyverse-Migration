import { NextResponse } from 'next/server';
import { getAllBlogPosts } from '@/app/blog/blog-data';
import { isBlogDiscoverable } from '@/app/blog/blog-seo';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const posts = getAllBlogPosts().filter(isBlogDiscoverable);
    return NextResponse.json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '블로그 목록 조회 실패';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
