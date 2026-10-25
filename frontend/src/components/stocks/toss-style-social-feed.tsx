import Link from 'next/link';
import { MessageSquare, ArrowUpRight } from 'lucide-react';
import { formatMoment } from '@/lib/money';

export interface StockDiscussionPost {
  readonly postId: string;
  readonly title: string;
  readonly authorName: string;
  readonly createdAt: string;
  readonly commentCount: number;
  readonly stock: {
    readonly symbol: string;
    readonly name: string;
    readonly category: string;
    readonly stance: string;
    readonly positionDisclosure: string;
  } | null;
}

const categoryLabels: Record<string, string> = {
  analysis: '분석',
  journal: '매매 일지',
  question: '질문',
  business: '기업 정보',
  system: '시스템',
};

const stanceLabels: Record<string, string> = {
  bullish: '상승 전망',
  bearish: '하락 전망',
  neutral: '중립',
  none: '의견 없음',
};

const disclosureLabels: Record<string, string> = {
  holder: '보유한다고 신고',
  no_position: '미보유 신고',
  operator_related: '관계자 신고',
  undisclosed: '미공개',
};

export function TossStyleSocialFeed({
  posts,
  selectedStock,
  loadFailed,
}: {
  readonly posts: readonly StockDiscussionPost[];
  readonly selectedStock: string | null;
  readonly loadFailed: boolean;
}) {
  const boardHref = selectedStock ? `/board?stock=${encodeURIComponent(selectedStock)}` : '/board';

  return (
    <section aria-labelledby="stock-community-title" className="mx-auto grid w-full max-w-4xl gap-6">
      <header className="flex flex-col gap-4 border-b border-slate-700 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest text-emerald-300">VIRTUAL STOCK DISCUSSION</p>
          <h1 id="stock-community-title" className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            가상 주식 종목 토론
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            서버 게시판에 실제 등록된 글만 표시합니다. 작성자가 신고한 보유 관계와 의견은
            거래 원장 또는 수익률 인증이 아닙니다.
          </p>
        </div>
        <Link
          href={boardHref}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          토론 글 작성 <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </header>

      <form action="/stocks/community" method="get" role="search" className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-700 bg-slate-900 p-4">
        <div className="min-w-0 flex-1">
          <label htmlFor="stock-community-filter" className="mb-2 block text-sm font-medium text-slate-200">
            종목코드
          </label>
          <input
            id="stock-community-filter"
            name="stock"
            type="text"
            maxLength={16}
            pattern="[A-Za-z0-9._-]{1,16}"
            defaultValue={selectedStock ?? ''}
            placeholder="예: WDX"
            autoCapitalize="characters"
            className="min-h-11 w-full rounded-md border border-slate-600 bg-slate-950 px-3 text-base text-white placeholder:text-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          />
        </div>
        <button type="submit" className="min-h-11 rounded-md border border-slate-500 px-5 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
          종목 검색
        </button>
        {selectedStock ? (
          <Link href="/stocks/community" className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-slate-200 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            전체 보기
          </Link>
        ) : null}
      </form>

      {loadFailed ? (
        <div role="alert" className="rounded-lg border border-amber-700 bg-amber-950/40 p-5 text-sm text-amber-100">
          종목 토론을 불러오지 못했어요. 서버 연결을 확인한 뒤 다시 시도해 주세요.
        </div>
      ) : posts.length === 0 ? (
        <div role="status" className="rounded-lg border border-slate-700 bg-slate-900 p-6 text-sm text-slate-200">
          아직 등록된 종목 토론 글이 없어요. 게시판에서 첫 이야기를 남겨 주세요.
        </div>
      ) : (
        <ol aria-label="실제 등록된 종목 토론 글" className="grid gap-3">
          {posts.map((post) => (
            <li key={post.postId} className="rounded-lg border border-slate-700 bg-slate-900 p-4 sm:p-5">
              <article className="grid gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                  {post.stock ? (
                    <span className="rounded border border-slate-600 px-2 py-1 font-mono text-emerald-200">
                      {post.stock.symbol} · {post.stock.name}
                    </span>
                  ) : null}
                  {post.stock?.category ? <span>{categoryLabels[post.stock.category] ?? '토론'}</span> : null}
                  {post.stock?.stance ? <span>{stanceLabels[post.stock.stance] ?? '의견 없음'}</span> : null}
                </div>
                <Link
                  href={`/board/${encodeURIComponent(post.postId)}`}
                  className="inline-flex min-h-11 items-center text-base font-bold leading-6 text-white underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {post.title}
                </Link>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-300">
                  <span>{post.authorName}</span>
                  <time dateTime={post.createdAt}>{formatMoment(post.createdAt, '작성 시간 확인 중')}</time>
                  <span className="inline-flex items-center gap-1"><MessageSquare className="size-3.5" aria-hidden="true" /> 댓글 {post.commentCount}개</span>
                </div>
                {post.stock ? (
                  <p className="border-t border-slate-700 pt-3 text-xs leading-5 text-slate-300">
                    작성자 자기신고: {disclosureLabels[post.stock.positionDisclosure] ?? '미공개'} · 서버 보유 인증 아님
                  </p>
                ) : null}
              </article>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
