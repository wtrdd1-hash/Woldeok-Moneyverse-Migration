import type { Metadata } from 'next';
import { requireAdminConsole } from '@/lib/session';
import { AdminBlogClient } from './admin-blog-client';
import { getAllBlogPosts } from '@/app/blog/blog-data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'AI 블로그 콘텐츠 검토 | 관리자 콘솔',
  description: 'AI 생성 콘텐츠 검토 보류 및 국가별 블로그 SEO 현황',
  robots: { index: false, follow: false },
};

export default async function AdminBlogPage() {
  // Both admin role and an open elevated console session are required.
  await requireAdminConsole('/admin/blog');
  const posts = getAllBlogPosts();

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          AI 블로그 편집 검토 및 SEO 관제
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          검증되지 않은 자동 생성 글의 추가 발행은 중단되어 있습니다. 기존 글의 사실 확인, 국가별 콘텐츠 품질, 사이트맵을 검토하세요.
        </p>
      </div>

      <AdminBlogClient initialPosts={posts} />
    </div>
  );
}
