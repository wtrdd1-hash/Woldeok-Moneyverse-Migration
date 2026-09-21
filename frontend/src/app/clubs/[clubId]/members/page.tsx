import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { apiOrNull } from '@/lib/api';
import { requireMember } from '@/lib/session';
import { MembersView } from './members-view';
import type { ClubMember } from './members-view';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '클럽 회원 명부',
  description: '클럽 소속 회원 목록 및 1:1 쪽지 대화',
  robots: { index: false, follow: false },
};

export default async function ClubMembersPage({
  params,
}: {
  readonly params: Promise<{ readonly clubId: string }>;
}) {
  await requireMember();
  const { clubId } = await params;

  const [clubRes, membersRes] = await Promise.all([
    apiOrNull<{ club: { id: string; name: string; tag: string; my_role: string | null } }>(
      `/api/v1/clubs/${encodeURIComponent(clubId)}`,
    ),
    apiOrNull<{ members: ClubMember[] }>(
      `/api/v1/clubs/${encodeURIComponent(clubId)}/members?limit=100`,
    ),
  ]);

  if (!clubRes?.club) {
    notFound();
  }

  const club = clubRes.club;
  const members = membersRes?.members ?? [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <PageHeader eyebrow="클럽 회원 명부" title={`[${club.tag}] ${club.name} — 회원 명부`}>
        <p>
          클럽원들을 확인하고, 1:1 비공개 쪽지로 신속하게 협동 소통을 나누세요.
        </p>
      </PageHeader>

      <MembersView
        clubId={club.id}
        members={members}
        myRole={club.my_role}
      />
    </div>
  );
}
