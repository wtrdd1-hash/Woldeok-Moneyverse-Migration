import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';
import { requireMember } from '@/lib/session';
import { createSupportThread, replySupportThread } from './actions';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: '관리자 문의', robots: { index: false, follow: false } };

type Thread = { thread_id: string; subject: string; status: string; created_at: string; last_message_at: string };
type Message = { message_id: string; sender_kind: 'user'|'admin'; body: string; created_at: string };
const label: Record<string,string> = { open: '관리자 답변 대기', waiting_user: '내 답변 대기', resolved: '처리 완료' };

export default async function SupportPage({ searchParams }: { searchParams: Promise<{ thread?: string }> }) {
  await requireMember();
  const { threads } = await api<{ threads: Thread[] }>('/api/v1/support/threads');
  const selected = (await searchParams).thread ?? threads[0]?.thread_id;
  const messages = selected
    ? (await api<{ messages: Message[] }>(`/api/v1/support/threads/${encodeURIComponent(selected)}/messages`)).messages
    : [];
  return <main data-page="support" className="mv-page mv-page--community mx-auto grid w-full max-w-5xl gap-5 p-4 md:grid-cols-[320px_1fr]">
    <section className="grid content-start gap-4">
      <div><h1 className="text-2xl font-black">관리자 문의</h1><p className="text-sm text-muted-foreground">관리자와 1:1로 대화합니다. 문의 내용과 답변은 처리 기록으로 저장됩니다.</p></div>
      <form action={createSupportThread} className="grid gap-2 rounded-2xl border bg-card p-4">
        <strong>새 문의</strong><input name="subject" maxLength={120} required placeholder="문의 제목" className="rounded-xl border bg-background p-3" />
        <textarea name="body" maxLength={2000} required placeholder="문의 내용을 적어 주세요." className="min-h-28 rounded-xl border bg-background p-3" />
        <button className="rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground">문의 시작</button>
      </form>
      <div className="grid gap-2">{threads.map(t => <Link key={t.thread_id} href={`/support?thread=${t.thread_id}`} className={`rounded-xl border p-3 ${selected===t.thread_id?'bg-primary/10 border-primary':'bg-card'}`}>
        <div className="font-bold">{t.subject}</div><div className="text-xs text-muted-foreground">{label[t.status] ?? t.status}</div>
      </Link>)}</div>
    </section>
    <section className="flex min-h-[60vh] flex-col rounded-2xl border bg-card p-4">
      {!selected ? <p className="m-auto text-muted-foreground">새 문의를 작성하면 관리자와 대화를 시작할 수 있습니다.</p> : <>
        <div className="flex-1 space-y-3 overflow-y-auto">{messages.map(m => <div key={m.message_id} className={`max-w-[85%] rounded-2xl p-3 ${m.sender_kind==='admin'?'bg-primary text-primary-foreground':'ml-auto bg-muted'}`}>
          <div className="mb-1 text-xs font-bold">{m.sender_kind==='admin'?'관리자':'나'}</div><p className="whitespace-pre-wrap break-words">{m.body}</p>
        </div>)}</div>
        <form action={replySupportThread} className="mt-4 flex gap-2 border-t pt-4"><input type="hidden" name="threadId" value={selected}/><textarea name="body" maxLength={2000} required className="min-h-16 flex-1 rounded-xl border bg-background p-3" placeholder="답장 입력"/><button className="rounded-xl bg-primary px-5 font-bold text-primary-foreground">전송</button></form>
      </>}
    </section>
  </main>;
}
