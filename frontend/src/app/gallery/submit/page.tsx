import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { formatMoment } from '@/lib/money';
import { requireMember } from '@/lib/session';
import { PhotoSubmissionForm } from './submit-forms';

/** One member's own submissions. Never cached, never offered to a crawler. */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '사진 보내기',
  robots: { index: false, follow: false },
};

/** `public.member_my_photo_submissions` (098), as the API returns it. */
interface Submission {
  readonly photo_id: string;
  readonly image_url: string | null;
  readonly alt_text: string;
  readonly published: boolean;
  readonly submitted_at: string;
  readonly published_at: string | null;
}

/**
 * Where a member sends a photo to the gallery.
 *
 * Its own page rather than a panel on `/gallery`, because that page is public
 * and cached for five minutes: a member-only section on it would either break
 * the cache for every signed-out reader or be served to them from somebody
 * else's render.
 *
 * A submission is a draft until an operator publishes it (098), and the page
 * says so rather than implying the photo is up. The member can still see
 * their own draft -- `content_storage_key_visible` makes that one exception,
 * so `/media/<key>` answers them and nobody else.
 */
export default async function GallerySubmitPage() {
  await requireMember();
  const data = await apiOrNull<{ submissions: readonly Submission[] }>('/api/v1/photos/mine');
  const submissions = data?.submissions ?? [];

  return (
    <div className="grid gap-6">
      <Button asChild variant="ghost" className="-ml-3 w-fit text-muted-foreground">
        <Link href="/gallery">
          <ArrowLeft />
          사진 게시판
        </Link>
      </Button>

      <PageHeader eyebrow="SUBMIT A PHOTO" title="사진 보내기">
        보낸 사진은 운영자가 확인한 뒤에 사진 게시판에 올라갑니다. 올라가기 전까지는 나만 볼 수
        있어요. 다른 사람이 나오는 사진은 그 사람의 동의를 받고 보내 주세요.
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>새 사진</CardTitle>
          <CardDescription>사진과 설명을 함께 보내 주세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <PhotoSubmissionForm />
        </CardContent>
      </Card>

      <section aria-labelledby="mine-title" className="grid gap-3">
        <h2 id="mine-title" className="text-lg">
          내가 보낸 사진
        </h2>

        {data === null ? (
          <EmptyState title="보낸 사진을 불러오지 못했어요." />
        ) : submissions.length === 0 ? (
          <EmptyState
            title="아직 보낸 사진이 없어요."
            description="위에서 사진을 보내면 여기에 상태가 표시돼요."
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {submissions.map((submission) => (
              <li key={submission.photo_id}>
                <Card>
                  <CardContent className="grid gap-3">
                    {/* A plain <img>, not next/image: the bytes are served by
                        this application from a path that answers differently
                        depending on who asks, so the optimiser has nothing to
                        cache and would only add a second gate to get wrong. */}
                    {submission.image_url && (
                      <img
                        src={submission.image_url}
                        alt={submission.alt_text}
                        className="aspect-[4/3] w-full rounded-[12px] border object-cover"
                      />
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={submission.published ? 'default' : 'secondary'}>
                        {submission.published ? '게시됨' : '검토 중'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {submission.published && submission.published_at
                          ? `${formatMoment(submission.published_at)}에 올라감`
                          : `${formatMoment(submission.submitted_at)}에 보냄`}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground [word-break:keep-all]">
                      {submission.alt_text}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
