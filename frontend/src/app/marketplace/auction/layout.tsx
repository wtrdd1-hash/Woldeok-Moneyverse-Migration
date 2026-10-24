import type { Metadata } from 'next';

// This route is a preview with authenticated live auction data, not a public market listing.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuctionPreviewLayout({ children }: { readonly children: React.ReactNode }) {
  return children;
}
