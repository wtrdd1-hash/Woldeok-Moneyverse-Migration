import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { TossStyleSocialFeed } from '@/components/stocks/toss-style-social-feed';
import { publicApi } from '@/lib/api';
import { parseStockCommunityFeed } from './community-feed';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: '주식 커뮤니티 — 서버 기록 기반 종목 토론 | 월덕 머니버스',
  description: '실제 게시판에 기록된 가상 주식 종목별 공개 토론을 확인하세요. 게시글은 수익률이나 보유 인증이 아닙니다.',
  robots: { index: false, follow: false },
};

export default async function StockCommunityFeedPage() {
  const response = await publicApi<unknown>('/api/v1/board/public/stock-posts', 0);
  const feed = parseStockCommunityFeed(response);

  return (
    <main data-page="stock-community" className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6">
      {feed.kind === 'unavailable' ? (
        <section role="alert" aria-labelledby="stock-feed-error" className="mx-auto max-w-4xl space-y-4 rounded-2xl border border-amber-500/50 bg-slate-900 p-5 sm:p-7">
          <AlertTriangle aria-hidden="true" className="size-6 text-amber-400" />
          <h1 id="stock-feed-error" className="text-xl font-bold">주식 토론 기록을 확인할 수 없습니다</h1>
          <p className="text-sm leading-7 text-slate-200">
            게시판 서버 연결 또는 응답 형식을 확인해야 합니다. 게시글이 없다는 뜻은 아니며,
            확인되지 않은 수익률·주주 인증·반응 수치는 표시하지 않습니다.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/stocks/community" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-600 px-4 py-2 font-semibold hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2">
              <RefreshCw aria-hidden="true" className="size-4" /> 다시 확인
            </Link>
            <Link href="/board" className="inline-flex min-h-11 items-center rounded-lg border border-slate-600 px-4 py-2 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2">
              전체 게시판 이동
            </Link>
          </div>
        </section>
      ) : <TossStyleSocialFeed posts={feed.posts} />}
    </main>
  );
}
