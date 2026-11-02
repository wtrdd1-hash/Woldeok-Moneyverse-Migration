import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { TranslatedText as T } from '@/components/translated-text';
import { Accent } from '@/components/page-header';
import { apiOrNull } from '@/lib/api';
import { requireMember } from '@/lib/session';
import { InventoryView, type HeldItem } from './inventory-view';
import { isVerifiedInventoryAttention } from '@/lib/inventory-attention';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '내 보관함 · 인벤토리',
  description: '보유한 아이템 및 아바타 프레임, 배경, 효과, 칭호 치장 관리',
  robots: { index: false, follow: false },
};

export default async function InventoryPage() {
  await requireMember();

  const attentionEnabled = process.env.INVENTORY_ATTENTION_FILTER_ENABLED === '1';
  const [holdingsData, profileData, attentionData] = await Promise.all([
    apiOrNull<{ holdings: HeldItem[] }>('/api/v1/shop/holdings'),
    apiOrNull<{ chosenName?: string; discordUsername?: string; avatarUrl?: string }>('/api/v1/profile'),
    attentionEnabled ? apiOrNull<unknown>('/api/v1/shop/holdings?filter=attention') : Promise.resolve(null),
  ]);

  const holdings = Array.isArray(holdingsData?.holdings) ? holdingsData.holdings : null;
  const attentionHoldings = attentionEnabled && isVerifiedInventoryAttention(attentionData)
    ? attentionData.holdings as unknown as HeldItem[] : null;
  const username = profileData?.chosenName || profileData?.discordUsername || '모험가';
  const avatarUrl = profileData?.avatarUrl;

  return (
    <div data-page="inventory" className="mv-page mv-page--gameplay grid gap-8 pb-16">
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

      {holdings === null ? (
        <div role="alert" className="rounded-lg border p-6">
          보관함 정보를 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.
        </div>
      ) : (
        <InventoryView
          holdings={holdings}
          attentionHoldings={attentionEnabled ? attentionHoldings : undefined}
          currentUsername={username}
          userAvatarUrl={avatarUrl}
        />
      )}
    </div>
  );
}
