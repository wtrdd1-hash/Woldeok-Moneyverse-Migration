import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';
import { requireMember } from '@/lib/session';
import { parseSupportSummary } from '@/lib/support-summary';
import { NewSupportThreadForm, SupportReplyForm } from './member-support-forms';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: '관리자 문의', robots: { index: false, follow: false } };

type Thread = { thread_id: string; subject: string; status: string; created_at: string; last_message_at: string };
type Message = { message_id: string; sender_kind: 'user'|'admin'; body: string; created_at: string };
const label: Record<string,string> = { open: '관리자 답변 대기', waiting_user: '내 답변 대기', resolved: '처리 완료' };

export default async function SupportPage({ searchParams }: { searchParams: Promise<{ thread?: string; status?: string; q?: string }> }) {
  await requireMember();
  const params = await searchParams;
  const status = typeof params.status === 'string' && ['open', 'waiting_user', 'resolved'].includes(params.status) ? params.status : null;
  const q = typeof params.q === 'string' && params.q.length <= 80 && ![...params.q].some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)
    ? params.q.trim() : '';
  const filters = new URLSearchParams({ ...(status ? { status } : {}), ...(q ? { q } : {}) });
  const path = /api/v1/support/threads${filters.size ? ?${filters}` : ''};
  const { threads } = q
    ? await api<{ threads: Thread[] }>(path, {})
    : await api<{ threads: Thread[] }>(path);
  const summary = parseSupportSummary(
    await api<unknown>('/api/v1/support/threads/summary').catch(() => null),
  );
  // A stale or forged selected ID must not trigger an additional private read.
  const selected = threads.find(t => t.thread_id === params.thread)?.thread_id ?? threads[0]?.thread_id;
  const messages = selected
    ? (await api<{ messages: Message[] }>(`/api/v1/support/threads/${encodeURIComponent(selected)}/messages`)).messages
    : [];
  return <main data-page="support" className="mv-page mv-page--community mx-auto grid w-full max-w-5xl gap-5 p-4 md:grid-cols-[320px_1fr]">
    <section className="grid content-start gap-4">
      <div><h1 className="text-2xl font-black">관리자 문의</h1><p className="text-sm text-muted-foreground">관리자와 1:1로 대화합니다. 문의 내용과 답변은 처리 기록으로 저장됩니다.</p></div>
      <section aria-label="최근 문의 상태 요약" className="rounded-xl border bg-card p-3">
        <h2 className="text-sm font-bold">최근 최대 100건 기준 문의 현황</h2>
        {!summary ? (
          <p role="status" className="text-sm text-muted-foreground">문의 현황을 확인할 수 없습니다.</p>
        ) : (
          <>
            <dl className="mt-2 grid grid-cols-3 gap-2 text-center text-sm">
              <div><dt>관리자 답변 대기</dt><dd className="font-bold">{summary.open}건</dd></div>
              <div><dt>내 답변 대기</dt><dd className="font-bold">{summary.waitingUser}건</dd></div>
              <div><dt>처리 완료</dt><dd className="font-bold">{summary.resolved}건</dd></div>
            </dl>
            {summary.mayBeIncomplete && (
              <p role="status" className="mt-2 text-xs text-muted-foreground">
                최근 100건만 집계했습니다. 전체 문의 건수와 다를 수 있습니다.
              </p>
            )}
          </>
        )}
      </section>
      <NewSupportThreadForm />
      <form method="get" action="/support" className="grid gap-2 rounded-xl border bg-card p-3">
        <label htmlFor="support-search" className="text-sm font-semibold">문의 제목 검색</label>
        <input id="support-search" name="q" type="search" maxLength={80} defaultValue={q} autoComplete="off" className="min-h-11 w-full rounded-xl border bg-background p-2" placeholder="최근 문의 제목 검색" />
        <p className="text-xs text-muted-foreground">최근 100건의 문의 제목에서 검색합니다. 전체 기록 검색은 지원하지 않습니다.</p>
        <label htmlFor="support-status" className="text-sm font-semibold">문의 처리 상태</label>
        <p className="text-xs text-muted-foreground">최근 100건의 문의 중에서 상태를 확인합니다. 이전 문의 전체 검색은 지원하지 않습니다.</p>
        <select id="support-status" name="status" defaultValue={status ?? ''} className="min-h-11 rounded-xl border bg-background p-2">
          <option value="">전체</option><option value="open">관리자 답변 대기</option>
          <option value="waiting_user">내 답변 대기</option><option value="resolved">처리 완료</option>
        </select>
        <button type="submit" className="min-h-11 rounded-xl border bg-primary px-4 text-primary-foreground">필터 적용</button>
      </form>
      <div className="grid gap-2">{threads.length === 0 && <p className="text-sm text-muted-foreground">{q ? '검색 결과가 없습니다.' : '조건에 맞는 문의가 없습니다.'}</p>}{threads.map(t => <Link key={t.thread_id} href={`/support?${new URLSearchParams({ ...(status ? { status } : {}), ...(q ? { q } : {}), thread: t.thread_id }).toString()}`} className={`rounded-xl border p-3 ${selected===t.thread_id?'bg-primary/10 border-primary':'bg-card'}`}>
        <div className="font-bold">{t.subject}</div><div className="text-xs text-muted-foreground">{label[t.status] ?? t.status}</div>
      </Link>)}</div>
    </section>
    <section className="flex min-h-[60vh] flex-col rounded-2xl border bg-card p-4">
      {!selected ? <p className="m-auto text-muted-foreground">새 문의를 작성하면 관리자와 대화를 시작할 수 있습니다.</p> : <>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b pb-3">
          <p className="text-xs text-muted-foreground">대화 내역은 오래된 순으로 최대 500건까지 다운로드할 수 있습니다.</p>
          <a href={`/support/transcript/${encodeURIComponent(selected)}`} download className="inline-flex min-h-11 items-center rounded-xl border px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" aria-label="선택한 관리자 문의의 대화 내역 CSV 다운로드">대화 내역 CSV 다운로드</a>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto">{messages.map(m => <div key={m.message_id} className={`max-w-[85%] rounded-2xl p-3 ${m.sender_kind==='admin'?'bg-primary text-primary-foreground':'ml-auto bg-muted'}`}>
          <div className="mb-1 text-xs font-bold">{m.sender_kind==='admin'?'관리자':'나'}</div><p className="whitespace-pre-wrap break-words">{m.body}</p>
        </div>)}</div>
        <SupportReplyForm threadId={selected} />
      </>}
    </section>
  </main>;
}
