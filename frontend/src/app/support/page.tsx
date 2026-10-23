import { randomUUID } from 'node:crypto';
import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';
import { requireMember } from '@/lib/session';
import { createSupportThread, replySupportThread } from './actions';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: '관리자 문의', robots: { index: false, follow: false } };

type Thread = { thread_id: string; subject: string; status: string; created_at: string; last_message_at: string };
type Message = { message_id: string; sender_kind: 'user' | 'admin'; body: string; created_at: string };

const statusLabel: Record<string, string> = {
  open: '관리자 답변 대기',
  waiting_user: '내 답변 대기',
  resolved: '처리 완료',
};

export default async function SupportPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ thread?: string }>;
}) {
  await requireMember();
  const { threads } = await api<{ threads: Thread[] }>('/api/v1/support/threads');
  const requested = (await searchParams).thread;
  // A URL is not proof of ownership. Only fetch messages for a thread
  // returned by the authenticated, owner-scoped API.
  const selected = threads.find((thread) => thread.thread_id === requested)?.thread_id
    ?? threads[0]?.thread_id;
  const messages = selected
    ? (await api<{ messages: Message[] }>(`/api/v1/support/threads/${encodeURIComponent(selected)}/messages`)).messages
    : [];
  // A repeated POST of the same rendered form reuses its database receipt key.
  const createKey = randomUUID();
  const replyKey = randomUUID();

  return (
    <main data-page="support" className="mv-page mv-page--community mx-auto grid w-full min-w-0 max-w-5xl gap-5 p-4 md:grid-cols-[320px_minmax(0,1fr)]">
      <section className="grid min-w-0 content-start gap-4" aria-labelledby="support-title">
        <div>
          <h1 id="support-title" className="text-2xl font-black">관리자 문의</h1>
          <p className="text-sm text-muted-foreground">
            관리자와 1:1로 대화합니다. 문의 내용과 답변은 처리 기록으로 저장됩니다.
          </p>
        </div>
        <form action={createSupportThread} className="grid gap-2 rounded-2xl border bg-card p-4">
          <strong>새 문의</strong>
          <input type="hidden" name="idempotencyKey" value={createKey} />
          <input name="subject" aria-label="문의 제목" maxLength={120} required placeholder="문의 제목"
            className="min-w-0 rounded-xl border bg-background p-3" />
          <textarea name="body" aria-label="문의 내용" maxLength={2000} required
            placeholder="문의 내용을 적어 주세요." className="min-h-28 min-w-0 rounded-xl border bg-background p-3" />
          <button type="submit" className="min-h-11 rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground">
            문의 시작
          </button>
        </form>
        <nav aria-label="내 문의 목록" className="grid min-w-0 gap-2">
          {threads.map((thread) => (
            <Link key={thread.thread_id} href={`/support?thread=${thread.thread_id}`}
              aria-current={selected === thread.thread_id ? 'page' : undefined}
              className={`min-w-0 rounded-xl border p-3 break-words focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${selected === thread.thread_id ? 'border-primary bg-primary/10' : 'bg-card'}`}>
              <div className="font-bold">{thread.subject}</div>
              <div className="text-xs text-muted-foreground">{statusLabel[thread.status] ?? thread.status}</div>
            </Link>
          ))}
        </nav>
      </section>
      <section className="flex min-h-[60vh] min-w-0 flex-col rounded-2xl border bg-card p-4"
        aria-label="선택한 문의 대화">
        {!selected ? (
          <p className="m-auto text-muted-foreground">새 문의를 작성하면 관리자와 대화를 시작할 수 있습니다.</p>
        ) : (
          <>
            <div className="min-w-0 flex-1 space-y-3 overflow-y-auto" role="log" aria-label="문의 메시지">
              {messages.map((message) => (
                <div key={message.message_id}
                  className={`max-w-[85%] min-w-0 rounded-2xl p-3 ${message.sender_kind === 'admin' ? 'bg-primary text-primary-foreground' : 'ml-auto bg-muted'}`}>
                  <div className="mb-1 text-xs font-bold">{message.sender_kind === 'admin' ? '관리자' : '나'}</div>
                  <p className="whitespace-pre-wrap break-words">{message.body}</p>
                </div>
              ))}
            </div>
            <form action={replySupportThread} className="mt-4 flex min-w-0 gap-2 border-t pt-4">
              <input type="hidden" name="threadId" value={selected} />
              <input type="hidden" name="idempotencyKey" value={replyKey} />
              <textarea name="body" aria-label="답장 내용" maxLength={2000} required
                className="min-h-16 min-w-0 flex-1 rounded-xl border bg-background p-3" placeholder="답장 입력" />
              <button type="submit" className="min-h-11 rounded-xl bg-primary px-5 font-bold text-primary-foreground">
                전송
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
