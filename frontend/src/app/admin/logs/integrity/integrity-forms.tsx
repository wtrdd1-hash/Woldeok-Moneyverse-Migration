'use client';

import { useActionState, useState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { Badge } from '@/components/ui/badge';
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
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
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
import { StepUpField } from '../../step-up-field';
import type { ChainVerification } from '../../types';
import { recordAuditDisposition, setAuditRetention, verifyAuditChain } from '../actions';
import type { VerifyState } from '../actions';

/**
 * The three things an operator does to the trail itself: prove it has not
 * been edited, say how long it is kept, and record what was done with what
 * is past that.
 *
 * Only the last two carry a code. Verification changes nothing and discloses
 * nothing, and asking for a second factor before a read would teach the one
 * habit these dialogs exist to prevent — typing a code without reading what
 * it is for.
 */

/** A chain position is a bigint; the field takes digits and passes text. */
const SEQUENCE_FIELD = { inputMode: 'numeric', pattern: '[0-9]{1,18}' } as const;

export function VerifyChainForm() {
  // Explicit, because the counts travel in the state and `useActionState`
  // would otherwise infer its type from the shared IDLE.
  const [state, action] = useActionState<VerifyState, FormData>(verifyAuditChain, IDLE);

  return (
    <div className="grid gap-4">
      <form action={action} className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="verify-from">시작 순번</FieldLabel>
            <Input id="verify-from" name="fromSequence" autoComplete="off" {...SEQUENCE_FIELD} />
            <FieldDescription>비워 두면 사슬의 처음부터입니다.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="verify-to">끝 순번</FieldLabel>
            <Input id="verify-to" name="toSequence" autoComplete="off" {...SEQUENCE_FIELD} />
            <FieldDescription>비워 두면 마지막까지입니다. 한 번에 10만 행까지.</FieldDescription>
          </Field>
        </div>
        <SubmitButton className="w-fit">검증 실행</SubmitButton>
        <ActionAlert state={state} />
      </form>
      {state.result && <VerificationSummary result={state.result} />}
    </div>
  );
}

export function VerificationBadge({ status }: { readonly status: ChainVerification['status'] }) {
  return (
    <Badge
      variant={status === 'passed' ? 'secondary' : status === 'failed' ? 'destructive' : 'outline'}
    >
      {status === 'passed' ? '통과' : status === 'failed' ? '불일치' : '대상 없음'}
    </Badge>
  );
}

function VerificationSummary({ result }: { readonly result: ChainVerification }) {
  return (
    <div className="grid gap-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <VerificationBadge status={result.status} />
        <span className="tabular font-mono text-xs text-muted-foreground">
          {result.from_sequence} – {result.to_sequence}
        </span>
      </div>
      <dl className="grid gap-1 text-sm sm:grid-cols-2">
        <Count term="검사한 행" value={result.checked_count} />
        <Count term="사슬과 일치" value={result.verified_count} />
        <Count term="구버전 해시" value={result.legacy_count} />
        <Count term="내용 불일치" value={result.mismatch_count} alarm />
        <Count term="사슬 끊김" value={result.link_break_count} alarm />
        <Count term="컬럼 불일치" value={result.column_drift_count} alarm />
        {result.first_bad_sequence !== null && (
          <Count term="처음 어긋난 순번" value={result.first_bad_sequence} alarm />
        )}
      </dl>
      <p className="text-xs text-muted-foreground [word-break:keep-all]">
        구버전 해시는 062 이전에 기록된 행입니다. 당시 해시식이 작성자의 시간대에 의존해 지금
        그대로 재현되지 않을 수 있고, 위조와는 다릅니다. 실제 경고는 아래 셋입니다 — 사슬 끊김은
        행이 지워지거나 끼워 넣어졌다는 뜻, 내용 불일치는 본문이 고쳐졌다는 뜻, 컬럼 불일치는
        서명된 봉투는 두고 컬럼만 고쳐졌다는 뜻입니다.
      </p>
    </div>
  );
}

function Count({
  term,
  value,
  alarm = false,
}: {
  readonly term: string;
  readonly value: string;
  readonly alarm?: boolean;
}) {
  const raised = alarm && value !== '0';
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{term}</dt>
      <dd className={`tabular font-mono ${raised ? 'font-bold text-destructive' : ''}`}>{value}</dd>
    </div>
  );
}

/**
 * A new retention version for one category.
 *
 * Appended, never edited: the old version is the evidence of what was
 * promised while it was in force. What the dialog has to say out loud is
 * that the published privacy notice states these same periods, so changing
 * one here without changing that document makes the notice untrue.
 */
