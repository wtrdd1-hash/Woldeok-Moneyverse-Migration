import type { Metadata } from 'next';
import { SiteShell } from '@/components/site-shell';
import { AdminBlogClient } from './admin-blog-client';
import { getAllBlogPosts } from '@/app/blog/blog-data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'AI 블로그 일일 자동화 관제 | 관리자 콘솔',
  description: '내부 AI 금융 블로그 자동 생성 및 IndexNow 실시간 크롤링 핑 관제 패널',
};

export default function AdminBlogPage() {
  const posts = getAllBlogPosts();

  return (
    <SiteShell>
      <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            AI 블로그 일일 자동화 & SEO 관제탑
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            매일 09:00 KST 고수익 롱테일 키워드로 금융 칼럼을 자동 집필하고, Naver/Bing/Google 검색 로봇에 실시간 인덱싱을 요청합니다.
          </p>
        </div>

        <AdminBlogClient initialPosts={posts} />
      </div>
    </SiteShell>
  );
}
