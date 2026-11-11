'use client';

import { useState } from 'react';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export function StepUpField({ id, undo }: { readonly id: string; readonly undo: string }) {
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleRequestOtp = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMsg('');
    try {
      const res = await fetch('/api/admin/auth/channel-otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionName: `관리자 변경 명령 (${id})` }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'OTP 발송에 실패했습니다.');
      }
      setSent(true);
      setMsg('텔레그램 및 디스코드로 6자리 OTP 코드가 전송되었습니다.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP 요청 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <FieldLabel htmlFor={`otp-code-${id}`} className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
            <ShieldCheck className="size-3.5 text-emerald-400" />
            관리자 2FA 승격 코드 (텔레그램 / 디스코드 OTP)
          </FieldLabel>
          <FieldDescription className="text-[11px] text-muted-foreground">
            중대 관리 명령 실행을 위해 텔레그램 또는 디스코드로 발송된 6자리 코드를 입력하세요.
          </FieldDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={handleRequestOtp}
          className="shrink-0 h-8 text-[11px] gap-1 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10"
        >
          {loading ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Send className="size-3" />
          )}
          {sent ? '재발송' : 'OTP 발송'}
        </Button>
      </div>

      <div className="relative">
        <Input
          id={`otp-code-${id}`}
          name="otpCode"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
          placeholder="6자리 숫자 입력 (예: 123456)"
          className="font-mono text-sm tracking-widest font-bold"
        />
      </div>

      {msg && (
        <p className="text-[11px] text-emerald-400 flex items-center gap-1">
          <CheckCircle2 className="size-3 shrink-0" /> {msg}
        </p>
      )}
      {error && (
        <p className="text-[11px] text-destructive flex items-center gap-1">
          <AlertCircle className="size-3 shrink-0" /> {error}
        </p>
      )}

      <Field>
        <FieldDescription className="text-[11px] text-muted-foreground/80">
          변경 전 영향과 복구 방법을 확인하세요. 되돌리기: {undo}
        </FieldDescription>
      </Field>
    </div>
  );
}