export function RetentionPolicyDialog({
  category,
  retentionDays,
}: {
  readonly category: string;
  readonly retentionDays: number;
}) {
  const [state, action] = useActionState(setAuditRetention, IDLE);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="min-h-11">
          보존 기간 변경
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={action} className="grid max-h-[70vh] gap-4 overflow-y-auto">
          <input type="hidden" name="category" value={category} />
          <DialogHeader>
            <DialogTitle>{category} 보존 정책</DialogTitle>
            <DialogDescription>
              지금 <b>{retentionDays}일</b>입니다. 기존 버전은 고치지 않고 새 버전을 덧붙입니다.
              공개된 개인정보처리방침이 같은 기간을 약속하고 있으므로, 바꾸면 그 문서도 함께
              고쳐야 합니다.
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor={`retention-days-${category}`}>보존 기간 (일)</FieldLabel>
            <Input
              id={`retention-days-${category}`}
              name="retentionDays"
              inputMode="numeric"
              pattern="[0-9]{1,4}"
              defaultValue={String(retentionDays)}
              required
            />
            <FieldDescription>1~3650일.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor={`retention-basis-${category}`}>법적 근거</FieldLabel>
            <Input
              id={`retention-basis-${category}`}
              name="legalBasis"
              maxLength={500}
              required
              autoComplete="off"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`retention-description-${category}`}>설명</FieldLabel>
            <Textarea
              id={`retention-description-${category}`}
              name="description"
              rows={2}
              maxLength={1000}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`retention-effective-${category}`}>적용 시각</FieldLabel>
            <Input
              id={`retention-effective-${category}`}
              name="effectiveAt"
              type="datetime-local"
            />
            <FieldDescription>비워 두면 즉시 적용합니다.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor={`retention-reason-${category}`}>변경 사유</FieldLabel>
            <Textarea
              id={`retention-reason-${category}`}
              name="reason"
              rows={3}
              minLength={10}
              maxLength={1000}
              required
            />
            <FieldDescription>10자 이상. 감사 기록에 그대로 남습니다.</FieldDescription>
          </Field>
          <StepUpField
            id={`retention-${category}`}
            undo={`같은 화면에서 ${retentionDays}일로 되돌리는 새 버전을 다시 추가합니다. 이미 지나간 기간은 되돌아오지 않습니다.`}
          />
          <ActionAlert state={state} />
          <DialogFooter>
            <SubmitButton>새 버전 추가</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const METHODS: readonly { readonly value: string; readonly label: string }[] = [
  { value: 'archived', label: 'archived — 다른 저장소로 옮겨 보관했습니다' },
  { value: 'destroyed', label: 'destroyed — 복구할 수 없게 파기했습니다' },
  { value: 'retained_on_hold', label: 'retained_on_hold — 사유가 있어 계속 보관합니다' },
];

/**
 * The record of what was decided about a range past its retention period.
 *
 * It records, it does not delete. The database will not let the application
 * remove an audit row at all, so this is a statement made by a person about
 * work done elsewhere — which is why the range and the reason are what it
 * asks for, and why an evidence hash is computed over the rows it names.
 */
export function DispositionForm({ categories }: { readonly categories: readonly string[] }) {
  const [state, action] = useActionState(recordAuditDisposition, IDLE);
  const [category, setCategory] = useState(categories[0] ?? '');
  const [method, setMethod] = useState('archived');

  return (
    <form action={action} className="grid gap-4">
      {/* Radix Select is not a native control, so both choices travel in
          hidden fields the way a <select name> would. */}
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="method" value={method} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="disposition-category">구분</FieldLabel>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="disposition-category" className="min-h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((entry) => (
                <SelectItem key={entry} value={entry}>
                  {entry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="disposition-method">처리 방법</FieldLabel>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger id="disposition-method" className="min-h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {METHODS.map((entry) => (
                <SelectItem key={entry.value} value={entry.value}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="disposition-from">시작 순번</FieldLabel>
          <Input
            id="disposition-from"
            name="fromSequence"
            autoComplete="off"
            required
            {...SEQUENCE_FIELD}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="disposition-to">끝 순번</FieldLabel>
          <Input
            id="disposition-to"
            name="toSequence"
            autoComplete="off"
            required
            {...SEQUENCE_FIELD}
          />
        </Field>
      </div>
      <Field>
        <FieldLabel htmlFor="disposition-note">비고</FieldLabel>
        <Textarea id="disposition-note" name="note" rows={2} maxLength={1000} />
        <FieldDescription>보관 위치나 파기 방식처럼 나중에 확인할 내용을 적습니다.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="disposition-reason">사유</FieldLabel>
        <Textarea
          id="disposition-reason"
          name="reason"
          rows={3}
          minLength={10}
          maxLength={1000}
          required
        />
        <FieldDescription>10자 이상. 감사 기록에 그대로 남습니다.</FieldDescription>
      </Field>
      <StepUpField
        id="disposition"
        undo="기록은 지울 수 없습니다. 잘못 적었다면 같은 구간에 대해 바로잡는 기록을 새로 남깁니다."
      />
      <SubmitButton className="w-fit">처리 기록 남기기</SubmitButton>
      <ActionAlert state={state} />
    </form>
  );
}
