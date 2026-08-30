import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { ApiError, api } from '@/lib/api';
import { requireMember } from '@/lib/session';
import type { ProfileView } from '../profile';
import { isUuid } from '../profile';
import { ProfileCard } from '../profile-parts';

/** Somebody else's profile, on their terms. Never cached, never offered to a crawler. */
export const dynamic = 'force-dynamic';

/**
 * The member's name is deliberately not in the title. A browser tab, a
 * history entry and a shared screenshot all carry it, and the page is
 * readable by any signed-in member -- naming the subject in the chrome puts
 * it somewhere the subject's own settings do not reach.
 */
export const metadata: Metadata = {
  title: '회원 프로필',
  robots: { index: false, follow: false },
};

/**
 * Three answers, kept apart.
 *
 * `apiOrNull` collapses them into one null, and then a profile that loaded
 * perfectly and is simply not shown would be reported as a page that failed
 * to load. They are different facts and the member can act on only one of
 * them.
 *
 * 404 is the API's single answer for "no such member", "that account is
 * closed" and "that profile is not shown to you". It conflates the three on
 * purpose -- distinguishing them would hand an enumerator the membership list
 * one id at a time -- so this page repeats the conflation instead of guessing
 * which of the three it was.
 */
type Outcome =
  | { readonly state: 'shown'; readonly profile: ProfileView }
  | { readonly state: 'hidden' }
  | { readonly state: 'unavailable' };

async function readProfile(userId: string): Promise<Outcome> {
  // A malformed id is answered by `ParseUUIDPipe` with a 400, which would
  // read here as a service fault rather than as a link that does not name
  // anybody. Nothing is learned by asking.
  if (!isUuid(userId)) return { state: 'hidden' };

  try {
    const { profile } = await api<{ profile: ProfileView }>(
      `/api/v1/profile/${encodeURIComponent(userId)}`,
    );
    return { state: 'shown', profile };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return { state: 'hidden' };
    return { state: 'unavailable' };
  }
}

export default async function MemberProfilePage({
  params,
}: {
  readonly params: Promise<{ readonly userId: string }>;
}) {
  await requireMember();
  const { userId } = await params;
  const outcome = await readProfile(userId);

  return (
    <div className="grid gap-6">
      <Button asChild variant="ghost" className="-ml-3 w-fit text-muted-foreground">
        <Link href="/profile">
          <ArrowLeft />
          내 프로필로
        </Link>
      </Button>

      <PageHeader eyebrow="MEMBER PROFILE" title="회원 프로필">
        회원이 공개하기로 한 항목만 보여요. 보이지 않는 항목은 비공개이거나 아직 기록이 없는
        항목입니다.
      </PageHeader>

      {outcome.state === 'shown' ? (
        <ProfileCard profile={outcome.profile} self={false} />
      ) : outcome.state === 'hidden' ? (
        // One sentence for all three of the API's reasons, because the API
        // gives one answer for all three.
        <EmptyState
          title="이 프로필은 볼 수 없어요."
          description="주소가 잘못됐거나, 이용을 중단한 회원이거나, 프로필을 공개하지 않은 회원이에요."
        />
      ) : (
        <EmptyState
          title="프로필을 불러오지 못했어요."
          description="회원이 공개한 내용이 아니라 요청이 닿지 않았어요. 잠시 후 다시 확인해 주세요."
        />
      )}
    </div>
  );
}
