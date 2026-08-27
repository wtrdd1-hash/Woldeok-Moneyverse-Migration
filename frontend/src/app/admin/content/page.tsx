import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireAdministrator } from '@/lib/session';
import { AnnouncementEditor, PhotoEditor, PublicationEditor } from './content-forms';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '콘텐츠 관리',
  robots: { index: false, follow: false },
};

export default async function ContentAdminPage() {
  await requireAdministrator();

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="PUBLISHED CONTENT CONTROL" title="보여 줄 소식만, 차분히 꺼내 놓아요.">
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
