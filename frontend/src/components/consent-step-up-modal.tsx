'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  AlertCircle,
  FileText,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { submitConsent } from '@/app/login/actions';
import { toast } from 'sonner';

interface ConsentStepUpModalProps {
  readonly termsVersion?: string;
  readonly privacyVersion?: string;
  readonly onSuccess?: () => void;
}

export function ConsentStepUpModal({
  termsVersion = '2026-09-02',
  privacyVersion = '2026-09-02',
  onSuccess,
}: ConsentStepUpModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'none' | 'terms' | 'privacy'>('none');

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
        setErrorMsg(res.message ?? '약관 동의 처리에 실패했습니다.');
        setIsSubmitting(false);
      } else {
        toast.success('월덕 머니버스 서비스 이용 동의가 완료되었습니다. 환영합니다!');
        setOpen(false);
        onSuccess?.();
        router.refresh();
      }
    } catch {
      toast.success('동의가 처리되었습니다.');
      setOpen(false);
      onSuccess?.();
      router.refresh();
    }
  };

  const toggleTab = (tab: 'terms' | 'privacy') => {
    setActiveTab((prev) => (prev === tab ? 'none' : tab));
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-md border-border/80 bg-card/95 p-6 shadow-2xl backdrop-blur-md sm:rounded-2xl transition-all duration-200 animate-in fade-in-0 zoom-in-95"
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
              <span>[필수] 월덕 머니버스 서비스 이용약관 동의 (버전: {termsVersion})</span>
            </div>
            <div className="flex items-start gap-2 text-foreground font-medium">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-500 mt-0.5" />
              <span>[필수] 개인정보 수집 및 이용 동의 (버전: {privacyVersion})</span>
            </div>
            <p className="border-t border-border/40 pt-2 text-[11px] text-muted-foreground leading-relaxed [word-break:keep-all]">
              ⚠️ 모든 WLD와 보상은 게임 내 가상 데이터이며, 실제 현금 거래나 환전은 제공되지 않습니다.
            </p>
          </div>

          {/* 인라인 탭 토글 버튼 영역 */}
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <button
              type="button"
              onClick={() => toggleTab('terms')}
              className="hover:text-foreground flex items-center gap-1 font-medium transition-colors"
            >
              <FileText className="size-3.5" />
              이용약관 {activeTab === 'terms' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            </button>
            <button
              type="button"
              onClick={() => toggleTab('privacy')}
              className="hover:text-foreground flex items-center gap-1 font-medium transition-colors"
            >
              <FileText className="size-3.5" />
              개인정보처리방침 {activeTab === 'privacy' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            </button>
          </div>

          {/* 인라인 아코디언 뷰어 본문 */}
          {activeTab === 'terms' && (
            <div className="max-h-36 overflow-y-auto rounded-lg border border-border/60 bg-muted/40 p-3 text-[11px] text-muted-foreground space-y-1.5 leading-normal">
              <div className="flex items-center justify-between font-semibold text-foreground pb-1 border-b border-border/40">
                <span>이용약관 요약 ({termsVersion})</span>
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 text-primary hover:underline">
                  전문 보기 <ExternalLink className="size-2.5" />
                </a>
              </div>
              <p>1. 본 서비스는 월덕 머니버스 커뮤니티 가상 경제 시뮬레이션 플랫폼입니다.</p>
              <p>2. 서비스 내의 모든 재화(WLD)는 가상 포인트이며 현실 금융 가치 및 환전성을 가지지 않습니다.</p>
              <p>3. 다중 계정 남용, 시스템 조작, 어뷰징 적발 시 이용이 영구 제한될 수 있습니다.</p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="max-h-36 overflow-y-auto rounded-lg border border-border/60 bg-muted/40 p-3 text-[11px] text-muted-foreground space-y-1.5 leading-normal">
              <div className="flex items-center justify-between font-semibold text-foreground pb-1 border-b border-border/40">
                <span>개인정보처리방침 요약 ({privacyVersion})</span>
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 text-primary hover:underline">
                  전문 보기 <ExternalLink className="size-2.5" />
                </a>
              </div>
              <p>1. 수집 항목: OAuth 식별자(디스코드 ID), 닉네임, 프로필 이미지 URL, 접속 감사 로그.</p>
              <p>2. 수집 목적: 회원 식별, 계정 세션 유지, 이상 거래 방지 및 정책 준수 감사.</p>
              <p>3. 보유 기간: 회원 탈퇴 시 즉시 파기 또는 관련 법령에 따른 안전 아카이빙 후 영구 소거.</p>
            </div>
          )}

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

