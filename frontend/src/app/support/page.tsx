import type { Metadata } from 'next';
import Link from 'next/link';
import { apiOrNull } from '@/lib/api';
import { requireMember } from '@/lib/session';
import { randomUUID } from 'node:crypto';
import { NewSupportThreadForm, SupportReplyForm } from './support-compose-forms';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: '관리자 문의', robots: { index: false, follow: false } };

type Thread = { thread_id: string; subject: string; status: string; created_at: string; last_message_at: string };
type Message = { message_id: string; sender_kind: 'user'|'admin'; body: string; created_at: string };
const label: Record<string,string> = { open: '관리자 답변 대기', waiting_user: '내 답변 대기', resolved: '처리 완료' };

export default async function SupportPage({ searchParams }: { searchParams: Promise<{ thread?: string }> }) {
  await requireMember();
  const threadData = await apiOrNull<{ threads: Thread[] }>('/api/v1/support/threads');
  const available = Array.isArray(threadData?.threads);
  const threads = available ? threadData!.threads : [];
  const requested = (await searchParams).thread;
  const selected = requested ? threads.find((thread) => thread.thread_id === requested)?.thread_id : threads[0]?.thread_id;
  const invalidSelection = Boolean(requested && !selected);
  const messageData = selected
    ? await apiOrNull<{ messages: Message[] }>(`/api/v1/support/threads/${encodeURIComponent(selected)}/messages`)
    : null;
  const messages = Array.isArray(messageData?.messages) ? messageData.messages : [];
  const messagesAvailable = Array.isArray(messageData?.messages);
  const createKey = randomUUID();
  const replyKey = randomUUID();
  return <main data-page="support" className="mv-page mv-page--community mx-auto grid w-full max-w-5xl gap-5 p-4 md:grid-cols-[320px_1fr]">
    <section className="grid content-start gap-4">
      <div><h1 className="text-2xl font-black">관리자 문의</h1><p className="text-sm text-muted-foreground">관리자와 1:1로 대화합니다. 문의 내용과 답변은 처리 기록으로 저장됩니다.</p></div>
      {available ? <NewSupportThreadForm key={createKey} idempotencyKey={createKey} /> :
        <p role="alert" className="rounded-xl border p-4 text-sm">문의 목록을 확인하지 못했습니다. 새 문의 접수를 잠시 중단했습니다. 새로고침 후 다시 시도해 주세요.</p>}
      <div className="grid gap-2">{threads.map(t => <Link key={t.thread_id} href={`/support?thread=${t.thread_id}`} className={`rounded-xl border p-3 ${selected===t.thread_id?'bg-primary/10 border-primary':'bg-card'}`}>
        <div className="font-bold">{t.subject}</div><div className="text-xs text-muted-foreground">{label[t.status] ?? t.status}</div>
      </Link>)}</div>
    </section>
    <section className="flex min-h-[60vh] flex-col rounded-2xl border bg-card p-4">
      {invalidSelection ? <p role="alert" className="m-auto text-muted-foreground">선택한 문의를 확인할 수 없습니다. 내 문의 목록에서 다시 선택해 주세요.</p> :
      !selected ? <p className="m-auto text-muted-foreground">새 문의를 작성하면 관리자와 대화를 시작할 수 있습니다.</p> :
      !messagesAvailable ? <p role="alert" className="m-auto text-muted-foreground">대화 내용을 확인하지 못했습니다. 답장을 보내지 않았습니다. 새로고침 후 다시 시도해 주세요.</p> : <>
        <div className="flex-1 space-y-3 overflow-y-auto">{messages.map(m => <div key={m.message_id} className={`max-w-[85%] rounded-2xl p-3 ${m.sender_kind==='admin'?'bg-primary text-primary-foreground':'ml-auto bg-muted'}`}>
          <div className="mb-1 text-xs font-bold">{m.sender_kind==='admin'?'관리자':'나'}</div><p className="whitespace-pre-wrap break-words">{m.body}</p>
        </div>)}</div>
        <SupportReplyForm key={`${selected}-${replyKey}`} threadId={selected} idempotencyKey={replyKey} />
      </>}
    </section>
  </main>;
}
