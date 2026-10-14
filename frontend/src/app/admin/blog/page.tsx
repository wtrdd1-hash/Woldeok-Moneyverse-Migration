import type { Metadata } from 'next';
import { SiteShell } from '@/components/site-shell';
import { requireAdminConsole } from '@/lib/session';
import { AdminBlogClient } from './admin-blog-client';
import { getAllBlogPosts } from '@/app/blog/blog-data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'AI 블로그 일일 자동화 관제 | 관리자 콘솔',
  description: '내부 AI 금융 블로그 자동 생성 및 IndexNow 실시간 크롤링 핑 관제 패널',
  robots: { index: false, follow: false },
};

export default async function AdminBlogPage() {
  // Both admin role and an open elevated console session are required.
  await requireAdminConsole('/admin/blog');
  const posts = getAllBlogPosts();

  return (
    <SiteShell>
      <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            AI 블로그 일일 자동화 & SEO 관제탑
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            이 관리 화면에서 금융 콘텐츠 생성 방식과 검색엔진 색인 제출 상태를 확인합니다.
          </p>
        </div>

        <AdminBlogClient initialPosts={posts} />
      </div>
    </SiteShell>
  );
}
