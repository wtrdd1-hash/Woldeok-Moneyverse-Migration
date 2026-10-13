import { NextResponse } from 'next/server';
import { getBlogPostBySlug } from '@/app/blog/blog-data';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await props.params;
    const post = getBlogPostBySlug(slug);

    if (!post) {
      return NextResponse.json(
        { success: false, error: '존재하지 않는 블로그 포스트입니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '블로그 상세 조회 실패';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
