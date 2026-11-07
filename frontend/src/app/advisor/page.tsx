import type { Metadata } from 'next';
import { AdvisorClient } from './advisor-client';

export const metadata: Metadata = {
  title: '가상 자산 진단 근거 확인 | Woldeok Moneyverse',
  description: '검증된 회원별 가상 자산 진단만 표시하며 원장 미연계 자동 리밸런싱은 제공하지 않습니다.',
  robots: { index: false, follow: false },
};

export default function AdvisorPage() {
  return (
    <main className="container mx-auto max-w-4xl space-y-5 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold sm:text-3xl">가상 자산 진단</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          월덕 머니버스 내 가상 WLD 자산에 대한 규칙 기반 참고 정보입니다. 실제 금융상품 분석이나 수익 보장이 아니며, 자동 매매·리밸런싱 체결은 지원하지 않습니다.
        </p>
      </header>
      <AdvisorClient />
    </main>
  );
}
