import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { apiOrNull } from '@/lib/api';
import { requireMember } from '@/lib/session';
import { ClubhouseView } from './clubhouse-view';
import type { ClubDetail, ClubFeedPost, ClubProject } from './clubhouse-view';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  readonly params: Promise<{ readonly clubId: string }>;
}): Promise<Metadata> {
  const { clubId } = await params;
  const result = await apiOrNull<{ club: ClubDetail }>(`/api/v1/clubs/${encodeURIComponent(clubId)}`);
  return {
    title: result?.club ? `[${result.club.tag}] ${result.club.name} — 클럽하우스` : '클럽하우스',
    description: '클럽 협동 프로젝트 및 커뮤니티 공간',
    robots: { index: false, follow: false },
  };
}

export default async function ClubDetailPage({
  params,
}: {
  readonly params: Promise<{ readonly clubId: string }>;
}) {
  await requireMember();
  const { clubId } = await params;

  const [clubRes, projectsRes, feedRes] = await Promise.all([
    apiOrNull<{ club: ClubDetail }>(`/api/v1/clubs/${encodeURIComponent(clubId)}`),
    apiOrNull<{ projects: ClubProject[] }>(`/api/v1/clubs/${encodeURIComponent(clubId)}/projects`),
    apiOrNull<{ posts: ClubFeedPost[] }>(`/api/v1/clubs/${encodeURIComponent(clubId)}/feed`),
  ]);

  if (!clubRes?.club) {
    notFound();
  }

  const club = clubRes.club;
  const projects = projectsRes?.projects ?? [];
  const feed = feedRes?.posts ?? [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      <PageHeader eyebrow="클럽하우스" title={`[${club.tag}] ${club.name}`}>
        <p>
          클럽원들과 함께 WLD를 협동 펀딩하여 거점 랜드마크를 완성하고 소식을 나누세요.
        </p>
      </PageHeader>

      <ClubhouseView club={club} projects={projects} feed={feed} />
    </div>
  );
}
