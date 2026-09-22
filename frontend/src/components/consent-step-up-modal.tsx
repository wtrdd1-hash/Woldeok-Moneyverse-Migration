'use client';

import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { submitConsent } from '@/app/login/actions';

interface ConsentStepUpModalProps {
  readonly termsVersion?: string;
  readonly privacyVersion?: string;
}

export function ConsentStepUpModal({
  termsVersion = '2026-09-02',
  privacyVersion = '2026-09-02',
}: ConsentStepUpModalProps) {
  const [open] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    formData.set('termsVersion', termsVersion);
    formData.set('privacyVersion', privacyVersion);
    formData.set('terms', 'on');
    formData.set('privacy', 'on');
    formData.set('age', 'on');

    try {
      const res = await submitConsent({ status: 'idle' }, formData);
      if (res?.status === 'error') {
        setErrorMsg(res.message);
        setIsSubmitting(false);
      } else {
        // 성공 시 페이지 새로고침하여 최신 권한으로 즉시 언락
        window.location.reload();
      }
    } catch {
      window.location.reload();
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-md border-border/80 bg-card/95 p-6 shadow-2xl backdrop-blur-md sm:rounded-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-2 text-left">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="size-6" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            필수 서비스 이용 동의 안내
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed [word-break:keep-all]">
            월덕 머니버스의 모든 기능(지갑 송금, 직업 보상, 가상 주식 거래소 등)을 안전하게 이용하기 위해 최신 약관 동의가 필요합니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2.5 rounded-xl border border-border/60 bg-muted/30 p-3.5 text-xs">
            <div className="flex items-start gap-2 text-foreground font-medium">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-500 mt-0.5" />
              <span>[필수] 만 14세 이상 이용 확인</span>
            </div>
            <div className="flex items-start gap-2 text-foreground font-medium">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-500 mt-0.5" />
              <span>[필수] 월덕 머니버스 서비스 이용약관 동의</span>
            </div>
            <div className="flex items-start gap-2 text-foreground font-medium">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-500 mt-0.5" />
              <span>[필수] 개인정보 수집 및 이용 동의</span>
            </div>
            <p className="border-t border-border/40 pt-2 text-[11px] text-muted-foreground leading-relaxed [word-break:keep-all]">
              ⚠️ 모든 WLD와 보상은 게임 내 가상 데이터이며, 실제 현금 거래나 환전은 제공되지 않습니다.
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
              <FileText className="size-3" /> 이용약관 전문 보기
            </a>
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
              <FileText className="size-3" /> 개인정보처리방침 보기
            </a>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 text-sm font-bold shadow-md active:scale-[0.98] transition-transform"
          >
            {isSubmitting ? '동의 처리 중...' : '모두 동의하고 머니버스 시작하기'}
            {!isSubmitting && <ArrowRight className="ml-1 size-4" />}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
