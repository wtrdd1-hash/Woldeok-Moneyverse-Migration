'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/** Funded by the currently signed-in administrator's OWN verified cash balance. */
export function AdminTreasuryFundingCard() {
  const router = useRouter();
  const [amount, setAmount] = useState('1000');
  const [memo, setMemo] = useState('관리자 개인 보유금 국고 기부');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<{ledger_transaction_id:string;donated_amount_wld:string;vault_balance_after:string}|null>(null);
  const key = useRef<string|null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    if (!/^[1-9][0-9]{0,15}$/.test(amount) || BigInt(amount)>1000000000000000n) {
      setError('본인이 보유한 WLD 중 1 이상의 정수 금액만 투입할 수 있습니다.');return;
    }
    if (!window.confirm(`본인 지갑에서 ${BigInt(amount).toLocaleString('ko-KR')} WLD를 차감하여 국고에 기부하시겠습니까?`)) return;
    setPending(true);setError('');
    const requestKey=key.current ?? crypto.randomUUID();key.current=requestKey;
    try {
      const response=await fetch('/api/treasury/donate',{method:'POST',headers:{'content-type':'application/json'},
        body:JSON.stringify({amountWld:amount,memo,idempotencyKey:requestKey})});
      const data=await response.json().catch(()=>({}));
      if(!response.ok || data.success!==true || typeof data.ledger_transaction_id!=='string'
        || data.donated_amount_wld!==amount) throw new Error('본인 현금 부족 또는 국고 영수증 미검증. 같은 요청으로 다시 시도하세요.');
      setReceipt({ledger_transaction_id:data.ledger_transaction_id,donated_amount_wld:data.donated_amount_wld,vault_balance_after:data.vault_balance_after});
      key.current=null;router.refresh();
    } catch(cause) {setError(cause instanceof Error?cause.message:'국고 기부 내역을 확인하지 못했습니다.');}
    finally {setPending(false);}
  }

  return <Card className="border-emerald-500/20">
    <CardHeader><CardTitle className="text-base">관리자 개인 WLD → 국고 직접 투입</CardTitle>
      <CardDescription>로그인된 관리자 본인의 실제 현금 지갑을 차감합니다. 화폐를 새로 만들지 않으며 기존 정본 기부 원장·멱등 영수증을 사용합니다. 잔액보다 큰 금액은 거부됩니다.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      {receipt ? <div role="status" className="rounded-lg border border-emerald-500/40 p-3 text-sm">
        <p>{BigInt(receipt.donated_amount_wld).toLocaleString('ko-KR')} WLD 정본 기부 완료</p>
        <p className="text-xs break-all">원장: {receipt.ledger_transaction_id}</p>
        <p>국고 잔액: {BigInt(receipt.vault_balance_after).toLocaleString('ko-KR')} WLD</p>
        <Button type="button" variant="outline" className="mt-2" onClick={()=>{setReceipt(null);setAmount('1000');}}>새 기부</Button>
      </div> : <form className="grid gap-3 sm:grid-cols-2" onSubmit={submit}>
        <div><label htmlFor="admin-own-cash-amount" className="mb-1 block text-sm">내 돈에서 국고로 투입할 금액 (WLD)</label>
        <input id="admin-own-cash-amount" inputMode="numeric" value={amount} disabled={pending}
          onChange={e=>{setAmount(e.target.value.replace(/[^0-9]/g,''));key.current=null;setError('');}}
          className="w-full rounded-lg border border-input bg-background p-3" /></div>
        <div><label htmlFor="admin-own-cash-reason" className="mb-1 block text-sm">기부 사유</label>
        <input id="admin-own-cash-reason" value={memo} maxLength={300} disabled={pending}
          onChange={e=>{setMemo(e.target.value);key.current=null;setError('');}}
          className="w-full rounded-lg border border-input bg-background p-3" /></div>
        <Button type="submit" disabled={pending} className="min-h-11 sm:col-span-2">
          {pending ? '원장 확인 중…' : '내 실제 보유금 국고에 기부'}</Button>
      </form>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">신규 WLD를 발행하려면 같은 화면의 ‘조폐국’ 탭에서 별도 국고 발행 정책을 승인하세요. 개인 기부와 조폐국 발행은 서로 다른 거래입니다.</p>
    </CardContent>
  </Card>;
}
