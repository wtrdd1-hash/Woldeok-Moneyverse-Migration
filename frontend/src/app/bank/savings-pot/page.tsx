import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { StateBox } from '@/components/d180/primitives';

/**
 * No group-savings API exists (QA 2026-11-25). The former page listed invented
 * members and "simulated" deposits; personal savings pockets live on /bank.
 */
export default function SavingsChallengePotPage() {
  return (
    <div data-page="bank-savings-pot">
      <PageHeader title="공동 저축 챌린지">친구와 함께 목표 금액을 모으는 저축 모임입니다.</PageHeader>
      <StateBox
        kind="unavailable"
        title="공동 저축 챌린지는 아직 열리지 않았어요"
        action={
          <Link href="/bank" prefetch={false} className="inline-flex min-h-11 items-center rounded-lg bg-[var(--g1-violet-ink)] px-4 text-sm font-semibold text-white">
            은행에서 저축 포켓 만들기
          </Link>
        }
      >
        모임 저축이 열리기 전에는 은행의 개인 저축 포켓을 이용할 수 있습니다.
      </StateBox>
    </div>
  );
}
