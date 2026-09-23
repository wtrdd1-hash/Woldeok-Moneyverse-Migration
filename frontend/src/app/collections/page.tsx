/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { apiOrNull } from '@/lib/api';
import { requireMember } from '@/lib/session';
import { CurationRetentionFlow } from './curation-retention-flow';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '컬렉션 & 큐레이션 전시관',
  description: '수집한 아이템의 유래와 맥락을 기록하고, D1~D7 큐레이션 리텐션 사다리를 통해 나만의 프라이빗 아카이브를 완성하세요.',
  robots: { index: false, follow: false },
};

interface ViewerProfile {
  readonly id: string;
  readonly username?: string;
  readonly display_name?: string;
}

export default async function CollectionsPage() {
  await requireMember();

  const profileRes = await apiOrNull<{ user?: ViewerProfile }>('/api/v1/auth/me');
  const displayName = profileRes?.user?.display_name || profileRes?.user?.username || '월덕 시민';

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      <PageHeader eyebrow="COLLECTION & CURATION" title="컬렉션 소유권 & 큐레이션 아카이브">
        <p>
          단순한 보상 수령이나 스트릭 리셋 공포가 아닌, "내 것"이라는 애착과 유래(Provenance)를 체감하는 지속 가능한 수집품 전시 공간입니다.
        </p>
      </PageHeader>

      <CurationRetentionFlow userName={displayName} />
    </div>
  );
}
