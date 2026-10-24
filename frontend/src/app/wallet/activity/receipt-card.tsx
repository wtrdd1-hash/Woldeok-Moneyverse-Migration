import { Card, CardContent } from '@/components/ui/card';
import { formatMoment, formatWld } from '@/lib/money';
import { pocketBreakdown, type TransactionView } from '../sides';

export function WalletReceiptCard({ receipt }: { readonly receipt: TransactionView }) {
  const pockets = pocketBreakdown(receipt);
  return (
    <Card>
      <CardContent className="grid gap-4 py-5">
        <p className="text-sm font-medium">확인된 거래 · {receipt.label}</p>
        <dl className="grid gap-3 text-sm">
          <div><dt className="text-muted-foreground">발생 시각</dt><dd>{formatMoment(receipt.occurredAt)}</dd></div>
          <div><dt className="text-muted-foreground">전체 WLD 변동</dt><dd data-amount={receipt.netAmount} className="break-all font-semibold tabular-nums">{formatWld(receipt.netAmount)}</dd></div>
          <div><dt className="text-muted-foreground">활동 지갑 변동</dt><dd data-amount={pockets?.cashDelta} className="break-all tabular-nums">{pockets ? formatWld(pockets.cashDelta) : '확인 불가'}</dd></div>
          <div><dt className="text-muted-foreground">은행 보관함 변동</dt><dd data-amount={pockets?.bankDelta} className="break-all tabular-nums">{pockets ? formatWld(pockets.bankDelta) : '확인 불가'}</dd></div>
          <div><dt className="text-muted-foreground">거래 참조번호</dt><dd><code className="select-all break-all">{receipt.transactionId}</code></dd></div>
        </dl>
        <p className="text-xs text-muted-foreground">본인 원장의 확정 기록입니다. 이 영수증은 송금 취소나 환불을 의미하지 않습니다.</p>
      </CardContent>
    </Card>
  );
}
