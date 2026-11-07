import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { TranslatedText as T } from '@/components/translated-text';
import { Accent } from '@/components/page-header';
import { api, apiOrNull } from '@/lib/api';
import { parseVerifiedShopHoldings } from '@/lib/shop-holdings-evidence';
import { requireMember } from '@/lib/session';
import { InventoryView } from './inventory-view';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '내 보관함 · 인벤토리',
  description: '보유한 아이템 및 아바타 프레임, 배경, 효과, 칭호 치장 관리',
  robots: { index: false, follow: false },
};

export default async function InventoryPage() {
  await requireMember();

  const [holdings, profileData] = await Promise.all([
    api<unknown>('/api/v1/shop/holdings').then(parseVerifiedShopHoldings).catch(() => null),
    apiOrNull<{ chosenName?: string; discordUsername?: string; avatarUrl?: string }>('/api/v1/profile'),
  ]);

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
        <section role="alert" className="rounded-2xl border border-amber-500/50 bg-card p-6">
          <p className="font-bold">보관함을 불러올 수 없습니다.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            보유 내역을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.
          </p>
          <a href="/inventory" className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-border px-5 font-semibold">
            다시 시도
          </a>
        </section>
      ) : (
        <InventoryView
          holdings={holdings}
          currentUsername={username}
          userAvatarUrl={avatarUrl}
        />
      )}
    </div>
  );
}
