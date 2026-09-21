import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { apiOrNull } from '@/lib/api';
import { requireMember } from '@/lib/session';
import { SpacesView } from './spaces-view';
import type { CityProject, UserSpace } from './spaces-view';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '개인 공간 & 도시 프로젝트',
  description: '나만의 프라이빗 공간을 소유하고, 공공 도시 인프라 크라우드펀딩에 참여하세요.',
  robots: { index: false, follow: false },
};

export default async function SpacesPage() {
  await requireMember();

  const [spacesRes, cityRes] = await Promise.all([
    apiOrNull<{ spaces: UserSpace[] }>('/api/v1/spaces'),
    apiOrNull<{ projects: CityProject[] }>('/api/v1/spaces/city/projects'),
  ]);

  const spaces = spacesRes?.spaces ?? [];
  const cityProjects = cityRes?.projects ?? [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      <PageHeader eyebrow="개인 공간 & 도시" title="개인 공간 & 공공 도시 프로젝트">
        <p>
          Pay-to-Win을 배제한 나만의 프라이빗 거점과 시민 협동으로 완성하는 머니버스 공공 도시 랜드마크입니다.
        </p>
      </PageHeader>

      <SpacesView spaces={spaces} cityProjects={cityProjects} />
    </div>
  );
}
