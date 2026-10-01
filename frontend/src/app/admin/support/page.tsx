import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';
import { AdminSupportView, type AdminSupportThread, type AdminSupportMessage } from './admin-support-view';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: '문의 채팅 · 관리자 콘솔',
  robots: { index: false, follow: false },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ thread?: string; status?: string }>;
}) {
  await requireAdminConsole('/admin/support');
  const q = await searchParams;
  const status = ['open', 'waiting_user', 'resolved'].includes(q.status ?? '') ? q.status! : null;

  const { threads } = await api<{ threads: AdminSupportThread[] }>(
    `/api/v1/admin/support/threads${status ? `?status=${encodeURIComponent(status)}` : ''}`
  );
  const selected = q.thread ?? threads[0]?.thread_id;
  const messages = selected
    ? (
        await api<{ messages: AdminSupportMessage[] }>(
          `/api/v1/admin/support/threads/${encodeURIComponent(selected)}/messages`
        )
      ).messages
    : [];

  return (
    <AdminSupportView
      initialThreads={threads}
      initialMessages={messages}
      selectedId={selected}
      initialStatus={status}
    />
  );
}
