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
import { isLoggedInMember } from '@/lib/session';
import { CommentForm, DeleteCommentButton, PostControls } from './post-forms';

export const dynamic = 'force-dynamic';

interface Post {
  readonly postId: string;
  readonly title: string;
  readonly body: string;
  readonly authorName: string;
  readonly createdAt: string;
  readonly updatedAt: string | null;
  readonly mine: boolean;
  readonly imageUrl: string | null;
  readonly imageAltText: string | null;
}

interface Comment {
  readonly commentId: string;
  readonly body: string;
  readonly authorName: string;
  readonly createdAt: string;
  readonly mine: boolean;
}

async function publicPost(postId: string): Promise<Post | null> {
  const data = await apiOrNull<{ post: Post }>(
    `/api/v1/board/public/posts/${encodeURIComponent(postId)}`,
  );
  return data?.post ?? null;
}

export async function generateMetadata({
  params,
}: {
  readonly params: Promise<{ readonly postId: string }>;
}): Promise<Metadata> {
  const { postId } = await params;
  const post = await publicPost(postId);
  if (!post) return { title: '게시글', robots: { index: false, follow: false } };
  const description = post.body.replace(/\s+/g, ' ').trim().slice(0, 155);
  return {
    title: post.title,
    description,
    alternates: { canonical: `/board/${post.postId}` },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      url: `/board/${post.postId}`,
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt ?? undefined,
    },
  };
}

export default async function PostPage({
  params,
}: {
  readonly params: Promise<{ readonly postId: string }>;
}) {
  const { postId } = await params;
  const member = await isLoggedInMember();
  const root = member ? '/api/v1/board/posts' : '/api/v1/board/public/posts';
  const [postData, commentData] = await Promise.all([
    apiOrNull<{ post: Post }>(`${root}/${encodeURIComponent(postId)}`),
    apiOrNull<{ comments: Comment[] }>(`${root}/${encodeURIComponent(postId)}/comments`),
  ]);

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
            {post.updatedAt && (
              <>
                {' · '}
                <time dateTime={post.updatedAt}>{formatMoment(post.updatedAt)} 수정됨</time>
              </>
            )}
          </p>
        </header>

        <Separator />

        {post.imageUrl && post.imageAltText && (
          <figure className="overflow-hidden rounded-xl border bg-black/30">
            <img
              src={post.imageUrl}
              alt={post.imageAltText}
              className="max-h-[70vh] w-full object-contain"
              loading="eager"
              decoding="async"
            />
            <figcaption className="border-t px-3 py-2 text-xs text-muted-foreground">
              {post.imageAltText}
            </figcaption>
          </figure>
        )}

        <p className="whitespace-pre-wrap leading-[1.9] [word-break:keep-all]">{post.body}</p>

        {member && post.mine && (
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
          <EmptyState
            title="아직 댓글이 없어요."
            description={member ? '첫 댓글을 남겨 보세요.' : '댓글 작성은 로그인 후 가능합니다.'}
          />
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
                  {member && comment.mine && (
                    <DeleteCommentButton postId={post.postId} commentId={comment.commentId} />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {member ? (
          <CommentForm postId={post.postId} />
        ) : (
          <p className="text-sm text-muted-foreground">
            댓글을 남기려면{' '}
            <Link href="/login" className="font-bold underline underline-offset-4">
              로그인
            </Link>
            해 주세요.
          </p>
        )}
      </section>
    </div>
  );
}
