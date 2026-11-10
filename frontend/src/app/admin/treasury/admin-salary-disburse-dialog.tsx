'use client';

import { useState } from 'react';
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

export function AdminSalaryDisburseDialog() {
  const [open, setOpen] = useState(false);
  const [targetAdminId, setTargetAdminId] = useState('');
  const [amountWld, setAmountWld] = useState('100000');
  const [reason, setReason] = useState('시스템 운영 및 금융 관제 기여 정기 임금');
  const [otpCode, setOtpCode] = useState('');
  const [requestKey, setRequestKey] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  async function handleRequestOtp() {
    setError('');
    setSuccessMsg('');
    setOtpSent(false);
    setOtpCode('');
    if (!targetAdminId.trim() || !/^[1-9][0-9]{0,7}$/.test(amountWld) || Number(amountWld) > 5_000_000 || reason.trim().length < 5) {
      setError('수령 관리자 UUID, 유효한 지급액 및 5자 이상의 사유를 입력해 주세요.');
      return;
    }
    setLoading(true);
    const nextKey = requestKey || crypto.randomUUID();
    setRequestKey(nextKey);
    try {
      const res = await fetch('/api/admin/auth/channel-otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'treasury_salary_disburse', amountWld: amountWld.trim(), reason: reason.trim(), targetAdminId: targetAdminId.trim(), requestKey: nextKey }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success !== true) {
        throw new Error(data.error || data.message || 'OTP 발송에 실패했습니다.');
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
    if (!targetAdminId) {
      setError('수령할 관리자 ID(UUID)를 입력해 주세요.');
      return;
    }
    if (!amountWld || !/^[1-9][0-9]{0,7}$/.test(amountWld) || Number(amountWld) > 5000000) {
      setError('지급액은 1 ~ 5,000,000 WLD 사이의 정수여야 합니다.');
      return;
    }
    if (!reason || reason.trim().length < 5) {
      setError('지급 사유는 최소 5자 이상 작성해야 합니다.');
      return;
    }
    if (!otpSent || !requestKey) {
      setError('먼저 현재 수령인, 금액과 사유에 대한 OTP 코드를 발급받아 주세요.');
      return;
    }
    if (!/^[0-9]{6}$/.test(otpCode.trim())) {
      setError('텔레그램/디스코드로 수신된 6자리 OTP 코드를 입력해 주세요.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/admin/treasury/salary/disburse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetAdminId: targetAdminId.trim(),
          amountWld: amountWld.trim(),
          reason: reason.trim(),
          otpCode: otpCode.trim(),
          requestKey,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || data.message || '관리자 임금 지급 처리에 실패했습니다.');
      }

      setSuccessMsg(`임금 지급 완결! 전표 ID: ${data.result?.ledger_transaction_id || '기록됨'}`);
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
      setError(err instanceof Error ? err.message : '임금 지급 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-9 border-emerald-500/30 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/50">
          💼 관리자 임금 지급
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] max-w-[calc(100vw-2rem)] max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">국고 관리자 임금 복식부기 실지급</DialogTitle>
          <DialogDescription className="text-xs">
            중앙 국고(VAULT_MAIN)에서 관리자의 실제 현금 계좌(USER_CASH)로 복식부기 전표를 발행하여 임금을 실지급합니다. 30% 안전 비축금을 초과할 수 없습니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-2">
          {error && <div className="p-2.5 bg-destructive/10 text-destructive rounded text-xs">{error}</div>}
          {successMsg && <div className="p-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs">{successMsg}</div>}

          <div>
            <Label htmlFor="target-admin-id" className="text-xs">수령 관리자 ID (UUID)</Label>
            <Input
              id="target-admin-id"
              placeholder="예: 5f7b8b44-e4aa-40b8-b93a-800ec0151d20"
              value={targetAdminId}
              onChange={(e) => { setTargetAdminId(e.target.value); setOtpSent(false); setOtpCode(''); setRequestKey(''); }}
              className="mt-1 text-xs"
              required
            />
          </div>

          <div>
            <Label htmlFor="salary-amount" className="text-xs">임금 지급액 (WLD)</Label>
            <Input
              id="salary-amount"
              type="number"
              min="1"
              max="5000000"
              value={amountWld}
              onChange={(e) => { setAmountWld(e.target.value); setOtpSent(false); setOtpCode(''); setRequestKey(''); }}
              className="mt-1 text-xs font-mono"
              required
            />
          </div>

          <div>
            <Label htmlFor="salary-reason" className="text-xs">지급 사유</Label>
            <Input
              id="salary-reason"
              value={reason}
              onChange={(e) => { setReason(e.target.value); setOtpSent(false); setOtpCode(''); setRequestKey(''); }}
              className="mt-1 text-xs"
              required
            />
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="salary-otp" className="text-xs font-semibold text-primary">
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
              id="salary-otp"
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
            <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
              {loading ? '처리 중…' : '임금 복식부기 실지급 집행'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
