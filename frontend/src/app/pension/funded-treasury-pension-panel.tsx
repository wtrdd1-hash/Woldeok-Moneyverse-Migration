'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { groupDigits } from '@/lib/money';

interface Position {
  funded_principal_wld: string;
  cumulative_funded_contribution_wld: string;
  escrow_balance_wld: string;
  certified_receipt_count: string;
}
interface Receipt {
  ledger_transaction_id: string;
  principal_wld: string;
  user_disbursement_wld: string;
  welfare_fee_wld: string;
  fund_balance_wld: string;
  replayed: boolean;
}
const exact = (s: string) => /^(?:0|[1-9][0-9]{0,79})$/.test(s);
const readable = (s: string) => exact(s) ? groupDigits(s) : '—';

export function FundedTreasuryPensionPanel() {
  const [position, setPosition] = useState<Position | null>(null);
  const [status, setStatus] = useState<'loading'|'verified'|'unavailable'>('loading');
  const [amount, setAmount] = useState('1000');
  const [busy, setBusy] = useState(false);
  const pendingFund = useRef<{ amount: string; key: string } | null>(null);
  const pendingWithdraw = useRef<{ amount: string; key: string } | null>(null);

  async function refresh() {
    try {
      const response = await fetch('/api/pension/funded/position', { cache: 'no-store' });
      if (!response.ok) throw new Error('uncertified');
      const data = await response.json() as Position;
      if (!exact(data.funded_principal_wld)
        || !exact(data.cumulative_funded_contribution_wld)
        || !exact(data.escrow_balance_wld)
        || !exact(data.certified_receipt_count)) throw new Error('invalid funded position');
      setPosition(data);
      setStatus('verified');
    } catch {
      setPosition(null);
      setStatus('unavailable');
    }
  }
  useEffect(() => { void refresh(); }, []);

  async function submit(command: 'contribute'|'withdraw') {
    if (!position || busy) return;
    const principal = command === 'contribute' ? amount.trim() : position.funded_principal_wld;
    if (!exact(principal) || (command === 'contribute' && BigInt(principal) < 1000n)
      || BigInt(principal) === 0n) {
      toast.error('정확한 1,000 WLD 이상 납입금 또는 실제 신규 적립금이 필요합니다.');
      return;
    }
    const pending = command === 'contribute' ? pendingFund : pendingWithdraw;
    if (!pending.current || pending.current.amount !== principal) {
      pending.current = { amount: principal, key: crypto.randomUUID() };
    }
    setBusy(true);
    try {
      const response = await fetch('/api/pension/funded/' + command, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          idempotencyKey: pending.current.key,
          [command === 'contribute' ? 'amountWld' : 'principalWld']: principal,
        }),
      });
      const result = await response.json() as Receipt & { error?: string };
      if (!response.ok || !result.ledger_transaction_id
        || !/^[0-9a-f-]{36}$/i.test(result.ledger_transaction_id)) {
        throw new Error(result.error || '정식 원장 영수증 확인 실패');
      }
      pending.current = null;
      toast.success(command === 'contribute'
        ? '정식 원장과 연금 에스크로에 납입이 기록되었습니다.'
        : `신규 적립금에서 ${readable(result.user_disbursement_wld)} WLD가 환급됐습니다.`);
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '정식 원장 처리에 실패했습니다.');
      // Keep the original idempotency key for a safe retry.
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="moneyverse-card border-emerald-500/25">
      <CardHeader>
        <CardTitle>국고 코어 · 신규 원장 증빙 연금</CardTitle>
        <p className="text-sm text-muted-foreground">
          과거 연금 238건의 미정산 지급 기록과 분리된 신규 에스크로입니다.
          신규 자금만 복식분개·멱등 영수증으로 납입·환급하며, 정기 지급과 국가발권은 별도 승인이 필요합니다.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {status !== 'verified' || !position ? (
          <p role="status" className="text-amber-400">
            {status === 'loading' ? '원장 증빙 조회 중' : '국고 코어 원장 증빙 미확인 — 납입 및 환급 중단'}
          </p>
        ) : (
          <>
            <div role="status" className="text-sm text-emerald-400">
              정식 원장 에스크로 조회 완료 · 증빙 영수증 {readable(position.certified_receipt_count)}건
            </div>
            <div className="grid gap-2 sm:grid-cols-2 text-sm">
              <p>내 신규 정식 적립 원금 <strong>{readable(position.funded_principal_wld)} WLD</strong></p>
              <p>신규 연금 에스크로 전체 <strong>{readable(position.escrow_balance_wld)} WLD</strong></p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Input aria-label="신규 적립금 납입 WLD" value={amount} onChange={e => {
                setAmount(e.target.value); pendingFund.current = null;
              }} className="max-w-40" inputMode="numeric" />
              <Button disabled={busy || status !== 'verified'} onClick={() => void submit('contribute')}>증빙 납입</Button>
              <Button variant="outline" disabled={busy || position.funded_principal_wld === '0'}
                onClick={() => void submit('withdraw')}>신규 적립금 환급 (95%)</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              환급 시 원금의 95%는 회원 지갑, 5%는 실제 별도 복지 에스크로에 보관됩니다.
              기존 미검증 연금 잔액에는 적용되지 않습니다.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
