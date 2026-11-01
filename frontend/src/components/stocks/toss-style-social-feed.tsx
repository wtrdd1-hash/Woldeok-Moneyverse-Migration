import Link from 'next/link';
import { ArrowLeft, MessageSquare, ShieldAlert } from 'lucide-react';
import type { VerifiedStockPost } from '@/app/stocks/community/community-feed';

export function TossStyleSocialFeed({ posts }: { readonly posts: readonly VerifiedStockPost[] }) {
  return (
    <section aria-labelledby="stock-feed-heading" className="mx-auto w-full max-w-4xl space-y-5">
      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 sm:p-6">
        <h2 id="stock-feed-heading" className="text-xl font-bold text-white sm:text-2xl">
          주식 종목별 공개 토론
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          최근 공개 게시글 최대 50건 중 종목이 지정된 글만 표시합니다. 종목·투자 의견은 작성자의
          게시 내용이며 실제 보유량, 수익률 또는 거래 체결 인증이 아닙니다.
        </p>
        <nav aria-label="주식 커뮤니티 이동" className="mt-4 flex flex-wrap gap-3">
          <Link href="/board" className="inline-flex min-h-11 items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2">
            게시글 작성 및 전체 토론
          </Link>
          <Link href="/stocks" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-sm text-white hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2">
            <ArrowLeft aria-hidden="true" className="size-4" /> 가상 주식 거래소
          </Link>
        </nav>
      </div>

      {posts.length === 0 ? (
        <div role="status" className="rounded-xl border border-slate-700 bg-slate-900 p-5 text-sm text-slate-200">
          서버에서 게시글 목록을 확인했지만 현재 표시할 종목 토론이 없습니다.
        </div>
      ) : (
        <ul className="space-y-4" aria-label="검증된 공개 주식 게시글">
          {posts.map((post) => (
            <li key={post.postId} className="rounded-xl border border-slate-700 bg-slate-900 p-4 sm:p-5">
              <article className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                  <span className="rounded-md border border-slate-600 px-2 py-1 font-semibold text-indigo-200">
                    {post.stock.symbol}
                  </span>
                  <span>{post.stock.name}</span>
                  <span aria-hidden="true">·</span>
                  <span>{post.authorName}</span>
                  <time dateTime={post.createdAt}>
                    {new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Seoul' }).format(new Date(post.createdAt))}
                  </time>
                </div>
                <Link href={`/board/${post.postId}`} className="block min-h-11 rounded-lg py-2 text-base font-semibold leading-7 text-white underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2">
                  {post.title}
                </Link>
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare aria-hidden="true" className="size-4" />
                    댓글 {post.commentCount}개
                  </span>
                  <Link href={`/board?stock=${encodeURIComponent(post.stock.symbol)}`} className="inline-flex min-h-11 items-center rounded-lg border border-slate-600 px-3 py-2 text-indigo-200 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2">
                    {post.stock.symbol} 게시글 작성 및 더 보기
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
      <p className="flex items-start gap-2 text-xs leading-6 text-slate-300">
        <ShieldAlert aria-hidden="true" className="mt-1 size-4 shrink-0" />
        게시글의 종목 의견은 회원 작성 정보이며 투자 권유, 보유 증명 또는 서버 검증 수익률이 아닙니다.
      </p>
    </section>
  );
}
