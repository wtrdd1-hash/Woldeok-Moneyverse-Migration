import type { Metadata } from 'next';
import { Plate } from '@/components/ui/plate';

// Static: policy text changes on a deliberate deploy, not on a schedule.
export const metadata: Metadata = {
  title: '이용약관',
  description: '월덕 머니버스 이용약관',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <div className="grid gap-4">
      <h1 className="pt-4 text-2xl font-bold">이용약관</h1>
      <Plate>
        <p className="text-sm">
          월덕 머니버스의 모든 WLD와 보상은 커뮤니티 안에서만 사용하는 가상 데이터입니다.
          현금 거래나 환전 기능은 제공하지 않습니다.
        </p>
      </Plate>
    </div>
  );
}
