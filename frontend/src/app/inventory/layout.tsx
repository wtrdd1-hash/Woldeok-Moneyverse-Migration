import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Inventory is member-specific; crawlers must not index or follow its links.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function InventoryLayout({ children }: { children: ReactNode }) {
  return children;
}
