'use client';

import { useActionState } from 'react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { IDLE } from '@/lib/action-state';
import { formatMoment } from '@/lib/money';
import { StepUpField } from '../step-up-field';
import { revealAuditEvent } from './actions';
import type { RevealState } from './actions';

/**
 * The unmasking control, one per row.
 *
 * A disclosure rather than a dialog because most rows are never opened: the
 * table is read thirty rows at a time and the question "what was the real
 * address" is asked of one of them. A dialog per row would also mount thirty
 * of them to answer a question about one.
 *
 * The reason field is not paperwork. `admin_reveal_audit_event` writes its
 * own audit row before it returns anything, so what is typed here is what
 * the next person reading the trail finds beside the fact that somebody
 * looked -- and there is no undoing that, which is what the step-up says.
 */
export function RevealDisclosure({
  auditId,
  sequence,
  children,
}: {
  readonly auditId: string;
  readonly sequence: string;
  /** The row's masked detail, rendered on the server above the form. */
  readonly children?: React.ReactNode;
}) {
  // The state carries the unmasked row as well as the outcome, and
  // `useActionState` infers it from the initial value -- which is the shared
  // IDLE, and says nothing about `revealed`.
  const [state, action] = useActionState<RevealState, FormData>(revealAuditEvent, IDLE);

  return (
    <details className="min-w-[280px] max-w-[480px] w-full rounded-xl border border-border/40 bg-surface/30 p-3">
      <summary className="cursor-pointer select-none text-xs font-bold text-primary hover:text-primary/90 marker:content-none flex items-center justify-between">
        상세 · 원본 보기
      </summary>
      <div className="grid gap-3 pt-3">
        {children}
        <form action={action} className="grid gap-3">
          <input type="hidden" name="auditId" value={auditId} />
          <Field>
            <FieldLabel htmlFor={`reveal-reason-${auditId}`} className="text-xs">
              열람 사유
            </FieldLabel>
            <Textarea
              id={`reveal-reason-${auditId}`}
              name="reason"
              rows={2}
              minLength={10}
              maxLength={1000}
              required
            />
            <FieldDescription>
              10자 이상. 순번 {sequence}의 주소와 세션 해시 원본을 봅니다.
            </FieldDescription>
          </Field>
          <StepUpField
            id={`reveal-${auditId}`}
            undo="열람은 되돌릴 수 없습니다. 누가 왜 보았는지가 새 감사 기록으로 남습니다."
          />
          <SubmitButton variant="outline" size="sm">
            원본 표시
          </SubmitButton>
          <ActionAlert state={state} />
        </form>
        {state.revealed && (
          <dl className="grid gap-1 rounded-md border border-dashed p-3 text-xs">
            <div className="flex items-baseline justify-between gap-2">
              <dt className="text-muted-foreground">시각</dt>
              <dd>{formatMoment(state.revealed.created_at)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <dt className="text-muted-foreground">IP 주소</dt>
              <dd className="font-mono break-all">{state.revealed.client_ip ?? '없음'}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <dt className="text-muted-foreground">세션 해시</dt>
              <dd className="font-mono break-all">{state.revealed.session_hash ?? '없음'}</dd>
            </div>
            <dt className="mt-1 text-muted-foreground">기록 내용</dt>
            <dd>
              <pre className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-[0.7rem]">
                {JSON.stringify(
                  { context: state.revealed.context, metadata: state.revealed.metadata },
                  null,
                  2,
                )}
              </pre>
            </dd>
          </dl>
        )}
      </div>
    </details>
  );
}
