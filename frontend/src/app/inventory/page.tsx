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

  const holdings = holdingsData?.holdings || [];
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

      {holdingsData ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">
            <T korean="보유 아이템의 주간 유지비·연체금·사용 정지 현황을 CSV로 확인해요. 최대 100건까지 지원해요." english="Export current virtual item upkeep, arrears and suspension exposure (up to 100 items)." />
          </p>
          <Link href="/api/shop/holdings/upkeep-export" aria-label="내 아이템 유지비 및 연체 현황 CSV 다운로드"
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
            <T korean="유지비·연체 현황 CSV" english="Export upkeep CSV" />
          </Link>
        </div>
      ) : (
        <p role="status" className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
          <T korean="현재 보유 아이템을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." english="Your inventory is temporarily unavailable. Please retry." />
        </p>
      )}

      <InventoryView
        holdings={holdings}
        currentUsername={username}
        userAvatarUrl={avatarUrl}
      />
    </div>
  );
}
