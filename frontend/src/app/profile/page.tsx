import type { Metadata } from 'next';
import { EmptyState } from '@/components/empty-state';
import { Accent, PageHeader, SectionHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { requireMember } from '@/lib/session';
import type { ProfileSettings, ProfileView } from './profile';
import { ProfileImageForm, ProfileSettingsForm } from './profile-forms';
import { ProfileCard } from './profile-parts';

/** One member's own profile and settings. Never cached, never offered to a crawler. */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '내 프로필',
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  await requireMember();

  // Two reads, because they answer different questions. `member_profile_view`
  // answers what a reader sees -- which for the owner is every field, and is
  // what the card renders. The settings read answers what is stored,
  // including the per-field visibility map: without it the form would render
  // every control as "inherit" and saving a display name would republish an
  // image the member had made private, because the write replaces the map
  // rather than patching it.
  const [data, stored] = await Promise.all([
    apiOrNull<{ profile: ProfileView }>('/api/v1/profile'),
    apiOrNull<{ settings: ProfileSettings }>('/api/v1/profile/settings'),
  ]);
  const profile = data?.profile ?? null;
  const settings = stored?.settings ?? null;

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="MEMBER PROFILE"
        title={
          <>
            내 프로필은
            <br />
            <Accent>내가 정한 만큼만 보여요.</Accent>
          </>
        }
      >
        이름과 이미지를 정하고, 어떤 항목을 누구에게 보여 줄지 항목마다 고를 수 있어요. 프로필에
        보이는 직업과 작업 기록은 모두 게임 안의 데이터입니다.
      </PageHeader>

      <section aria-labelledby="my-profile-title" className="grid gap-3">
        <SectionHeader eyebrow="AS IT STANDS" title="지금 내 프로필" id="my-profile-title" />

        {profile === null ? (
          <EmptyState
            title="프로필을 불러오지 못했어요."
            description="저장된 내용을 추측해서 보여 주지는 않습니다. 잠시 후 다시 확인해 주세요."
          />
        ) : (
          <ProfileCard profile={profile} self />
        )}
      </section>

      <section aria-labelledby="visibility-title" className="grid gap-3">
        <SectionHeader eyebrow="WHO SEES WHAT" title="공개 범위 설정" id="visibility-title" />

        {profile === null || settings === null ? (
          // Deliberately not a blank form. Saving replaces every column from
          // what the form holds, so an empty one submitted over a failed read
          // would clear the name, the image and the title that are still
          // stored -- the member would have wiped their profile by pressing a
          // button that looked like it was going to change one setting.
          <EmptyState
            title="지금은 설정 양식을 열 수 없어요."
            description="저장할 때 프로필 전체가 이 화면의 값으로 다시 저장되기 때문에, 지금 저장된 내용을 확인하기 전에는 양식을 보여 주지 않아요."
          />
        ) : (
          <div className="grid gap-3">
            <Card>
              <CardContent className="grid gap-6">
                <ProfileImageForm imagePath={settings.image_url} />
                <ProfileSettingsForm profile={profile} settings={settings} />
              </CardContent>
            </Card>
            <p className="max-w-prose text-xs text-muted-foreground">
              다른 회원은 각자의 프로필 주소로 내 프로필을 열고, 여기에서 공개하기로 한 항목만 보게
              돼요. 프로필 전체를 비공개로 두면 주소를 알고 있어도 열리지 않아요.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
