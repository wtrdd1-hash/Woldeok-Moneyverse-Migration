import type { Metadata } from 'next';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { StateBox } from '@/components/d180/primitives';
import { publicApi } from '@/lib/api';
import { readBoardPosts } from '@/lib/board-posts';
import { formatMoment } from '@/lib/money';

export const metadata: Metadata = {
  title: '종목 커뮤니티',
  description: '월덕 머니버스 회원이 종목별로 남긴 토론 글입니다.',
};

/**
 * Real stock discussion rows (public.member_board_public_list_with_stock).
 * QA 2026-11-25: the former feed rendered invented members ("여의도덕이",
 * "수익률 48.5%") and invented reactions.
 */
export default async function StockCommunityPage() {
  const posts = readBoardPosts(await publicApi<unknown>('/api/v1/board/stock-posts', 60));
  return (
    <div data-page="stocks-community">
      <PageHeader
        title="종목 커뮤니티"
        action={
          <Link href="/board" prefetch={false} className="inline-flex min-h-11 items-center rounded-lg bg-[var(--g1-violet-ink)] px-4 text-sm font-semibold text-white">
            광장에서 글쓰기
          </Link>
        }
      >
        회원이 종목별로 남긴 토론 글입니다. 수익률 인증이나 추천은 표시하지 않습니다.
      </PageHeader>
      {posts === null ? (
        <StateBox kind="unavailable" title="토론 글을 불러올 수 없어요">잠시 후 다시 확인해 주세요.</StateBox>
      ) : posts.length === 0 ? (
        <StateBox kind="empty" title="아직 종목 토론 글이 없어요">광장에서 첫 글을 남기면 이곳에 표시됩니다.</StateBox>
      ) : (
        <ul className="divide-y divide-[var(--g1-line)] overflow-hidden rounded-lg border border-[var(--g1-line)] bg-[var(--g1-plum)]">
          {posts.map((post) => (
            <li key={post.postId}>
              <Link href={`/board/${post.postId}`} prefetch={false} className="flex min-h-14 items-center gap-3 px-5 py-3 hover:bg-[var(--g1-plum-2)]">
                {post.stock && <span className="shrink-0 rounded-md border border-[var(--g1-line)] px-2 py-0.5 text-xs text-[var(--g1-muted)]">{post.stock.symbol}</span>}
                <span className="min-w-0 flex-1 truncate font-semibold text-[var(--g1-ink)]">{post.title}</span>
                {post.commentCount > 0 && (
                  <span className="flex shrink-0 items-center gap-1 text-xs text-[var(--g1-muted)]" aria-label={`댓글 ${post.commentCount}개`}>
                    <MessageSquare className="size-3.5" aria-hidden />{post.commentCount}
                  </span>
                )}
                <time className="shrink-0 text-xs text-[var(--g1-muted)]" dateTime={post.createdAt}>{formatMoment(post.createdAt)}</time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
