import { notFound, redirect } from 'next/navigation';
import { ShieldHalf } from 'lucide-react';
import { AdminSubNav } from '@/components/admin-sub-nav';
import { currentViewer, isAdministrator } from '@/lib/viewer';
import './admin-console-theme.css';

// Per-caller decision; never prerender or cache this frame.
export const dynamic = 'force-dynamic';

/**
 * Server gate for every /admin route. The API still re-decides each request;
 * this only keeps the console's menu and structure out of the HTML served to
 * someone who is not an administrator (CURRENT_UI_DESIGN.md: administrator
 * navigation renders only for server-authorized admins). Signed-out callers
 * are sent to log in; signed-in non-administrators get a plain 404 so the
 * console's existence is not confirmed to them.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const viewer = await currentViewer();
  if (!viewer.signedIn) redirect('/login?next=%2Fadmin');
  if (!isAdministrator(viewer)) notFound();
  return <AdminConsoleFrame>{children}</AdminConsoleFrame>;
}

/** Shared visual shell for the protected admin routes. */
export function AdminConsoleFrame({ children }: { children: React.ReactNode }) {
  return (
    <div data-admin-theme="g1-gm" className="moneyverse-admin-console mx-auto grid w-full max-w-full min-w-0 gap-4 overflow-x-clip">
      {/* G1 GM console: ember marks the operator realm (approved G1 admin previews). */}
      <header className="moneyverse-admin-header g1-chamfer flex flex-wrap items-center justify-between gap-3 border border-[var(--g1-ember)] bg-[var(--g1-ember-wash)] px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <ShieldHalf aria-hidden="true" className="size-8 shrink-0 text-[var(--g1-ember)]" />
          <div className="min-w-0">
            <h2 className="g1-display text-xl text-[var(--g1-ink)]">GM 콘솔</h2>
            <p className="text-xs text-[var(--g1-muted)]">월덕 머니버스 관리자 센터</p>
          </div>
        </div>
        <p role="note" className="max-w-xs text-xs leading-relaxed text-[var(--g1-muted)]">
          서비스 상태는 각 관리자 API의 실제 조회 결과를 기준으로 표시합니다.
        </p>
      </header>
      <div className="grid w-full max-w-full min-w-0 gap-4 overflow-hidden" data-admin-layout>
        <AdminSubNav />
        <div className="w-full max-w-full min-w-0 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
