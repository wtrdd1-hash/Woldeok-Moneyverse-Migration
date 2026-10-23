import type { Metadata } from 'next';
import { requireAdminConsole } from '@/lib/session';
import { AdminBlogClient } from './admin-blog-client';
import { getAllBlogPostsForAdmin } from '@/app/blog/blog-data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'AI 블로그 콘텐츠 관제 & 다국어 발행 | 관리자 콘솔',
  description: 'AI 생성 경제·기술 다국어 콘텐츠 실시간 발행 및 게시물 관리',
  robots: { index: false, follow: false },
};

export default async function AdminBlogPage() {
  // Both admin role and an open elevated console session are required.
  await requireAdminConsole('/admin/blog');
  const posts = getAllBlogPostsForAdmin();

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          AI 블로그 편집 검토 및 다국어 관제 타워
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          대한민국(KR), 미국(US), 일본(JP), 베트남(VN) 4개국 맞춤형 경제 및 핀테크 개발 칼럼을 실시간 발행하고 게시물을 제어·삭제합니다.
        </p>
      </div>

      <AdminBlogClient initialPosts={posts} />
    </div>
  );
}
