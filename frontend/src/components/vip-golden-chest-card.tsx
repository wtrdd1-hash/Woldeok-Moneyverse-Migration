import { Crown, Gift, ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface VipChestStatus {
  readonly available: boolean;
  readonly isPlusUser: boolean | null;
  readonly claimedToday: boolean | null;
  readonly rewardAmount: string;
  readonly diceAwarded: number;
}

interface VipGoldenChestCardProps {
  readonly status: VipChestStatus | null;
}

/** A claim button is unsafe until the server can return a committed ledger receipt. */
export function VipGoldenChestCard({ status }: VipGoldenChestCardProps) {
  const description = status === null
    ? '보상 상태를 확인할 수 없어 수령 기능을 제공하지 않습니다.'
    : '보상 지급 기능은 현재 준비 중입니다. 실제 지급을 확인할 수 있을 때 다시 안내하겠습니다.';

  return (
    <Card className="relative overflow-hidden border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-card">
      <CardContent className="flex flex-wrap items-start gap-4 p-5 sm:p-6" data-status="unavailable">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-300" aria-hidden="true">
          <Gift className="size-7" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Crown className="size-4" aria-hidden="true" />
            <span>Moneyverse Plus</span>
          </div>
          <h3 className="text-base font-bold text-foreground sm:text-lg">Moneyverse Plus 전용 일일 VIP 황금 상자</h3>
          <p role="status" className="flex items-start gap-2 text-sm text-muted-foreground">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{description}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
