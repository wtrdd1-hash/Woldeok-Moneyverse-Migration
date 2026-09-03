import { AdminSubNav } from '@/components/admin-sub-nav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-4">
      <AdminSubNav />
      {children}
    </div>
  );
}