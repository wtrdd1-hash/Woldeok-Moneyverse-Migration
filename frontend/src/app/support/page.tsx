import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';
import { requireMember } from '@/lib/session';
import { createSupportThread, replySupportThread } from './actions';
import { SupportFilterNav } from './support-filter-nav';
import { filterSupportThreads, parseSupportStatus, supportStatusHref } from './support-status';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: '관리자 문의', robots: { index: false, follow: false } };

type Thread = {
  thread_id: string;
  subject: string;
  status: string;
  created_at: string;
  last_message_at: string;
};
type Message = {
  message_id: string;
  sender_kind: 'user' | 'admin';
  body: string;
  created_at: string;
};
const label: Record<string, string> = {
  open: '관리자 답변 대기',
  waiting_user: '내 답변 대기',
  resolved: '처리 완료',
};
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ thread?: string; status?: string }>;
}) {
  await requireMember();
  const { threads, windowLimit } = await api<{ threads: Thread[]; windowLimit: number }>(
    '/api/v1/support/threads',
  );
  const params = await searchParams;
  const status = parseSupportStatus(params.status);
  const visibleThreads = filterSupportThreads(threads, status);
  const requested = params.thread && uuidPattern.test(params.thread) ? params.thread : undefined;
  // An explicit deep link may be older than the recent window; ownership is checked by the API.
  const selected = requested ?? visibleThreads[0]?.thread_id;
  const selectedOutsideFilter = Boolean(
    selected && !visibleThreads.some((thread) => thread.thread_id === selected),
  );
  const messages = selected
    ? (
        await api<{ messages: Message[] }>(
          '/api/v1/support/threads/' + encodeURIComponent(selected) + '/messages',
        )
      ).messages
    : [];

  return (
    <main
      data-page="support"
      className="mv-page mv-page--community mx-auto grid w-full max-w-5xl gap-5 p-4 md:grid-cols-[320px_1fr]"
    >
      <section className="grid content-start gap-4">
        <div>
          <h1 className="text-2xl font-black">관리자 문의</h1>
          <p className="text-sm text-muted-foreground">
            관리자와 1:1로 대화합니다. 문의 내용과 답변은 처리 기록으로 저장됩니다.
          </p>
        </div>
        <form action={createSupportThread} className="grid gap-2 rounded-2xl border bg-card p-4">
          <strong>새 문의</strong>
          <input
            name="subject"
            maxLength={120}
            required
            placeholder="문의 제목"
            className="rounded-xl border bg-background p-3"
          />
          <textarea
            name="body"
            maxLength={2000}
            required
            placeholder="문의 내용을 적어 주세요."
            className="min-h-28 rounded-xl border bg-background p-3"
          />
          <button className="rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground">
            문의 시작
          </button>
        </form>
        <SupportFilterNav
          status={status}
          selected={requested}
          visibleCount={visibleThreads.length}
          windowLimit={windowLimit}
        />
        <div className="grid gap-2">
          {visibleThreads.map((thread) => (
            <Link
              key={thread.thread_id}
              href={supportStatusHref(status, thread.thread_id)}
              aria-current={selected === thread.thread_id ? 'page' : undefined}
              className={
                'rounded-xl border p-3 ' +
                (selected === thread.thread_id ? 'bg-primary/10 border-primary' : 'bg-card')
              }
            >
              <div className="font-bold">{thread.subject}</div>
              <div className="text-xs text-muted-foreground">
                {label[thread.status] ?? thread.status}
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="flex min-h-[60vh] flex-col rounded-2xl border bg-card p-4">
        {selectedOutsideFilter && (
          <p className="mb-3 text-xs text-muted-foreground">
            선택한 문의는 현재 필터의 최근 목록 밖에 있습니다. 대화는 본인 확인 후 별도로
            표시됩니다.
          </p>
        )}
        {!selected ? (
          <p className="m-auto text-muted-foreground">
            새 문의를 작성하면 관리자와 대화를 시작할 수 있습니다.
          </p>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.message_id}
                  className={
                    'max-w-[85%] rounded-2xl p-3 ' +
                    (message.sender_kind === 'admin'
                      ? 'bg-primary text-primary-foreground'
                      : 'ml-auto bg-muted')
                  }
                >
                  <div className="mb-1 text-xs font-bold">
                    {message.sender_kind === 'admin' ? '관리자' : '나'}
                  </div>
                  <p className="whitespace-pre-wrap break-words">{message.body}</p>
                </div>
              ))}
            </div>
            <form action={replySupportThread} className="mt-4 flex gap-2 border-t pt-4">
              <input type="hidden" name="threadId" value={selected} />
              <textarea
                name="body"
                maxLength={2000}
                required
                className="min-h-16 flex-1 rounded-xl border bg-background p-3"
                placeholder="답장 입력"
              />
              <button className="rounded-xl bg-primary px-5 font-bold text-primary-foreground">
                전송
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
