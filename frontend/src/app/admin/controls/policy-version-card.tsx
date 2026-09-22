'use client';

import React, { useState, useActionState } from 'react';
import { ShieldCheck, AlertCircle, FileText, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { publishConsentVersionAction } from './actions';
import type { ActionState } from '@/lib/action-state';

interface PolicyVersionCardProps {
  readonly currentTermsVersion: string;
  readonly currentPrivacyVersion: string;
  readonly isSuperadmin: boolean;
}

const REQUIRED_CONFIRM_TEXT = 'PUBLISH_NEW_POLICY_VERSION';

export function PolicyVersionCard({
  currentTermsVersion,
  currentPrivacyVersion,
  isSuperadmin,
}: PolicyVersionCardProps) {
  const [open, setOpen] = useState(false);
  const [termsInput, setTermsInput] = useState('');
  const [privacyInput, setPrivacyInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');
  const [confirmInput, setConfirmInput] = useState('');

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    async (prev, formData) => {
      const result = await publishConsentVersionAction(prev, formData);
      if (result.status === 'ok') {
        setOpen(false);
        setTermsInput('');
        setPrivacyInput('');
        setReasonInput('');
        setConfirmInput('');
      }
      return result;
    },
    { status: 'idle' },
  );

  return (
    <div className="rounded-xl border border-border/80 bg-card p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="size-4" />
            </span>
            <h3 className="font-semibold text-foreground text-sm">
              이용약관 & 개인정보처리방침 정본 버전
            </h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            서비스 전역에서 요구되는 법적 동의의 정본 버전입니다. 새 버전을 발행하면 미동의 유저에게 즉시 재동의가 요구됩니다.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <div className="text-muted-foreground text-[11px]">현재 활성 버전</div>
            <div className="font-mono font-bold text-foreground">
              약관: {currentTermsVersion} / 개인정보: {currentPrivacyVersion}
            </div>
          </div>

          {isSuperadmin && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setTermsInput(currentTermsVersion);
                setPrivacyInput(currentPrivacyVersion);
                setOpen(true);
              }}
              className="text-xs font-semibold h-9 shrink-0"
            >
              새 버전 개정
            </Button>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md border-border/80 bg-card p-6 shadow-2xl sm:rounded-2xl">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              법적 정책 신규 버전 발행 (2단계 확인)
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              ⚠️ 새로운 버전을 발행하면 모든 활성 회원에게 다음 접속 시 동의 팝업이 노출됩니다. 사유와 확인 문구를 신중히 입력해 주세요.
            </DialogDescription>
          </DialogHeader>

          <form action={formAction} className="mt-4 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-medium text-foreground">이용약관 버전</label>
                <input
                  name="termsVersion"
                  type="text"
                  value={termsInput}
                  onChange={(e) => setTermsInput(e.target.value)}
                  placeholder="예: 2026-09-22"
                  required
                  className="w-full h-9 rounded-lg border border-border bg-background px-3 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">개인정보처리방침 버전</label>
                <input
                  name="privacyVersion"
                  type="text"
                  value={privacyInput}
                  onChange={(e) => setPrivacyInput(e.target.value)}
                  placeholder="예: 2026-09-22"
                  required
                  className="w-full h-9 rounded-lg border border-border bg-background px-3 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-medium text-foreground">개정 사유 (최소 10자 이상, 감사 로그에 영구 기록)</label>
              <textarea
                name="reason"
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                placeholder="정책 개정 목적과 주요 변경 조항을 구체적으로 기재하세요."
                required
                rows={3}
                className="w-full rounded-lg border border-border bg-background p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
              />
            </div>

            <div className="space-y-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-amber-700 dark:text-amber-300">
              <label className="font-semibold block text-[11px]">
                2단계 확인 문구: 아래 텍스트를 정확히 입력하세요.
              </label>
              <div className="font-mono font-bold select-all bg-background/80 px-2 py-1 rounded border border-border text-[11px]">
                {REQUIRED_CONFIRM_TEXT}
              </div>
              <input
                name="confirmText"
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="위 문구를 그대로 입력"
                required
                className="w-full h-8 rounded border border-border bg-background px-2.5 font-mono text-xs mt-1"
              />
            </div>

            {state.status === 'error' && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>{state.message}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                취소
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isPending || confirmInput !== REQUIRED_CONFIRM_TEXT}
                className="font-bold"
              >
                {isPending ? '발행 중...' : '새 버전 즉시 발행'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
