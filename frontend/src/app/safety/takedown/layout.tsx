import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '긴급 콘텐츠 삭제 접수 및 상태 조회',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default function TakedownLayout({ children }: { readonly children: React.ReactNode }) {
  return children;
}
