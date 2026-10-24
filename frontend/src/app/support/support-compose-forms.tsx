'use client';

import { useActionState, useState } from 'react';
import { createSupportThread, replySupportThread } from './actions';

const initialState = { error: null };

export function NewSupportThreadForm({ idempotencyKey }: { readonly idempotencyKey: string }) {
  const [state, action, pending] = useActionState(createSupportThread, initialState);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  return (
    <form action={action} className="grid gap-3 rounded-2xl border bg-card p-4" aria-label="새 관리자 문의">
      <strong>새 문의</strong>
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} readOnly />
      <label htmlFor="support-subject" className="text-sm font-medium">문의 제목</label>
      <input id="support-subject" name="subject" value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={120} required placeholder="문의 제목" className="min-h-11 w-full rounded-xl border bg-background p-3" />
      <label htmlFor="support-body" className="text-sm font-medium">문의 내용</label>
      <textarea id="support-body" name="body" value={body} onChange={(event) => setBody(event.target.value)} maxLength={2000} required placeholder="문의 내용을 적어 주세요." className="min-h-28 w-full rounded-xl border bg-background p-3" />
      {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
      <button type="submit" disabled={pending} className="min-h-11 rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground disabled:opacity-60">
        {pending ? '접수 확인 중…' : '문의 시작'}
      </button>
    </form>
  );
}

export function SupportReplyForm({ threadId, idempotencyKey }: { readonly threadId: string; readonly idempotencyKey: string }) {
  const [state, action, pending] = useActionState(replySupportThread, initialState);
  const [body, setBody] = useState('');
  return (
    <form action={action} className="mt-4 grid min-w-0 gap-3 border-t pt-4 sm:grid-cols-[minmax(0,1fr)_auto]" aria-label="관리자 문의 답장">
      <input type="hidden" name="threadId" value={threadId} readOnly />
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} readOnly />
      <label htmlFor="support-reply" className="text-sm font-medium sm:col-span-2">답장 내용</label>
      <textarea id="support-reply" name="body" value={body} onChange={(event) => setBody(event.target.value)} maxLength={2000} required className="min-h-16 min-w-0 w-full rounded-xl border bg-background p-3" placeholder="답장 입력" />
      <button type="submit" disabled={pending} className="min-h-11 rounded-xl bg-primary px-5 font-bold text-primary-foreground disabled:opacity-60">
        {pending ? '전송 확인 중…' : '전송'}
      </button>
      {state.error && <p role="alert" className="text-sm text-destructive sm:col-span-2">{state.error}</p>}
    </form>
  );
}
