import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { requireAdminConsole } from '@/lib/session';
import { AdminBack } from '../admin-back';
import { adminArea } from '../areas';
import { CentralBankPanel } from '@/components/admin/central-bank-panel';

export const dynamic = 'force-dynamic';

const AREA = adminArea('/admin/central-bank');

export const metadata: Metadata = {
  title: AREA.title,
  robots: { index: false, follow: false },
};

export default async function AdminCentralBankPage() {
  await requireAdminConsole(AREA.href);

  return (
    <div data-page="admin-central-bank" className="mv-page mv-page--admin grid gap-6 pb-32 sm:pb-12">
      <AdminBack />
      <PageHeader
        eyebrow={AREA.eyebrow}
        title={AREA.title}
      >
        {AREA.summary}
      </PageHeader>
      <CentralBankPanel />
    </div>
  );
}
