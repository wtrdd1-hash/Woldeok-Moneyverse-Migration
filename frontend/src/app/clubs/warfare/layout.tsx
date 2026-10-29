import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '클럽 공성전 운영 상태 | 월덕 머니버스',
  description: '클럽 공성전은 실제 점령 및 WLD 정산 원장이 준비될 때까지 비활성화되어 있습니다. 현재 클럽 가입 정보는 서버에서 확인할 수 있습니다.',
  robots: { index: false, follow: false },
};

export default function WarfareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
