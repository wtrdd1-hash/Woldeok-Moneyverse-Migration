import type { Metadata } from 'next';
import Link from 'next/link';
import { Accent, PageHeader } from '@/components/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireAdminConsole } from '@/lib/session';
import {
  AnnouncementEditor,
  PhotoEditor,
  PublicationEditor,
  PhotoReviewQueue,
  AnnouncementManagementTable,
  PhotoManagementGrid,
  type PendingPhotoItem,
  type AdminAnnouncementItem,
  type AdminPhotoItem,
} from './content-forms';
import { apiOrNull } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '콘텐츠 관리',
  robots: { index: false, follow: false },
};

export default async function ContentAdminPage() {
  await requireAdminConsole('/admin/content');
  const [pendingPhotosRes, announcementsData, allPhotosRes] = await Promise.all([
    apiOrNull<PendingPhotoItem[]>('/api/v1/admin/photos/submissions'),
    apiOrNull<AdminAnnouncementItem[] | { announcements: AdminAnnouncementItem[] }>(
      '/api/v1/admin/announcements',
    ),
    apiOrNull<AdminPhotoItem[]>('/api/v1/admin/photos'),
  ]);
  const pendingPhotos = pendingPhotosRes ?? [];
  const announcements = Array.isArray(announcementsData)
    ? announcementsData
    : (announcementsData?.announcements ?? []);
  const allPhotos = allPhotosRes ?? [];

  return (
    <div className="grid gap-6">
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
        공지사항을 쉽게 조회하고 삭제하거나 공개/비공개 상태를 원터치로 변경할 수 있습니다.
      </PageHeader>

      <section aria-labelledby="announcement-manage-title" className="grid gap-3">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardDescription className="text-primary font-semibold tracking-wider text-xs">
                  ANNOUNCEMENT MANAGEMENT
                </CardDescription>
                <CardTitle className="text-lg flex items-center gap-2">
                  공지사항 목록 및 간편 삭제 관리
                  {announcements.length > 0 && (
                    <span className="rounded-full bg-primary/20 text-primary px-2 py-0.5 text-xs font-bold">
                      {announcements.length}개
                    </span>
                  )}
                </CardTitle>
              </div>
            </div>
            <CardDescription>
              사이트에 등록된 모든 공지사항을 한눈에 확인하고, 불필요한 공지를 즉시 삭제하거나
              공개/비공개로 전환하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnnouncementManagementTable items={announcements} />
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="photo-manage-title" className="grid gap-3">
        <Card>
          <CardHeader>
            <CardDescription>GALLERY MANAGEMENT</CardDescription>
            <CardTitle id="photo-manage-title" className="text-lg">
              전체 사진 공개·비공개·삭제
            </CardTitle>
            <CardDescription>대기 중이거나 이미 공개된 사진을 모두 관리합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <PhotoManagementGrid items={allPhotos} />
          </CardContent>
        </Card>
      </section>

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
              회원들이 사진 게시판에 제출한 사진들입니다. 사진 내용과 설명을 확인한 후 승인하면 즉시
              전체 갤러리에 공개됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PhotoReviewQueue items={pendingPhotos} />
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>ANNOUNCEMENT</CardDescription>
            <CardTitle className="text-base">새 운영 공지 작성</CardTitle>
            <CardDescription>
              저장만 하면 초안으로 남습니다. ‘바로 공개’를 선택하면 저장 후 같은 내용의 공개 요청을
              이어서 기록합니다.
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
              PNG·JPEG·WebP 파일을 먼저 안전한 내부 저장소에 업로드한 뒤, 공개 주소와 대체 텍스트를
              등록하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PhotoEditor />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardDescription>MANUAL PUBLICATION CONTROL</CardDescription>
          <CardTitle className="text-base">ID 직접 입력 공개·비공개</CardTitle>
          <CardDescription>저장 결과의 ID를 직접 넣어 공개 상태만 바꿀 수 있어요.</CardDescription>
        </CardHeader>
        <CardContent>
          <PublicationEditor />
        </CardContent>
      </Card>

      <Alert>
        <AlertTitle>상태는 여기서 ‘정상’이라고 만들 수 없어요.</AlertTitle>
        <AlertDescription>
          <span>
            웹 서비스 상태는 별도 신뢰 수집기가 남긴 최근 기록만 공개됩니다. 이 페이지의 일반 운영자
            권한은 상태 수집원·이미지 호스트·서버 제어 권한을 바꾸지 못합니다.{' '}
            <Link href="/status" target="_blank" rel="noopener" className="text-primary">
              공개 상태 페이지 열기 ↗
            </Link>
          </span>
        </AlertDescription>
      </Alert>
    </div>
  );
}
