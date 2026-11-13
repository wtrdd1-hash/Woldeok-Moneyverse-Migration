'use client';

import { useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AdminMintTopupDialog() {
  const [open, setOpen] = useState(false);
  const requestKey = useRef<string | null>(null);
  const [amountWld, setAmountWld] = useState('1000000');
  const [reason, setReason] = useState('통화정책 위원회 승인 국고 비상 유동성 즉시 보충');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  async function handleRequestOtp() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth/channel-otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionName: `조폐국 화폐발행 국고 즉시 충전 (${amountWld} WLD)` }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'OTP 발송에 실패했습니다.');
      }
      setOtpSent(true);
      setSuccessMsg('텔레그램 및 디스코드로 6자리 OTP 인증 코드가 발송되었습니다.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'OTP 요청 실패');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amountWld || !/^[1-9][0-9]{0,7}$/.test(amountWld) || Number(amountWld) > 10000000) {
      setError('발행 및 충전액은 1 ~ 10,000,000 WLD 사이의 정수여야 합니다.');
      return;
    }
    if (!reason || reason.trim().length < 5) {
      setError('발행 사유는 최소 5자 이상 작성해야 합니다.');
      return;
    }
    if (!otpCode || otpCode.trim().length !== 6) {
      setError('텔레그램/디스코드로 수신된 6자리 OTP 코드를 입력해 주세요.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const key = requestKey.current ?? crypto.randomUUID();
      requestKey.current = key;
      const res = await fetch('/api/admin/treasury/mint-topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountWld: amountWld.trim(),
          reason: reason.trim(),
          otpCode: otpCode.trim(),
          requestKey: key,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || data.message || '조폐국 국고 충전 처리에 실패했습니다.');
      }

      if (data.ok !== true || typeof data.result?.ledger_transaction_id !== 'string') {
        throw new Error('국고 충전 원장 영수증을 확인할 수 없습니다. 같은 요청으로 다시 확인하세요.');
      }
      requestKey.current = null;
      setSuccessMsg(`조폐국 국고 충전 완결! 전표 ID: ${data.result?.ledger_transaction_id || '기록됨'}`);
      if (typeof window !== 'undefined' && window.location) {
        // 성공 시 데이터 갱신
      }
      setTimeout(() => {
        setOpen(false);
        setOtpSent(false);
        setOtpCode('');
        setSuccessMsg('');
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '조폐국 국고 충전 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-9 border-amber-500/30 text-amber-600 hover:text-amber-700 hover:bg-amber-50/50">
          🏛️ 조폐국 화폐발행 국고 충전
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] max-w-[calc(100vw-2rem)] max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">조폐국 화폐발행 중앙 국고 즉시 충전</DialogTitle>
          <DialogDescription className="text-xs">
            조폐국(MINT) 통화발행 정책 주문을 단일 원자적 트랜잭션으로 생성 및 즉시 집행하여 중앙 국고(VAULT_MAIN) 잔액을 충전합니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-2">
          {error && <div className="p-2.5 bg-destructive/10 text-destructive rounded text-xs">{error}</div>}
          {successMsg && <div className="p-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs">{successMsg}</div>}

          <div>
            <Label htmlFor="mint-amount" className="text-xs">화폐발행 및 충전액 (WLD)</Label>
            <Input
              id="mint-amount"
              type="number"
              min="1"
              max="10000000"
              value={amountWld}
              onChange={(e) => setAmountWld(e.target.value)}
              className="mt-1 text-xs font-mono"
              required
            />
          </div>

          <div>
            <Label htmlFor="mint-reason" className="text-xs">통화발행 정책 사유</Label>
            <Input
              id="mint-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 text-xs"
              required
            />
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="mint-otp" className="text-xs font-semibold text-primary">
                🔐 관리자 2FA (디스코드/텔레그램 OTP)
              </Label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleRequestOtp}
                disabled={loading}
                className="text-[11px] h-7 px-2.5"
              >
                {otpSent ? '재발송 요청' : '📲 OTP 코드 발송'}
              </Button>
            </div>
            <Input
              id="mint-otp"
              placeholder="텔레그램/디스코드 발송 6자리 코드"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="text-xs font-mono tracking-widest text-center"
              required
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={loading}>
              취소
            </Button>
            <Button type="submit" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={loading}>
              {loading ? '처리 중…' : '화폐발행 승인 및 국고 직행 충전'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
