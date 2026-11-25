import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { StateBox } from '@/components/d180/primitives';

export const metadata: Metadata = {
  title: '예측 마켓',
  description: '월덕 머니버스 예측 마켓 안내. 아직 열리지 않았습니다.',
  robots: { index: false, follow: true },
};

/**
 * No prediction API exists on the backend (QA 2026-11-25), so there are no
 * markets, odds or pools to show. The former page invented them and confirmed
 * trades that were never sent anywhere.
 */
export default function PredictionPage() {
  const action = 'inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-semibold';
  return (
    <div data-page="prediction">
      <PageHeader title="예측 마켓">가상 경제 사건의 결과를 예측하는 시장입니다.</PageHeader>
      <StateBox
        kind="unavailable"
        title="예측 마켓은 아직 열리지 않았어요"
        action={
          <>
            <Link href="/stocks" prefetch={false} className={`${action} bg-[var(--g1-violet-ink,#6a4cdb)] text-white`}>
              거래소로 가기
            </Link>
            <Link href="/quests" prefetch={false} className={`${action} border border-[var(--g1-line)] text-[var(--g1-ink)]`}>
              퀘스트 보기
            </Link>
          </>
        }
      >
        시장 목록과 배당률은 실제 서버가 운영을 시작하면 이곳에 표시됩니다. 그 전에는 지분을 사고팔 수 없습니다.
      </StateBox>
    </div>
  );
}
