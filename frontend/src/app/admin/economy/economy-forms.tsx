'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { AmountInput } from '@/components/amount-input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { IDLE } from '@/lib/action-state';
import { STAGES } from '@/app/progression/stages';
import { StepUpField } from '../step-up-field';
import {
  acknowledgeAlert,
  executeBulkPayout,
  previewBulkPayout,
  runAutoPolicy,
  setPolicyKnob,
} from './actions';
import type { BulkPayoutPreviewState, BulkPayoutReceiptState } from './actions';
import { knobRangeLabel, knobValueLabel, memberCount } from './economy';
import type { PolicyKnob } from './economy';
import { PreviewPanel } from './economy-parts';

/**
 * The economy console's controls.
 *
 * Three of the four cost a code typed immediately before the change, because
 * the API asks for one: a bulk payout, a hand-run of the adjustment engine
 * and a knob taken off automatic all sit behind `ReauthGuard` and
 * `SecondFactorGuard`. `ReasonedStepUp` is the reason field and the code
 * written once, with the sentence saying how to undo what is about to happen,
 * so no dialog here can quietly ship without them.
 *
 * Acknowledging an alert is the fourth and asks for a reason alone. It is not
 * an oversight: it changes one timestamp on one row, and training an operator
 * to reach for their authenticator before every button is how a code gets
 * typed without the dialog being read.
 */

/**
 * The mandatory reason, then the code and the way back.
 *
 * Shared with the control plane's dialogs in shape but written here rather
 * than imported from them: `StepUpField` is the console-wide piece, and the
 * reason field belongs to the commands that actually take a reason parameter
 * in SQL. A field that went nowhere would be worse than not asking.
 */
function ReasonedStepUp({
  id,
  undo,
}: {
  readonly id: string;
  /** How to reverse this change, in words the operator can act on. */
  readonly undo: string;
}) {
  return (
    <>
      <Field>
        <FieldLabel htmlFor={`reason-${id}`}>실행 사유</FieldLabel>
        <Textarea
          id={`reason-${id}`}
          name="reason"
          rows={3}
          minLength={10}
          maxLength={1000}
          required
        />
        <FieldDescription>10자 이상. 감사 기록에 그대로 남습니다.</FieldDescription>
      </Field>
      <StepUpField id={id} undo={undo} />
      {/* These three routes carry `ReauthGuard` as well as `SecondFactorGuard`,
          and a stale identity check answers 401 with a sentence about
          confirming who you are -- from a page that had nowhere to do it. */}
      <p className="text-xs text-muted-foreground [word-break:keep-all]">
        최근 15분 안의 본인 확인도 필요합니다.{' '}
        <Link href="/account" className="underline underline-offset-4">
          본인 확인하러 가기 →
        </Link>
      </p>
    </>
  );
}

/** Says an alert has been seen, and why that was the right call. */
export function AcknowledgeAlertDialog({ alertId }: { readonly alertId: string }) {
  const [state, action] = useActionState(acknowledgeAlert, IDLE);

  return (
    <div className="grid gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="min-h-11 w-fit">
            확인 처리
          </Button>
        </DialogTrigger>
        <DialogContent>
          <form action={action} className="grid gap-4">
            <input type="hidden" name="alertId" value={alertId} />
            <DialogHeader>
              <DialogTitle>알림 확인 처리</DialogTitle>
              <DialogDescription>
                알림은 지워지지 않고 확인한 사람과 시각이 함께 남습니다. 원인을 처리했다는 뜻이
                아니라, 사람이 읽었다는 기록입니다.
              </DialogDescription>
            </DialogHeader>
            <Field>
              <FieldLabel htmlFor={`ack-reason-${alertId}`}>확인 사유</FieldLabel>
              <Textarea
                id={`ack-reason-${alertId}`}
                name="reason"
                rows={3}
                minLength={10}
                maxLength={1000}
                required
              />
              <FieldDescription>10자 이상. 감사 기록에 그대로 남습니다.</FieldDescription>
            </Field>
            <DialogFooter>
              <SubmitButton>확인 처리</SubmitButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ActionAlert state={state} />
    </div>
  );
}

/**
 * The batch payout, in the order it has to happen: describe, count, confirm.
 *
 * The preview writes nothing and the confirmation carries back exactly what
 * the preview counted -- including the batch key the preview minted, because
 * 084 derives each member's payment key from it and a retry under a new key
 * would pay everybody twice. The confirm control cannot be reached before
 * there is something to confirm, which is the whole point: §14.9 asks for the
 * payable count in front of the operator, not in the receipt afterwards.
 */
