'use client';

import { useState, useActionState, useEffect } from 'react';
import { ShieldCheck, ShieldX, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { actionChatReport } from './actions';
import type { ChatReportItem } from './chat-report-evidence-dialog';
import type { ActionState } from '@/lib/action-state';

const initialState: ActionState = { status: 'idle' };

export function ChatReportActionDialog({ item }: { item: ChatReportItem }) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<'ACTIONED_BLOCKED' | 'ACTIONED_WARNED' | 'REJECTED'>('ACTIONED_WARNED');
  const [state, formAction, isPending] = useActionState(actionChatReport, initialState);

  useEffect(() => {
    if (state.status === 'ok') {
      const timer = setTimeout(() => {
        setOpen(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.status]);

  const isClosed = item.status !== 'SUBMITTED';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isClosed ? 'outline' : 'default'}
          size="sm"
          className="h-8 text-xs font-semibold"
        >
          {isClosed ? '조치 변경' : '심사 및 조치'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <ShieldAlertIcon action={action} />
            신고 심사 및 조치 결정
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            피신고자 <span className="font-semibold text-destructive">{item.reported_nickname}</span>(@{item.reported_username})에 대한 모더레이션 조치를 선택하고 영구 감사 사유를 입력합니다.
          </DialogDescription>
        </DialogHeader>

        {state.status === 'ok' ? (
          <div className="py-6 flex flex-col items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-8" />
            <p className="text-sm font-semibold">{state.message}</p>
          </div>
        ) : (
          <form action={formAction} className="space-y-4 pt-1">
            <input type="hidden" name="reportId" value={item.report_id} />
            <input type="hidden" name="action" value={action} />

            {state.status === 'error' && (
              <div className="p-2.5 rounded bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
                <AlertTriangle className="size-4 shrink-0" />
                <span>{state.message}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs font-medium">조치 유형 선택</Label>
              <RadioGroup
                value={action}
                onValueChange={(v) => setAction(v as typeof action)}
                className="grid gap-2"
              >
                <label
                  htmlFor="r-warn"
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    action === 'ACTIONED_WARNED'
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <RadioGroupItem value="ACTIONED_WARNED" id="r-warn" className="mt-0.5" />
                  <div className="grid gap-0.5 text-xs">
                    <span className="font-semibold text-foreground">공식 경고 발송 (Warned)</span>
                    <span className="text-muted-foreground">경미한 위반 시 이용자에게 주의 및 경고를 부여합니다.</span>
                  </div>
                </label>

                <label
                  htmlFor="r-block"
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    action === 'ACTIONED_BLOCKED'
                      ? 'border-destructive bg-destructive/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <RadioGroupItem value="ACTIONED_BLOCKED" id="r-block" className="mt-0.5" />
                  <div className="grid gap-0.5 text-xs">
                    <span className="font-semibold text-destructive">피신고자 계정 제재 / 차단 (Blocked)</span>
                    <span className="text-muted-foreground">악의적 괴롭힘/사기 행위로 인정되어 즉시 이용을 제한합니다.</span>
                  </div>
                </label>

                <label
                  htmlFor="r-reject"
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    action === 'REJECTED'
                      ? 'border-muted-foreground bg-muted/30'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <RadioGroupItem value="REJECTED" id="r-reject" className="mt-0.5" />
                  <div className="grid gap-0.5 text-xs">
                    <span className="font-semibold text-foreground">신고 기각 / 무혐의 (Dismissed)</span>
                    <span className="text-muted-foreground">증거 검토 결과 규정 위반이 확인되지 않아 종결 처리합니다.</span>
                  </div>
                </label>
              </RadioGroup>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="note" className="text-xs font-medium">
                조치 사유 및 관리자 감사 메모 (필수)
              </Label>
              <Textarea
                id="note"
                name="note"
                required
                minLength={2}
                maxLength={500}
                placeholder="조치를 결정한 구체적인 사유를 입력하세요. (감사 원장에 영구 기록됩니다)"
                className="text-xs resize-none h-20"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                취소
              </Button>
              <Button
                type="submit"
                size="sm"
                variant={action === 'ACTIONED_BLOCKED' ? 'destructive' : 'default'}
                disabled={isPending}
              >
                {isPending ? '처리 중...' : '조치 확정 및 기록'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ShieldAlertIcon({ action }: { action: string }) {
  switch (action) {
    case 'ACTIONED_BLOCKED':
      return <ShieldX className="size-4 text-destructive" />;
    case 'ACTIONED_WARNED':
      return <AlertTriangle className="size-4 text-amber-500" />;
    default:
      return <ShieldCheck className="size-4 text-emerald-500" />;
  }
}
