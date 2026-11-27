import type { Metadata } from 'next';
import { apiOrNull } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';
import { TranslatedText as T } from '@/components/translated-text';
import { requireAdminConsole } from '@/lib/session';
import { getServerLocale } from '@/lib/locale-server';
import { copyText } from '../admin-copy';
import { ADMIN_SUPPORT_COPY } from './copy';
import { AdminSupportView, type AdminSupportThread, type AdminSupportMessage } from './admin-support-view';

export const dynamic = 'force-dynamic';
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: copyText(await getServerLocale(), ADMIN_SUPPORT_COPY.metaTitle),
    robots: { index: false, follow: false },
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ thread?: string; status?: string }>;
}) {
  await requireAdminConsole('/admin/support');
  const q = await searchParams;
  const status = ['open', 'waiting_user', 'resolved'].includes(q.status ?? '') ? q.status! : null;

  // An unreadable source is an honest unavailable state; it used to throw here and take the whole
  // console page down (React #441 in the browser).
  const list = await apiOrNull<{ threads: AdminSupportThread[] }>(
    `/api/v1/admin/support/threads${status ? `?status=${encodeURIComponent(status)}` : ''}`
  );
  const threads = list && Array.isArray(list.threads) ? list.threads : null;
  const selected = q.thread ?? threads?.[0]?.thread_id;
  const messages = threads && selected
    ? ((await apiOrNull<{ messages: AdminSupportMessage[] }>(
        `/api/v1/admin/support/threads/${encodeURIComponent(selected)}/messages`
      ))?.messages ?? null)
    : [];
  // A conversation that could not be read is not an empty conversation.
  if (!threads || !Array.isArray(messages)) {
    return (
      <div data-support-unavailable className="grid gap-4">
        <EmptyState
          title={<T korean="문의 목록을 불러오지 못했어요." english="The support threads could not be loaded." japanese="お問い合わせ一覧を読み込めませんでした。" chinese="无法加载咨询列表。" vietnamese="Không tải được danh sách yêu cầu hỗ trợ." />}
        />
      </div>
    );
  }

  return (
    <AdminSupportView
      initialThreads={threads}
      initialMessages={messages}
      selectedId={selected}
      initialStatus={status}
    />
  );
}
