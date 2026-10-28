import type { Metadata } from 'next';
import { requireAdminConsole } from '@/lib/session';
import { AdminBlogClient } from './admin-blog-client';
import { getAllBlogPostsForAdmin } from '@/app/blog/blog-data';
import { verifiedArticlesForAdmin } from '@/app/blog/blog-verified-client';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'AI 블로그 콘텐츠 관제 & 다국어 발행 | 관리자 콘솔',
  description: 'AI 생성 경제·기술 다국어 콘텐츠 실시간 발행 및 게시물 관리',
  robots: { index: false, follow: false },
};

export default async function AdminBlogPage() {
  // Both admin role and an open elevated console session are required.
  await requireAdminConsole('/admin/blog');
  // The backend verifies admin role and elevated session again.
  // Database unavailability must never resurrect withdrawn legacy posts.
  const verified = await api<{posts:unknown[]}>('/api/v1/admin/blog-verified')
    .then(payload => verifiedArticlesForAdmin(payload.posts))
    .catch(() => []);
  const posts = [...verified,...getAllBlogPostsForAdmin()];

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          AI 블로그 자동발행 및 국가별 콘텐츠 관리
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          한국(KR)·미국(US)·일본(JP)·중국(CN)의 경제·코딩·컴퓨터 글을 관리하고 필요할 때 직접 비공개 또는 삭제합니다.
        </p>
      </div>

      <AdminBlogClient initialPosts={posts} />
    </div>
  );
}
