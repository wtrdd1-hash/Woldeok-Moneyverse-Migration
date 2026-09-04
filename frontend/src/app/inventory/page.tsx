import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { TranslatedText as T } from '@/components/translated-text';
import { Accent } from '@/components/page-header';
import { apiOrNull } from '@/lib/api';
import { requireMember } from '@/lib/session';
import { InventoryView, type HeldItem } from './inventory-view';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '내 보관함 · 인벤토리',
  description: '보유한 아이템 및 아바타 프레임, 배경, 효과, 칭호 치장 관리',
};

export default async function InventoryPage() {
  await requireMember();

  const [holdingsData, profileData] = await Promise.all([
    apiOrNull<{ holdings: HeldItem[] }>('/api/v1/shop/holdings'),
    apiOrNull<{ chosenName?: string; discordUsername?: string; avatarUrl?: string }>('/api/v1/profile'),
  ]);

  const holdings = holdingsData?.holdings || [];
  const username = profileData?.chosenName || profileData?.discordUsername || '모험가';
  const avatarUrl = profileData?.avatarUrl;

  return (
    <div className="grid gap-8 pb-16">
      <PageHeader
        eyebrow="WOLDEOK INVENTORY"
        title={
          <>
            <T korean="나의 보관함," english="My Personal Vault," />
            <br />
            <Accent>
              <T korean="치장과 장비를 관리해요." english="Manage your cosmetics." />
            </Accent>
          </>
        }
      >
        <T
          korean="상점에서 구매하거나 획득한 모든 아이템을 보관하고, 원하는 치장품을 장착하여 세계관 속 내 캐릭터를 꾸며보세요."
          english="Store all items acquired and customize your avatar with frames, effects, backgrounds, and badges."
        />
      </PageHeader>

      <InventoryView
        holdings={holdings}
        currentUsername={username}
        userAvatarUrl={avatarUrl}
      />
    </div>
  );
}
