import type { Metadata } from 'next';
import Link from 'next/link';
import { TossStyleSocialFeed } from '@/components/stocks/toss-style-social-feed';
import type { StockDiscussionPost } from '@/components/stocks/toss-style-social-feed';
import { publicApi } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: '가상 주식 종목 토론 | 월덕 머니버스',
  description: '월덕 머니버스 게시판에 실제 등록된 가상 주식 종목별 토론을 확인합니다. 보유 여부와 전망은 작성자 자기신고입니다.',
  robots: { index: false, follow: false },
};

function stockFilter(value: string | string[] | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return /^[A-Za-z0-9._-]{1,16}$/.test(trimmed) ? trimmed.toUpperCase() : null;
}

export default async function StockCommunityFeedPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly stock?: string | string[] }>;
}) {
  const params = await searchParams;
  const selectedStock = stockFilter(params.stock);
  const query = selectedStock ? `?stock=${encodeURIComponent(selectedStock)}` : '';
  const result = await publicApi<{ posts: StockDiscussionPost[] }>(`/api/v1/board/public/stock-posts${query}`, 0);
  const loadFailed = !result || !Array.isArray(result.posts);

  return (
    <main data-page="stocks-community" className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/stocks"
          className="mb-6 inline-flex min-h-11 items-center text-sm font-semibold text-slate-200 underline underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          가상 주식 거래소로 돌아가기
        </Link>
        <TossStyleSocialFeed
          posts={loadFailed ? [] : result.posts}
          selectedStock={selectedStock}
          loadFailed={loadFailed}
        />
      </div>
    </main>
  );
}
