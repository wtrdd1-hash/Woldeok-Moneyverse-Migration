import type { Metadata } from 'next';
import { Plate } from '@/components/ui/plate';

export const metadata: Metadata = {
  title: '개인정보 처리방침',
  description: '월덕 머니버스가 수집하는 정보와 이용자 권리',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="grid gap-4">
      <h1 className="pt-4 text-2xl font-bold">개인정보 처리방침</h1>
      <Plate>
        <p className="text-sm">
          로그인에 사용한 Discord 또는 Google 계정의 식별자와 표시 이름을 보관합니다.
          정보주체 요청은 계정 화면에서 접수할 수 있습니다.
        </p>
      </Plate>
    </div>
  );
}
