import type { Metadata } from 'next';
import Link from 'next/link';
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
  robots: { index: false, follow: false },
};

export default async function InventoryPage() {
  await requireMember();

  const [holdingsData, profileData] = await Promise.all([
    apiOrNull<{ holdings: HeldItem[] }>('/api/v1/shop/holdings'),
    apiOrNull<{ chosenName?: string; discordUsername?: string; avatarUrl?: string }>('/api/v1/profile'),
  ]);

  const holdings = Array.isArray(holdingsData?.holdings) ? holdingsData.holdings : null;
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
        <section role="alert" aria-live="polite" className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 sm:p-6">
          <h2 className="font-bold text-foreground">보유 정보를 확인할 수 없어요.</h2>
          <p className="mt-2 text-sm text-muted-foreground">서버의 보유 기록을 확인하지 못해 장착 기능을 일시적으로 사용할 수 없어요. 실제 아이템이 사라진 것은 아닙니다.</p>
          <Link href="/inventory" className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-border bg-card px-4 text-sm font-bold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500">보유 정보 다시 확인</Link>
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
