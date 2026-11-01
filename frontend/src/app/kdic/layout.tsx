import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/** No insurance FAQ schema, calculator claims or public indexing until verified. */
export const metadata: Metadata = {
  title: '가상 예금 보호 현황 — 월덕 머니버스',
  description: '가상 WLD 보호제도의 원장 근거와 지급 가능 여부가 확인되지 않아 보호금액 표시를 보류합니다.',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default function KdicLayout({ children }: { children: ReactNode }) {
  return children;
}
