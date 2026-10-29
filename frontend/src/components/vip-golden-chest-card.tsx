import { Gift, ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { VipChestHold } from '@/app/quests/vip-chest-status';

/** No claim button is rendered until a ledger-backed receipt and Plus
 * entitlement can be verified by the server. This is a status, not a payout. */
export function VipGoldenChestCard({ status }: { readonly status: VipChestHold | null }) {
  return (
    <Card className="border-amber-500/40 bg-amber-500/5">
      <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:gap-4 sm:p-6">
        <div aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600">
          <Gift className="size-6" />
        </div>
        <div className="min-w-0 space-y-2">
          <h2 className="text-base font-bold sm:text-lg">VIP 황금 상자 보상</h2>
          <p role="status" aria-live="polite" className="flex items-start gap-2 rounded-lg border border-amber-500/40 p-3 text-sm">
            <ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>{status === null
              ? '보상 상태 확인 불가: 현재 수령 기능은 제공되지 않습니다.'
              : '현재 이용 불가: 회원 자격과 원장 지급 영수증을 검증할 수 없어 보상 지급이 중단되었습니다.'}</span>
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            2,000 WLD와 럭키 다이스 지급은 확인되지 않았습니다. 이 기능은 보상을 지급하지 않으며,
            실제 거래 영수증이 검증되기 전까지 성공으로 표시하지 않습니다.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