export function BulkPayoutConsole() {
  // Typed explicitly: both actions return a state that carries more than a
  // message, and inference takes its shape from the initial value alone.
  const [preview, previewAction] = useActionState<BulkPayoutPreviewState, FormData>(
    previewBulkPayout,
    IDLE,
  );
  const [receipt, executeAction] = useActionState<BulkPayoutReceiptState, FormData>(
    executeBulkPayout,
    IDLE,
  );
  const [stage, setStage] = useState('all');

  const figures = preview.preview;
  const request = preview.request;
  const nobodyToPay = figures?.payable_count === '0';

  return (
    <div className="grid gap-5">
      <form action={previewAction} className="grid gap-4">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="payout-amount">1인당 지급액</FieldLabel>
            <AmountInput id="payout-amount" name="amount" required className="sm:max-w-xs" />
            <FieldDescription>1 ~ 1,000,000 WLD의 정수.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="payout-stage">성장 단계</FieldLabel>
            {/* Radix Select is not a native control, so the choice travels in
                a hidden field the way a <select name> would. */}
            <input type="hidden" name="stageCode" value={stage} />
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger id="payout-stage" className="min-h-11 w-full sm:max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 (단계 제한 없음)</SelectItem>
                {STAGES.map((entry) => (
                  <SelectItem key={entry.code} value={entry.code}>
                    {entry.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="payout-completions">최소 작업 완료 수</FieldLabel>
            <Input
              id="payout-completions"
              name="minWorkCompletions"
              inputMode="numeric"
              autoComplete="off"
              className="sm:max-w-xs"
            />
            <FieldDescription>비워 두면 작업 이력을 조건에 넣지 않습니다.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="payout-members">회원 ID 지정</FieldLabel>
            <Textarea
              id="payout-members"
              name="userIds"
              rows={3}
              className="font-mono text-[0.75rem]"
              placeholder="UUID를 줄바꿈이나 쉼표로 구분해 입력"
            />
            <FieldDescription>
              비워 두면 위 조건에 맞는 활동 회원 전체가 대상입니다. 최대 5,000명.
            </FieldDescription>
          </Field>
        </FieldGroup>
        <SubmitButton variant="outline" className="w-fit">
          지급 대상 미리 보기
        </SubmitButton>
        <ActionAlert state={preview} />
      </form>

      {figures && request ? (
        <div className="grid gap-4 rounded-[14px] border p-4">
          <p className="eyebrow">STEP 2 — CONFIRM</p>
          <PreviewPanel preview={figures} />

          <form action={executeAction} className="grid gap-4">
            {/* What is confirmed is what was counted: the batch key the
                preview minted, and the same filter it was counted with. */}
            <input type="hidden" name="batchKey" value={request.batchKey} />
            <input type="hidden" name="amount" value={String(request.amount)} />
            <input type="hidden" name="userIds" value={request.userIds.join(', ')} />
            <input
              type="hidden"
              name="minWorkCompletions"
              value={request.minWorkCompletions === null ? '' : String(request.minWorkCompletions)}
            />
            <input type="hidden" name="stageCode" value={request.stageCode ?? 'all'} />
            <ReasonedStepUp
              id="bulk-payout"
              undo="회원별로 반대 방향의 정정 거래를 올려야 합니다. 일괄 취소는 없습니다."
            />
            <SubmitButton variant="destructive" className="w-fit" disabled={nobodyToPay}>
              {nobodyToPay
                ? '지급할 대상이 없습니다'
                : `${memberCount(figures.payable_count)}에게 지급 실행`}
            </SubmitButton>
          </form>

          <ActionAlert state={receipt} />
          {receipt.receipt && (
            <Button asChild variant="outline" size="sm" className="w-fit">
              <Link href={`/admin/economy?payout=${receipt.receipt.payout_id}#payout-report`}>
                지급 보고서 보기 →
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground [word-break:keep-all]">
          조건을 입력하고 미리 보기를 눌러야 실행 버튼이 열립니다. 대상 수와 지급 불가 인원을 먼저
          확인해 주세요.
        </p>
      )}
    </div>
  );
}

/**
 * Runs the weekly adjustment now.
 *
 * The dialog says what the engine would do this minute rather than what it
 * does in general, because those differ every week and only one of them is
 * about to happen.
 */
export function RunAutoPolicyDialog({
  adjustmentCount,
  blocked,
}: {
  readonly adjustmentCount: number;
  /** True when the proposal already lists a reason the run will refuse. */
  readonly blocked: boolean;
}) {
  const [state, action] = useActionState(runAutoPolicy, IDLE);
  const applying = `${adjustmentCount}개 값을 바꾸는 새 정책 버전을 만들고 즉시 적용합니다.`;

  return (
    <div className="grid gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="min-h-11 w-fit">
            지금 실행
          </Button>
        </DialogTrigger>
        <DialogContent>
          <form action={action} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>자동 조정 지금 실행</DialogTitle>
              <DialogDescription>
                {blocked
                  ? '지금은 막힌 조건이 있어 값이 바뀌지 않습니다. 지켜보는 지표에 대한 알림만 남습니다.'
                  : `${applying} 상점 가격, 사업 운영비, 작업 보상 한도가 함께 바뀝니다.`}
              </DialogDescription>
            </DialogHeader>
            <ReasonedStepUp
              id="auto-policy-run"
              undo="기능 스위치·정책 버전 화면에서 이전 버전으로 되돌립니다."
            />
            <DialogFooter>
              <SubmitButton>지금 실행</SubmitButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ActionAlert state={state} />
    </div>
  );
}

/**
 * Takes one knob off automatic, or moves the range it may sit in.
 *
 * The bound fields start empty rather than filled with the current values. A
 * blank bound is left alone by 092, and pre-filling would make "pause this
 * knob" and "re-approve the range it already had" the same submission.
 */
export function KnobDialog({ knob }: { readonly knob: PolicyKnob }) {
  const [state, action] = useActionState(setPolicyKnob, IDLE);
  const [automatic, setAutomatic] = useState(knob.auto_adjustable ? 'on' : 'off');

  return (
    <div className="grid gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="min-h-11 w-fit">
            자동 조정 설정
          </Button>
        </DialogTrigger>
        <DialogContent>
          <form action={action} className="grid gap-4">
            <input type="hidden" name="knobKey" value={knob.knob_key} />
            <input type="hidden" name="unit" value={knob.unit} />
            <input type="hidden" name="autoAdjustable" value={automatic} />
            <DialogHeader>
              <DialogTitle>{knob.title}</DialogTitle>
              <DialogDescription>
                지금 값은 {knobValueLabel(knob.current_value, knob.unit)}, 허용 범위는{' '}
                {knobRangeLabel(knob)}입니다. 자동 조정을 끄면 이 항목만 엔진이 건드리지 않고,
                나머지 항목은 그대로 조정됩니다.
              </DialogDescription>
            </DialogHeader>
            <Field>
              <FieldLabel htmlFor={`knob-auto-${knob.knob_key}`}>자동 조정</FieldLabel>
              <Select value={automatic} onValueChange={setAutomatic}>
                <SelectTrigger id={`knob-auto-${knob.knob_key}`} className="min-h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="on">켜기 — 엔진이 이 항목을 조정합니다</SelectItem>
                  <SelectItem value="off">끄기 — 이 항목은 사람만 바꿉니다</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor={`knob-min-${knob.knob_key}`}>하한값</FieldLabel>
              <Input
                id={`knob-min-${knob.knob_key}`}
                name="minValue"
                inputMode="decimal"
                autoComplete="off"
                placeholder={knob.min_value}
              />
              <FieldDescription>비워 두면 지금 하한값을 그대로 둡니다.</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor={`knob-max-${knob.knob_key}`}>상한값</FieldLabel>
              <Input
                id={`knob-max-${knob.knob_key}`}
                name="maxValue"
                inputMode="decimal"
                autoComplete="off"
                placeholder={knob.max_value}
              />
              <FieldDescription>
                지금 값이 새 범위 밖이면 거절됩니다. 먼저 정책을 옮겨 주세요.
              </FieldDescription>
            </Field>
            <ReasonedStepUp
              id={`knob-${knob.knob_key}`}
              undo="같은 화면에서 이 항목의 자동 조정을 다시 켜거나 범위를 되돌립니다."
            />
            <DialogFooter>
              <SubmitButton>변경</SubmitButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ActionAlert state={state} />
    </div>
  );
}
