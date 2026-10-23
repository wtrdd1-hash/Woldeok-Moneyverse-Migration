import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { StocksSubNav } from './stocks-sub-nav';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function StocksLayout({ children }: { readonly children: ReactNode }) {
  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full min-w-0 overflow-hidden">
      <StocksSubNav />
      {children}
    </div>
  );
}
