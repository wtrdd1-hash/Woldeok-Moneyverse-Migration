'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { PolicyOrderSummary } from './mint-dialogs';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  activeOrders: PolicyOrderSummary[];
  frozen: boolean;
}

/** This operation creates actual canonical WLD and is NEVER a certificate-only run. */
export function TreasuryMintExecutionDialog({ isOpen, onClose, onSuccess, activeOrders, frozen }: Props) {
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState('100000');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<{ amount_wld: string; ledger_transaction_id: string; vault_after_wld: string } | null>(null);
  // A timeout must be retried with the SAME request key, never a second mint.
  const keyRef = useRef<string | null>(null);

  useEffect(() => {
    if (isOpen) { setOrderId(''); setError(''); setReceipt(null); keyRef.current = null; }
  }, [isOpen]);
  if (!isOpen) return null;
  const selected = activeOrders.find((item) => item.id === orderId) ?? activeOrders[0];
  const remaining = selected && /^\d+$/.test(selected.max_amount_wld) && /^\d+$/.test(selected.executed_amount_wld)
    ? BigInt(selected.max_amount_wld) - BigInt(selected.executed_amount_wld) : 0n;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (pending || !selected || frozen) { setError('발행 동결을 관리자 정책에서 해제하고 승인된 국고 발행 명령서를 선택해 주세요.'); return; }
    if (!/^[1-9][0-9]{0,7}$/.test(amount) || BigInt(amount) > 10000000n || BigInt(amount) > remaining) {
      setError('1~10,000,000 WLD, 승인 명령서 잔여 한도 이내만 발행할 수 있습니다.'); return;
    }
    if (!window.confirm(`신규 화폐 ${BigInt(amount).toLocaleString('ko-KR')} WLD를 정본 원장에 발행하고 국고에 직접 입금하시겠습니까?`)) return;
    setPending(true); setError('');
    const requestKey = keyRef.current ?? crypto.randomUUID();
    keyRef.current = requestKey;
    try {
      const response = await fetch('/api/admin/mint/treasury-issue', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ policy_order_id: selected.id, amount_wld: amount, request_key: requestKey }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success !== true || data.code !== 'TREASURY_MINT_SETTLED') {
        throw new Error(data.error ?? '정본 거래 영수증을 검증할 수 없습니다. 동일 요청으로 다시 시도하세요.');
      }
      setReceipt({amount_wld:data.amount_wld,ledger_transaction_id:data.ledger_transaction_id,vault_after_wld:data.vault_after_wld});
      keyRef.current = null;
      onSuccess();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '국고 입금 결과가 확인되지 않았습니다. 같은 요청으로 다시 시도하세요.');
    } finally { setPending(false); }
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="treasury-mint-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 p-3 sm:p-8">
      <div className="mx-auto my-8 w-full max-w-lg rounded-2xl border border-amber-500/30 bg-card p-5 shadow-xl space-y-4">
        <h3 id="treasury-mint-title" className="text-lg font-bold">조폐국 → 국고 정본 화폐 발행</h3>
        <p className="text-xs text-muted-foreground">승인된 TREASURY_ISSUANCE 한도 내에서 MINT·TREASURY 복식부기와 VAULT_MAIN 입금을 하나의 금융 거래로 기록합니다. 기존 주조 증명서 기록과는 별도 기능입니다.</p>
        {frozen && <p role="alert" className="rounded-lg border border-rose-600/40 p-3 text-sm text-rose-400">현재 화폐 발행이 동결되어 있습니다. 명시적으로 관리자 동결을 해제하기 전에는 집행할 수 없습니다.</p>}
        {error && <p role="alert" className="rounded-lg border border-destructive/40 p-3 text-sm text-destructive">{error}</p>}
        {receipt ? (
          <div role="status" className="space-y-2 rounded-lg border border-emerald-500/40 p-3 text-sm">
            <p className="font-bold">정본 국고 발행 완료: {BigInt(receipt.amount_wld).toLocaleString('ko-KR')} WLD</p>
            <p>국고 금고 잔액: {BigInt(receipt.vault_after_wld).toLocaleString('ko-KR')} WLD</p>
            <p className="break-all text-xs">원장 거래 ID: {receipt.ledger_transaction_id}</p>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={submit}>
            <label className="block text-sm font-medium" htmlFor="treasury-mint-policy">승인된 국고 발행 명령서</label>
            <select id="treasury-mint-policy" value={selected?.id ?? ''} disabled={pending || frozen}
              onChange={(e) => {setOrderId(e.target.value);setError('');keyRef.current=null;}}
              className="w-full min-w-0 rounded-lg border border-input bg-background p-3 text-sm">
              {activeOrders.length === 0 && <option value="">승인·미소진 TREASURY_ISSUANCE 명령 없음</option>}
              {activeOrders.map((o) => <option value={o.id} key={o.id}>
                잔여 {(BigInt(o.max_amount_wld)-BigInt(o.executed_amount_wld)).toLocaleString('ko-KR')} WLD
              </option>)}
            </select>
            <label className="block text-sm font-medium" htmlFor="treasury-mint-amount">신규 발행액 (WLD, 1회 최대 1천만)</label>
            <input id="treasury-mint-amount" inputMode="numeric" value={amount} disabled={pending || frozen}
              onChange={(e) => {setAmount(e.target.value.replace(/[^0-9]/g,''));setError('');keyRef.current=null;}}
              className="w-full rounded-lg border border-input bg-background p-3 text-base" />
            <Button type="submit" disabled={pending || frozen || !selected} className="w-full min-h-11">
              {pending ? '정본 국고 발행 검증 중…' : '승인된 새 화폐를 국고에 발행·입금'}
            </Button>
          </form>
        )}
        <Button type="button" variant="outline" className="w-full min-h-11" disabled={pending} onClick={onClose}>닫기</Button>
      </div>
    </div>
  );
}
