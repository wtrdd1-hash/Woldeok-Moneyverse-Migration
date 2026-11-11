'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface AdminStepupOtpModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly mode?: 'elevate' | 'verify';
  readonly actionName?: string;
  readonly onVerified: (otpCode: string) => void | Promise<void>;
  readonly title?: string;
  readonly description?: string;
}

export function AdminStepupOtpModal({
  open,
  onOpenChange,
  mode = 'verify',
  actionName = '중대 관리자 작업 승인',
  onVerified,
  title = '🔐 관리자 2FA 채널 보안 인증',
  description = '관리자 텔레그램 봇 및 디스코드 채널로 발송된 6자리 일회용 OTP 코드를 입력해 주세요.',
}: AdminStepupOtpModalProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5분
  const [canResendAfter, setCanResendAfter] = useState<number>(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // OTP 요청 발송
  const handleRequestOtp = async () => {
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
  };

  // 모달 오픈 시 자동 1회 발송 및 타이머 시작
  useEffect(() => {
    if (open) {
      handleRequestOtp();
    }
  }, [open]);

  // 타이머 카운트다운
  useEffect(() => {
    if (!open || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
      setCanResendAfter((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [open, timeLeft]);

  // 6자리 완성 시 자동 제출
  useEffect(() => {
    const fullCode = digits.join('');
    if (fullCode.length === 6 && digits.every((d) => d.length === 1)) {
      handleSubmit(fullCode);
    }
  }, [digits]);

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
    newDigits[index] = cleaned[cleaned.length - 1];
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
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '');
    if (pasteData.length > 0) {
      const split = pasteData.slice(0, 6).split('');
      const newDigits = [...digits];
      split.forEach((char, i) => {
        newDigits[i] = char;
      });
      setDigits(newDigits);
      const nextFocus = Math.min(split.length, 5);
      inputRefs.current[nextFocus]?.focus();
    }
  };

  const handleSubmit = async (codeToVerify?: string) => {
    const code = codeToVerify || digits.join('');
    if (code.length !== 6) {
      setError('6자리 숫자를 모두 입력해 주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === 'elevate') {
        const res = await fetch('/api/admin/auth/channel-otp/elevate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otpCode: code }),
        });
        const data = await res.json();
        if (!res.ok || !data.elevated) {
          throw new Error(data.error || 'OTP 코드가 일치하지 않거나 만료되었습니다.');
        }
      }

      await onVerified(code);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증 실패');
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-stepup-otp-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl text-slate-100 flex flex-col gap-5">
        {/* 헤더 */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                {mode === 'elevate' ? 'R2 SESSION ELEVATION' : 'R3 CRITICAL MUTATION'}
              </span>
            </div>
            <h3 id="admin-stepup-otp-title" className="text-lg font-bold text-slate-100 tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* 듀얼 채널 발송 표시 배지 */}
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium text-sky-400">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              Telegram
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1.5 font-medium text-indigo-400">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              Discord
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            동시 발송됨
          </span>
        </div>

        {/* 6자리 스마트 핀패드 입력 필드 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <label className="text-xs font-medium text-slate-400">6자리 일회용 인증 코드</label>
            <span
              className={`text-xs font-mono font-medium ${
                timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-amber-400'
              }`}
            >
              ⏱ {timerDisplay}
            </span>
          </div>

          <div className="flex items-center justify-center gap-2" onPaste={handlePaste}>
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
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={loading || timeLeft <= 0}
                className="w-11 h-13 text-center text-xl font-mono font-bold bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 disabled:opacity-40 transition-all shadow-inner"
              />
            ))}
          </div>

          {error && (
            <p className="text-xs text-red-400 font-medium px-1 flex items-center gap-1">
              ⚠️ {error}
            </p>
          )}
        </div>

        {/* 하단 버튼 바 */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            type="button"
            disabled={requesting || canResendAfter > 0}
            onClick={handleRequestOtp}
            className="text-xs text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:hover:text-slate-400 transition-colors font-medium flex items-center gap-1"
          >
            {canResendAfter > 0 ? `재발송 (${canResendAfter}초)` : '코드 다시 받기'}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              disabled={loading || digits.join('').length !== 6 || timeLeft <= 0}
              onClick={() => handleSubmit()}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-40 transition-all shadow-md flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  검증 중...
                </>
              ) : (
                '승인 확인'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
