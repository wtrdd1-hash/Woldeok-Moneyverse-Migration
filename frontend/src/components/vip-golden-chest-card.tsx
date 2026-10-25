import Link from 'next/link';
import { Gift, ShieldAlert, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface VipChestStatus {
  readonly available: false;
  readonly entitlementVerified: false;
  readonly ledgerReceiptVerified: false;
  readonly reason: 'LEDGER_RECEIPT_UNAVAILABLE';
}

/** Only a server-confirmed ledger receipt may turn a virtual payout into success. */
export function VipGoldenChestCard({ status }: { readonly status: VipChestStatus | null }) {
  return (
    <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-card">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex min-w-0 items-start gap-3">
          <Gift className="mt-1 size-6 shrink-0 text-amber-500" aria-hidden="true" />
          <div className="min-w-0 space-y-2">
            <h2 className="text-base font-bold text-foreground sm:text-lg">
              Moneyverse Plus 전용 일일 VIP 황금 상자
            </h2>
            <p role="status" aria-live="polite" className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden="true" />
              <span>
                {status === null
                  ? '황금 상자 상태를 확인할 수 없습니다. 보상 수령은 진행되지 않았습니다.'
                  : '실제 원장 지급 영수증이 없어 지급 기능을 안전하게 중단했습니다. 보상은 지급되지 않았습니다.'}
              </span>
            </p>
          </div>
        </div>
        <Link
          href="/wallet"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-amber-500/40 px-4 py-2 text-sm font-semibold text-foreground hover:bg-amber-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
        >
          <Wallet className="size-4" aria-hidden="true" />
          지갑 기록 확인
        </Link>
      </CardContent>
    </Card>
  );
}
