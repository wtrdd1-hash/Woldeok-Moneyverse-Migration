import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { apiOrNull } from '@/lib/api';
import { requireMember } from '@/lib/session';
import { CollectionArchive } from './collection-archive';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '내 소장품 · 컬렉션',
  description: '회원 계정의 실제 보유 아이템을 서버 기록으로 확인하는 비공개 목록입니다.',
  robots: { index: false, follow: false },
};

export default async function CollectionsPage() {
  await requireMember();
  const response = await apiOrNull<unknown>('/api/v1/shop/holdings');

  return (
    <div data-page="collections" className="mv-page mv-page--member grid gap-6">
      <PageHeader eyebrow="VERIFIED COLLECTION" title="내 소장품">
        현재 계정의 실제 보유 기록만 표시합니다. 획득하지 않은 기념품이나 저장되지 않은 큐레이션 결과는 표시하지 않습니다.
      </PageHeader>
      <CollectionArchive response={response} />
    </div>
  );
}
