import { AdminSubNav } from '@/components/admin-sub-nav';
import './admin-console-theme.css';

/**
 * Shared visual shell for the existing protected admin routes.
 * Server/API access remains guarded in each page and endpoint, unchanged.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
