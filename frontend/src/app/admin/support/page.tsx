import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';
import { AdminBack } from '../admin-back';
import { adminSupportReply, adminSupportStatus } from './actions';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'문의 채팅 · 관리자 콘솔',robots:{index:false,follow:false}};
type Thread={thread_id:string;user_id:string;display_name:string;subject:string;status:string;created_at:string;last_message_at:string};
type Message={message_id:string;sender_kind:'user'|'admin';sender_user_id:string;body:string;created_at:string};
export default async function Page({searchParams}:{searchParams:Promise<{thread?:string;status?:string}>}){
 await requireAdminConsole('/admin/support'); const q=await searchParams; const status=['open','waiting_user','resolved'].includes(q.status??'')?q.status:null;
 const {threads}=await api<{threads:Thread[]}>(`/api/v1/admin/support/threads${status?`?status=${status}`:''}`); const selected=q.thread??threads[0]?.thread_id;
 const messages=selected?(await api<{messages:Message[]}>(`/api/v1/admin/support/threads/${selected}/messages`)).messages:[];
 return <div data-page="admin-support" className="mv-page mv-page--admin grid gap-5"><AdminBack/><div><h1 className="text-2xl font-black">관리자 문의 채팅</h1><p className="text-sm text-muted-foreground">회원 문의를 읽고 답장하거나 처리 상태를 변경합니다.</p></div>
  <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1.5 pb-1">
    {[
      { href: '/admin/support', label: '전체', active: status === null },
      { href: '/admin/support?status=open', label: '답변 대기', active: status === 'open' },
      { href: '/admin/support?status=waiting_user', label: '회원 대기', active: status === 'waiting_user' },
      { href: '/admin/support?status=resolved', label: '완료', active: status === 'resolved' },
    ].map((tab) => (
      <Link
        key={tab.href}
        href={tab.href}
        className={`min-h-9 shrink-0 flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
          tab.active
            ? 'bg-primary text-primary-foreground border-primary shadow-xs'
            : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground border-border'
        }`}
      >
        {tab.label}
      </Link>
    ))}
  </div>
  <div className="grid gap-4 lg:grid-cols-[360px_1fr]"><div className="grid content-start gap-2 max-h-72 lg:max-h-none overflow-y-auto">{threads.map(t=><Link key={t.thread_id} href={`/admin/support?thread=${t.thread_id}${status?`&status=${status}`:''}`} className={`rounded-xl border p-3 ${selected===t.thread_id?'border-primary bg-primary/10':'bg-card'}`}><div className="font-bold">{t.subject}</div><div className="text-xs">{t.display_name} · {t.status}</div></Link>)}</div>
 <section className="flex min-h-[60vh] flex-col rounded-2xl border bg-card p-4">{selected?<><div className="flex-1 space-y-3">{messages.map(m=><div key={m.message_id} className={`max-w-[85%] rounded-2xl p-3 ${m.sender_kind==='admin'?'ml-auto bg-primary text-primary-foreground':'bg-muted'}`}><b className="text-xs">{m.sender_kind==='admin'?'관리자':'회원'}</b><p className="whitespace-pre-wrap break-words">{m.body}</p></div>)}</div>
 <form action={adminSupportReply} className="mt-4 grid gap-2 border-t pt-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"><input type="hidden" name="threadId" value={selected}/><textarea name="body" maxLength={2000} required aria-label="관리자 답장" className="min-h-24 w-full rounded-xl border bg-background p-3 sm:min-h-16" placeholder="관리자 답장"/><button className="min-h-11 w-full rounded-xl bg-primary px-5 font-bold text-primary-foreground sm:w-auto">답장</button></form>
 <form action={adminSupportStatus} className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"><input type="hidden" name="threadId" value={selected}/><select name="status" aria-label="문의 처리 상태" className="min-h-11 w-full rounded-xl border bg-background p-2"><option value="open">답변 대기</option><option value="waiting_user">회원 답변 대기</option><option value="resolved">처리 완료</option></select><button className="min-h-11 w-full rounded-xl border px-4 font-bold sm:w-auto">상태 변경</button></form></>:<p className="m-auto text-muted-foreground">문의가 없습니다.</p>}</section></div></div>;
}
