'use client';

import Link from 'next/link';
import { Hammer, ShieldAlert } from 'lucide-react';
import type { CraftingRecipe } from './crafting-recipes';
import type { MarketplaceHolding } from './marketplace';

interface CraftingPanelProps {
  readonly holdings: readonly MarketplaceHolding[];
  readonly userBalanceWld: string;
  readonly onCraftSuccess?: (recipe: CraftingRecipe) => void;
}

/** Legacy callers may still mount this panel; none may advertise an unledgered craft. */
export function CraftingPanel(_props: CraftingPanelProps) {
  return (
    <section aria-labelledby="crafting-hold-title" className="min-w-0 space-y-4 rounded-2xl border border-amber-500/40 bg-card p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <Hammer className="size-6 shrink-0 text-amber-600" aria-hidden="true" />
        <h2 id="crafting-hold-title" className="text-lg font-semibold sm:text-xl">제작 기능 점검 중</h2>
      </div>
      <div role="status" className="flex min-w-0 items-start gap-3 rounded-xl bg-amber-500/10 p-4 text-sm leading-relaxed">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-700" aria-hidden="true" />
        <p>제작 기능은 현재 이용 불가 상태입니다. WLD 수수료의 원장 정산과 아이템 지급 근거를 확인할 때까지 제작 요청을 전송하지 않습니다. 보유 재료나 잔액만으로 제작 가능 여부를 판단하지 않습니다.</p>
      </div>
      <Link href="/marketplace" className="inline-flex min-h-11 items-center rounded-xl border px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2">
        거래소로 돌아가기
      </Link>
    </section>
  );
}
