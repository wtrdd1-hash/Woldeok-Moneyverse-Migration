import type { Metadata } from 'next';
import { requireMember } from '@/lib/session';

export const metadata: Metadata = {
  title: '새 클럽 창설',
  robots: { index: false, follow: false },
};

export default async function NewClubLayout({ children }: { readonly children: React.ReactNode }) {
  await requireMember();
  return children;
}
