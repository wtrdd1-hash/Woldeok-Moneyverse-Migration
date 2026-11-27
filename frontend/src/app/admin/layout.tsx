import { notFound, redirect } from 'next/navigation';
import { AdminSubNav } from '@/components/admin-sub-nav';
import { TranslatedText } from '@/components/translated-text';
import { currentViewer, isAdministrator } from '@/lib/viewer';
import { ADMIN_CHROME_COPY } from './admin-copy';
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
      {/* DESIGN180: no console banner — the sidebar's administrator navigation
          already marks the operator area (owner QA 2026-11-25). */}
      <p role="note" className="text-xs leading-relaxed text-[var(--g1-muted)]">
        <TranslatedText
          korean={ADMIN_CHROME_COPY.layoutNote.ko}
          english={ADMIN_CHROME_COPY.layoutNote.en}
          japanese={ADMIN_CHROME_COPY.layoutNote.ja}
          chinese={ADMIN_CHROME_COPY.layoutNote.zh}
          vietnamese={ADMIN_CHROME_COPY.layoutNote.vi}
        />
      </p>
      <div className="grid w-full max-w-full min-w-0 gap-4 overflow-hidden" data-admin-layout>
        <AdminSubNav />
        <div className="w-full max-w-full min-w-0 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
