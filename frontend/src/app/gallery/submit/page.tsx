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
import { TranslatedText as T } from '@/components/translated-text';
import { PhotoSubmissionForm } from './submit-forms';

/** One member's own submissions. Never cached, never offered to a crawler. */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '사진 보내기 | Submit Photo',
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

export default async function GallerySubmitPage() {
  await requireMember();
  const data = await apiOrNull<{ submissions: readonly Submission[] }>('/api/v1/photos/mine');
  const submissions = data?.submissions ?? [];

  return (
    <div className="grid gap-6">
      <Button asChild variant="ghost" className="-ml-3 w-fit text-muted-foreground">
        <Link href="/gallery">
          <ArrowLeft />
          <T korean="사진 게시판" english="Photo Gallery" />
        </Link>
      </Button>

      <PageHeader
        eyebrow="SUBMIT A PHOTO"
        title={<T korean="사진 보내기" english="Submit a Photo" />}
      >
        <T
          korean="보낸 사진은 운영자가 확인한 뒤에 사진 게시판에 올라갑니다. 올라가기 전까지는 나만 볼 수 있어요. 다른 사람이 나오는 사진은 그 사람의 동의를 받고 보내 주세요."
          english="Submitted photos are posted to the gallery after operator review. Before approval, only you can see them. Please ensure you have consent from anyone appearing in your photos."
        />
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>
            <T korean="새 사진" english="New Photo" />
          </CardTitle>
          <CardDescription>
            <T korean="사진과 설명을 함께 보내 주세요." english="Please submit your photo along with a description." />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PhotoSubmissionForm />
        </CardContent>
      </Card>

      <section aria-labelledby="mine-title" className="grid gap-3">
        <h2 id="mine-title" className="text-lg font-bold">
          <T korean="내가 보낸 사진" english="My Submissions" />
        </h2>

        {data === null ? (
          <EmptyState title={<T korean="보낸 사진을 불러오지 못했어요." english="Failed to load your submissions." />} />
        ) : submissions.length === 0 ? (
          <EmptyState
            title={<T korean="아직 보낸 사진이 없어요." english="No submissions yet." />}
            description={
              <T
                korean="위에서 사진을 보내면 여기에 상태가 표시돼요."
                english="Once you submit a photo above, its status will be displayed here."
              />
            }
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {submissions.map((submission) => (
              <li key={submission.photo_id}>
                <Card>
                  <CardContent className="grid gap-3">
                    {submission.image_url && (
                      <div className="relative aspect-video w-full overflow-hidden rounded-[12px] border bg-black/40 flex items-center justify-center">
                        <img
                          src={submission.image_url}
                          alt={submission.alt_text}
                          className="max-h-full max-w-full object-contain"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={submission.published ? 'default' : 'secondary'}>
                        {submission.published ? (
                          <T korean="게시됨" english="Published" />
                        ) : (
                          <T korean="검토 중" english="Under Review" />
                        )}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {submission.published && submission.published_at ? (
                          <>
                            {formatMoment(submission.published_at)}
                            <T korean="에 올라감" english=" published" />
                          </>
                        ) : (
                          <>
                            {formatMoment(submission.submitted_at)}
                            <T korean="에 보냄" english=" submitted" />
                          </>
                        )}
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
