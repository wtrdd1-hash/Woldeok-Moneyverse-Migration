import { notFound, redirect } from 'next/navigation';
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
    <div
      data-admin-theme="v2026.11.18.17"
      className="moneyverse-admin-console mx-auto w-full max-w-full min-w-0 overflow-x-clip rounded-[1.35rem] border border-violet-400/15 p-2 sm:p-4 lg:p-5"
    >
      <header className="moneyverse-admin-header relative mb-4 flex flex-wrap items-center justify-between gap-3 overflow-hidden rounded-2xl border border-violet-400/25 bg-gradient-to-br from-[#23204d] via-[#171f3d] to-[#0f1a31] px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex min-w-0 items-center gap-3">
          <div aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-tr from-violet-500 to-sky-400 text-2xl font-black text-white shadow-lg shadow-violet-900/30">
            W
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold tracking-[0.12em] text-violet-200 sm:text-xs">
              ADMIN CONTROL CENTER
            </p>
            <h2 className="text-lg font-extrabold tracking-tight text-white sm:text-xl">
              월덕 머니버스 관리자 센터
            </h2>
          </div>
        </div>
        <p role="note" className="max-w-xs text-xs leading-relaxed text-slate-300">
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
