import { AdminSubNav } from '@/components/admin-sub-nav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-w-0 gap-4" data-admin-layout>
      <AdminSubNav />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
