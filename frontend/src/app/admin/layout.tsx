import { AdminSubNav } from '@/components/admin-sub-nav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid w-full max-w-full min-w-0 gap-4 overflow-hidden" data-admin-layout>
      <AdminSubNav />
      <div className="w-full max-w-full min-w-0 overflow-hidden">{children}</div>
    </div>
  );
}
