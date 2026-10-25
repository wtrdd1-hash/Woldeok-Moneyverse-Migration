import { Card, CardContent } from '@/components/ui/card';
import { groupDigits, formatMoment } from '@/lib/money';

export interface VerifiedWorkReceipt {
  readonly receipt_id: string;
  readonly assignment_id: string;
  readonly code: string;
  readonly name: string;
  readonly reward_amount: string;
  readonly experience_amount: string;
  readonly transaction_id: string | null;
  readonly created_at: string;
  readonly settlement_status: 'VERIFIED' | 'EXP_ONLY' | 'UNVERIFIED';
}

export interface VerifiedWorkEarnings {
  readonly window: 'RECENT_20';
  readonly limit: 20;
  readonly verified_wld: string;
  readonly verified_count: number;
  readonly exp_only_count: number;
  readonly unverified_count: number;
  readonly receipts: readonly VerifiedWorkReceipt[];
}

export function WorkEarningsView({ earnings, isEn }: {
  readonly earnings: VerifiedWorkEarnings | null;
  readonly isEn: boolean;
}) {
  if (!earnings) {
    return <Card><CardContent role="alert" className="py-6 text-sm">
      {isEn ? 'Verified work earnings cannot be loaded right now. No payout is assumed.' : '원장 확인 보상 내역을 불러올 수 없습니다. 지급액을 임의로 추정하지 않습니다.'}
    </CardContent></Card>;
  }
  const label = (status: VerifiedWorkReceipt['settlement_status']) => {
    if (status === 'VERIFIED') return isEn ? 'Ledger verified' : '원장 확인';
    if (status === 'EXP_ONLY') return isEn ? 'EXP only (no WLD)' : 'EXP 전용 (WLD 없음)';
    return isEn ? 'WLD unverified — not counted' : 'WLD 미확인 — 합계 제외';
  };
  return <section aria-label={isEn ? 'Verified work reward receipts' : '원장 확인 업무 보상 영수증'} className="grid gap-4">
    <Card><CardContent className="grid gap-2 py-5">
      <p className="text-sm text-muted-foreground">{isEn ? 'Verified WLD from the latest up to 20 work receipts' : '최근 최대 20건의 업무 영수증 중 원장 확인된 WLD'}</p>
      <p className="break-all font-mono text-2xl font-bold">{groupDigits(earnings.verified_wld)} WLD</p>
      <p className="text-xs text-muted-foreground">{isEn
        ? `${earnings.verified_count} verified · ${earnings.exp_only_count} EXP only · ${earnings.unverified_count} unverified`
        : `원장 확인 ${earnings.verified_count}건 · EXP 전용 ${earnings.exp_only_count}건 · 미확인 ${earnings.unverified_count}건`}</p>
      <p className="text-xs text-muted-foreground">{isEn ? 'Not a lifetime total. Unverified receipts never count as paid.' : '전체 기간 누적액이 아닙니다. 원장 미확인 내역은 지급액에 포함하지 않습니다.'}</p>
    </CardContent></Card>
    {earnings.receipts.length === 0 ? <p role="status" className="text-sm text-muted-foreground">{isEn ? 'No recent work receipts.' : '최근 업무 영수증이 없습니다.'}</p> : (
      <ul className="grid gap-3">
        {earnings.receipts.map((receipt) => <li key={receipt.receipt_id} className="min-w-0 rounded-xl border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold break-words">{receipt.name}</h2>
            <span className="rounded-full border px-2 py-1 text-xs font-medium">{label(receipt.settlement_status)}</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{formatMoment(receipt.created_at)}</p>
          <p className="mt-1 break-all font-mono text-sm">{receipt.settlement_status === 'VERIFIED'
            ? `+${groupDigits(receipt.reward_amount)} WLD`
            : receipt.settlement_status === 'EXP_ONLY'
              ? (isEn ? '0 WLD (EXP-only receipt)' : '0 WLD (경험치 전용 영수증)')
              : (isEn ? `Unverified: ${groupDigits(receipt.reward_amount)} WLD claimed` : `미확인 청구액: ${groupDigits(receipt.reward_amount)} WLD`)}</p>
          <p className="text-xs text-muted-foreground">+{groupDigits(receipt.experience_amount)} EXP {isEn ? '(recorded)' : '(기록값)'}</p>
          {receipt.settlement_status === 'VERIFIED' && receipt.transaction_id && <p className="mt-2 break-all font-mono text-xs text-muted-foreground">{isEn ? 'Ledger transaction' : '원장 거래 ID'}: {receipt.transaction_id}</p>}
        </li>)}
      </ul>
    )}
  </section>;
}
