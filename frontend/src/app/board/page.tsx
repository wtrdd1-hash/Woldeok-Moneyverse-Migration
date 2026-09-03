import type { Metadata } from 'next';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { formatDay, formatMoment } from '@/lib/money';
import { requireMember } from '@/lib/session';
import { NewPostForm } from './board-forms';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '커뮤니티 광장 (회원 게시판) — 공략 및 자유 토론',
  description: '월덕 머니버스 이용자들과 소통하고 가상경제 팁과 전략을 공유하는 커뮤니티 게시판입니다.',
  robots: { index: true, follow: true },
};

/**
 * A list row, which is all the API sends for a list. The body is fetched by
 * the post's own page — a board of fifty posts used to carry every one of
 * their bodies to render none of them.
 */
interface PostSummary {
  readonly postId: string;
  readonly title: string;
  readonly authorName: string;
  readonly createdAt: string;
  readonly updatedAt: string | null;
  readonly commentCount: number;
  /** The API decides this, not the page. */
  readonly mine: boolean;
}

export default async function BoardPage() {
  await requireMember();
  const data = await apiOrNull<{ posts: PostSummary[] }>('/api/v1/board/posts');

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="MEMBERS ONLY" title="회원 게시판">
        로그인과 최신 정책 동의를 완료한 회원만 작성·열람할 수 있습니다.
      </PageHeader>

      <NewPostForm />

      <section aria-labelledby="posts-title" className="grid gap-3">
        <h2 id="posts-title" className="sr-only">
          글 목록
        </h2>
        {data === null ? (
          <EmptyState title="게시글을 불러오지 못했어요." />
        ) : data.posts.length === 0 ? (
          <EmptyState title="아직 작성된 글이 없어요." description="첫 글을 남겨 보세요." />
        ) : (
          <Card className="overflow-hidden py-0">
            <CardContent className="px-0">
              <ul>
                {data.posts.map((post) => (
                  <li key={post.postId} className="border-b last:border-b-0">
                    <Link
                      href={`/board/${post.postId}`}
                      className="flex min-h-14 items-center gap-4 px-4 py-3 transition-colors hover:bg-paper-dark"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <b className="truncate font-bold">{post.title}</b>
                          {post.commentCount > 0 && (
                            <span
                              className="flex shrink-0 items-center gap-1 text-xs font-bold text-clay-ink"
                              aria-label={`댓글 ${post.commentCount}개`}
                            >
                              <MessageSquare className="size-3.5" aria-hidden />
                              {post.commentCount}
                            </span>
                          )}
                        </span>
                        {/* The two columns the wide layout gives their own
                            cells, stacked under the title on a phone. */}
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground sm:hidden">
                          {post.authorName} · {formatDay(post.createdAt, '작성일 확인 중')}
                        </span>
                      </span>
                      <span className="hidden w-32 shrink-0 truncate text-sm text-muted-foreground sm:block">
                        {post.authorName}
                      </span>
                      <time
                        dateTime={post.createdAt}
                        className="hidden w-36 shrink-0 text-right text-xs text-muted-foreground sm:block"
                      >
                        {formatMoment(post.createdAt, '작성 시간 확인 중')}
                      </time>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
