'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface AdminStepupOtpModalProps {
  readonly open?: boolean;
  readonly isOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly onClose?: () => void;
  readonly mode?: 'elevate' | 'verify';
  readonly actionName?: string;
  readonly onVerified?: (otpCode: string) => void | Promise<void>;
  readonly onSuccess?: (otpCode?: string) => void | Promise<void>;
  readonly title?: string;
  readonly description?: string;
}

export function AdminStepupOtpModal({
  open,
  isOpen,
  onOpenChange,
  onClose,
  mode = 'verify',
  actionName = '중대 관리자 작업 승인',
  onVerified,
  onSuccess,
  title = '🔐 관리자 2FA 채널 보안 인증',
  description = '관리자 텔레그램 봇 및 디스코드 채널로 발송된 6자리 일회용 OTP 코드를 입력해 주세요.',
}: AdminStepupOtpModalProps) {
  const isModalOpen = open ?? isOpen ?? false;

  const handleClose = useCallback(() => {
    onClose?.();
    onOpenChange?.(false);
  }, [onClose, onOpenChange]);

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5분
  const [canResendAfter, setCanResendAfter] = useState<number>(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // OTP 요청 발송
  const handleRequestOtp = useCallback(async () => {
    setRequesting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/auth/channel-otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionName }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'OTP 발송에 실패했습니다.');
      }
      setTimeLeft(300);
      setCanResendAfter(30);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP 요청 실패');
    } finally {
      setRequesting(false);
    }
  }, [actionName]);

  // 모달 오픈 시 자동 1회 발송 및 타이머 시작
  useEffect(() => {
    if (isModalOpen) {
      handleRequestOtp();
    }
  }, [isModalOpen, handleRequestOtp]);

  // 타이머 카운트다운
  useEffect(() => {
    if (!isModalOpen || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
      setCanResendAfter((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isModalOpen, timeLeft]);

  const handleSubmit = useCallback(async (fullCode: string) => {
    if (loading || fullCode.length !== 6) return;
    setLoading(true);
    setError(null);

    try {
      if (mode === 'elevate') {
        const res = await fetch('/api/admin/auth/channel-otp/elevate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otpCode: fullCode }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || '승격 인증에 실패했습니다.');
        }
      }

      // 콜백 호출
      if (onVerified) {
        await onVerified(fullCode);
      }
      if (onSuccess) {
        await onSuccess(fullCode);
      }
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증 처리 실패');
    } finally {
      setLoading(false);
    }
  }, [loading, mode, onVerified, onSuccess, handleClose]);

  // 6자리 완성 시 자동 제출
  useEffect(() => {
    const fullCode = digits.join('');
    if (fullCode.length === 6 && digits.every((d) => d.length === 1)) {
      handleSubmit(fullCode);
    }
  }, [digits, handleSubmit]);

  const handleDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '');
    if (!cleaned) {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      return;
    }

    // 일괄 붙여넣기 (예: 6자리 숫자 복사 후 붙여넣을 때)
    if (cleaned.length >= 6) {
      const split = cleaned.slice(0, 6).split('');
      setDigits(split);
      inputRefs.current[5]?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleaned[cleaned.length - 1] ?? '';
    setDigits(newDigits);

    // 다음 칸으로 자동 포커스
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '');
    if (paste.length >= 6) {
      const split = paste.slice(0, 6).split('');
      setDigits(split);
      inputRefs.current[5]?.focus();
    }
  };

  if (!isModalOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-border/80 bg-slate-950 p-6 shadow-2xl space-y-5 text-foreground">
        {/* 헤더 */}
        <div className="space-y-1.5 text-center">
          <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mb-1">
            <svg
              className="size-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold tracking-tight">{title}</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {/* 대상 작업 안내 배지 */}
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-3.5 py-2.5 text-center space-y-0.5">
          <span className="text-[11px] font-medium text-indigo-300">인증 대상 조작</span>
          <p className="text-xs font-bold text-foreground truncate">{actionName}</p>
        </div>

        {/* 6자리 핀패드 입력 박스 */}
        <div className="space-y-2">
          <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                disabled={loading || timeLeft <= 0}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="size-11 sm:size-12 rounded-xl border border-border/80 bg-slate-900/80 text-center font-mono text-lg font-bold text-foreground shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50 transition-all"
                autoComplete="off"
              />
            ))}
          </div>

          {/* 타이머 및 채널 안내 */}
          <div className="flex items-center justify-between text-[11px] px-1 text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className={`size-1.5 rounded-full ${timeLeft > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              유효 시간: <strong className={timeLeft <= 60 ? 'text-rose-400 font-mono' : 'font-mono'}>{timeFormatted}</strong>
            </span>
            <span className="text-muted-foreground/80">텔레그램 & 디스코드 발송</span>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive text-center font-medium animate-in fade-in">
            {error}
          </div>
        )}

        {/* 하단 액션 버튼 */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            disabled={loading || digits.join('').length !== 6 || timeLeft <= 0}
            onClick={() => handleSubmit(digits.join(''))}
            className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="size-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>인증 검증 중...</span>
              </>
            ) : (
              <span>인증 확인 및 승격</span>
            )}
          </button>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              disabled={loading || canResendAfter > 0 || requesting}
              onClick={handleRequestOtp}
              className="text-xs text-muted-foreground hover:text-indigo-400 disabled:text-muted-foreground/40 transition-colors"
            >
              {canResendAfter > 0 ? `재발송 가능 (${canResendAfter}s)` : '코드 다시 받기'}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleClose}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
