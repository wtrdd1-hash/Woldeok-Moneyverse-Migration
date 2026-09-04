import type { Metadata } from 'next';
import Link from 'next/link';
import { Accent, PageHeader } from '@/components/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireAdminConsole } from '@/lib/session';
import { AnnouncementEditor, PhotoEditor, PublicationEditor, PhotoReviewQueue, type PendingPhotoItem } from './content-forms';
import { apiOrNull } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '콘텐츠 관리',
  robots: { index: false, follow: false },
};

export default async function ContentAdminPage() {
  await requireAdminConsole();
  const pendingPhotos = await apiOrNull<PendingPhotoItem[]>('/api/v1/admin/photos/submissions') ?? [];

  return (
    <div className="grid gap-6">
      <section aria-labelledby="review-queue-title" className="grid gap-3">
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardDescription className="text-primary font-semibold tracking-wider text-xs">
                  REVIEW QUEUE
                </CardDescription>
                <CardTitle className="text-lg flex items-center gap-2">
                  회원 제출 사진 검토 대기열
                  {pendingPhotos.length > 0 && (
                    <span className="rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs font-bold">
                      {pendingPhotos.length}
                    </span>
                  )}
                </CardTitle>
              </div>
            </div>
            <CardDescription>
              회원들이 사진 게시판에 제출한 사진들입니다. 사진 내용과 설명을 확인한 후 승인하면 즉시 전체 갤러리에 공개됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PhotoReviewQueue items={pendingPhotos} />
          </CardContent>
        </Card>
      </section>
      <PageHeader
        eyebrow="PUBLISHED CONTENT CONTROL"
        title={
          <>
            보여 줄 소식만,
            <br />
            <Accent>차분히 꺼내 놓아요.</Accent>
          </>
        }
      >
        초안 저장과 공개는 별도 기록으로 처리됩니다. 이 화면은 외부 이미지 호스트나 서버 상태를
        설정하지 않으며, 운영 환경에서 이미 승인한 대상만 사용할 수 있어요.
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>ANNOUNCEMENT</CardDescription>
            <CardTitle className="text-base">운영 공지 작성</CardTitle>
            <CardDescription>
              저장만 하면 초안으로 남습니다. ‘바로 공개’를 선택하면 저장 후 같은 내용의 공개
              요청을 이어서 기록합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnnouncementEditor />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>GALLERY</CardDescription>
            <CardTitle className="text-base">사진 메타데이터 등록</CardTitle>
            <CardDescription>
              PNG·JPEG·WebP 파일을 먼저 안전한 내부 저장소에 업로드한 뒤, 공개 주소와 대체
              텍스트를 등록하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PhotoEditor />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardDescription>PUBLICATION CONTROL</CardDescription>
          <CardTitle className="text-base">기존 항목 공개·비공개</CardTitle>
          <CardDescription>
            저장 결과의 ID를 넣어 공개 상태만 바꿀 수 있어요. 기존 제목·내용이나 이미지 정보는 이
            양식에서 변경하지 않습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PublicationEditor />
        </CardContent>
      </Card>

      <Alert>
        <AlertTitle>상태는 여기서 ‘정상’이라고 만들 수 없어요.</AlertTitle>
        <AlertDescription>
          <span>
            웹과 마인크래프트의 상태는 별도 신뢰 수집기가 남긴 최근 기록만 공개됩니다. 이
            페이지의 일반 운영자 권한은 상태 수집원·이미지 호스트·서버 제어 권한을 바꾸지
            못합니다.{' '}
            <Link href="/status" target="_blank" rel="noopener" className="text-primary">
              공개 상태 페이지 열기 ↗
            </Link>
          </span>
        </AlertDescription>
      </Alert>
    </div>
  );
}
