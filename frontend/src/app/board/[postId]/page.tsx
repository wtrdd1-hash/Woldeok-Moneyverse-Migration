import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { apiOrNull } from '@/lib/api';
import { formatMoment } from '@/lib/money';
import { requireMember } from '@/lib/session';
import { CommentForm, DeleteCommentButton, PostControls } from './post-forms';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '게시글',
  robots: { index: false, follow: false },
};

interface Post {
  readonly postId: string;
  readonly title: string;
  readonly body: string;
  readonly authorName: string;
  readonly createdAt: string;
  readonly updatedAt: string | null;
  /** The API decides this, not the page: only the author may edit or delete. */
  readonly mine: boolean;
}

interface Comment {
  readonly commentId: string;
  readonly body: string;
  readonly authorName: string;
  readonly createdAt: string;
  readonly mine: boolean;
}

export default async function PostPage({
  params,
}: {
  readonly params: Promise<{ readonly postId: string }>;
}) {
  await requireMember();
  const { postId } = await params;

  const [postData, commentData] = await Promise.all([
    apiOrNull<{ post: Post }>(`/api/v1/board/posts/${encodeURIComponent(postId)}`),
    apiOrNull<{ comments: Comment[] }>(
      `/api/v1/board/posts/${encodeURIComponent(postId)}/comments`,
    ),
  ]);

  // A deleted post and one that never existed answer the same way, so this
  // page does too.
  if (!postData) notFound();

  const post = postData.post;
  const comments = commentData?.comments ?? [];

  return (
    <div className="grid gap-6">
      <Button asChild variant="ghost" className="w-fit -ml-3 text-muted-foreground">
        <Link href="/board">
          <ArrowLeft />
          목록으로
        </Link>
      </Button>

      <article className="grid gap-5">
        <header className="grid gap-3">
          <h1 className="text-[clamp(1.6rem,3vw,2.25rem)] leading-[1.25]">{post.title}</h1>
          <p className="text-sm text-muted-foreground">
            {post.authorName}
            {' · '}
            <time dateTime={post.createdAt}>
              {formatMoment(post.createdAt, '작성 시간 확인 중')}
            </time>
            {/* An edited post says so. Silently changing a post other people
                have already replied to is worse than not allowing edits. */}
            {post.updatedAt && (
              <>
                {' · '}
                <time dateTime={post.updatedAt}>
                  {formatMoment(post.updatedAt)} 수정됨
                </time>
              </>
            )}
          </p>
        </header>

        <Separator />

        <p className="whitespace-pre-wrap leading-[1.9] [word-break:keep-all]">{post.body}</p>

        {post.mine && (
          <PostControls postId={post.postId} title={post.title} body={post.body} />
        )}
      </article>

      <section aria-labelledby="comments-title" className="grid gap-4">
        <h2 id="comments-title" className="text-lg">
          댓글 {comments.length > 0 && <span className="text-clay-ink">{comments.length}</span>}
        </h2>

        {commentData === null ? (
          <EmptyState title="댓글을 불러오지 못했어요." />
        ) : comments.length === 0 ? (
          <EmptyState title="아직 댓글이 없어요." description="첫 댓글을 남겨 보세요." />
        ) : (
          <Card className="overflow-hidden py-0">
            <CardContent className="grid gap-0 px-0">
              {comments.map((comment) => (
                <div
                  key={comment.commentId}
                  className="flex items-start gap-3 border-b px-4 py-3 last:border-b-0"
                >
                  <div className="min-w-0 flex-1 grid gap-1">
                    <p className="text-xs text-muted-foreground">
                      <b className="font-bold text-foreground">{comment.authorName}</b>
                      {' · '}
                      <time dateTime={comment.createdAt}>
                        {formatMoment(comment.createdAt, '작성 시간 확인 중')}
                      </time>
                    </p>
                    <p className="text-sm leading-[1.8] [word-break:keep-all]">{comment.body}</p>
                  </div>
                  {comment.mine && (
                    <DeleteCommentButton
                      postId={post.postId}
                      commentId={comment.commentId}
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <CommentForm postId={post.postId} />
      </section>
    </div>
  );
}
