import type { Metadata } from 'next';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { formatMoment } from '@/lib/money';
import { requireMember } from '@/lib/session';
import { DeletePostButton, NewPostForm } from './board-forms';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '회원 게시판',
  robots: { index: false, follow: false },
};

interface Post {
  readonly postId: string;
  readonly title: string;
  readonly body: string;
  readonly authorName: string;
  readonly createdAt: string;
  /** The API decides this, not the page: only the author may delete. */
  readonly mine: boolean;
}

export default async function BoardPage() {
  await requireMember();
  const data = await apiOrNull<{ posts: Post[] }>('/api/v1/board/posts');

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="MEMBERS ONLY" title="회원 게시판">
        로그인과 최신 정책 동의를 완료한 회원만 작성·열람할 수 있습니다.
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>새 글 쓰기</CardTitle>
        </CardHeader>
        <CardContent>
          <NewPostForm />
        </CardContent>
      </Card>

      <section aria-labelledby="posts-title" className="grid gap-3">
        <h2 id="posts-title" className="text-lg font-medium">
          최근 글
        </h2>
        {data === null ? (
          <EmptyState title="게시글을 불러오지 못했어요." />
        ) : data.posts.length === 0 ? (
          <EmptyState title="아직 작성된 글이 없어요." description="첫 글을 남겨 보세요." />
        ) : (
          data.posts.map((post) => (
            <Card key={post.postId} className="gap-3">
              <CardHeader>
                <CardTitle className="text-base">{post.title}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {post.authorName} · {formatMoment(post.createdAt, '작성 시간 확인 중')}
                </p>
              </CardHeader>
              <CardContent className="grid gap-3">
                <p className="whitespace-pre-wrap text-sm">{post.body}</p>
                {post.mine && (
                  <div className="justify-self-end">
                    <DeletePostButton postId={post.postId} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
