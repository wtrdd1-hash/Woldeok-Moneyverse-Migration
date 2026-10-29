'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { SubmitButton } from '@/components/action-form';
import type { SupportActionState } from './actions';
import { createSupportThread, replySupportThread } from './actions';

const IDLE_SUPPORT: SupportActionState = { status: 'idle' };

function Outcome({ state }: { readonly state: { status: string; message?: string } }) {
  if (state.status === 'idle' || !state.message) return null;
  return <p role="status" aria-live="polite" className={state.status === 'error' ? 'text-sm text-destructive' : 'text-sm text-emerald-700 dark:text-emerald-300'}>{state.message}</p>;
}

export function NewSupportThreadForm() {
  const [state, action] = useActionState(createSupportThread, IDLE_SUPPORT);
  return <form action={action} className="grid gap-2 rounded-2xl border bg-card p-4">
    <strong>새 문의</strong>
    <label htmlFor="support-subject" className="text-sm font-medium">문의 제목</label>
    <input id="support-subject" name="subject" maxLength={120} required className="rounded-xl border bg-background p-3" />
    <label htmlFor="support-body" className="text-sm font-medium">문의 내용</label>
    <textarea id="support-body" name="body" maxLength={2000} required className="min-h-28 rounded-xl border bg-background p-3" />
    <SubmitButton className="w-full">문의 시작</SubmitButton>
    <Outcome state={state} />
    {state.status === 'ok' && state.threadId && <Link href={`/support?thread=${encodeURIComponent(state.threadId)}`} className="underline underline-offset-2">저장된 문의 열기</Link>}
  </form>;
}

export function SupportReplyForm({ threadId }: { readonly threadId: string }) {
  const [state, action] = useActionState(replySupportThread, IDLE_SUPPORT);
  return <form action={action} className="mt-4 grid gap-2 border-t pt-4">
    <input type="hidden" name="threadId" value={threadId} />
    <label htmlFor="support-reply" className="text-sm font-medium">답장 내용</label>
    <div className="flex flex-col gap-2 sm:flex-row">
      <textarea id="support-reply" name="body" maxLength={2000} required className="min-h-16 min-w-0 flex-1 rounded-xl border bg-background p-3" />
      <SubmitButton className="min-h-11 sm:self-end">전송</SubmitButton>
    </div>
    <Outcome state={state} />
  </form>;
}
