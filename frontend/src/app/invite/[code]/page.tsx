import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ShieldAlert } from 'lucide-react';

interface InvitePageProps {
  readonly params: Promise<{ readonly code: string }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// No invitation validation, account binding, or ledger-backed reward receipt
// exists in the current API. Do not turn an untrusted URL token into proof.
export async function generateMetadata(_props: InvitePageProps): Promise<Metadata> {
  return {
    title: '초대 안내 | 월덕 머니버스',
    description: '초대 링크의 유효성과 보상 지급 여부는 확인되지 않았습니다. 일반 회원가입은 이용할 수 있습니다.',
    robots: { index: false, follow: false },
  };
}

export default async function InviteLandingPage(_props: InvitePageProps) {
  return (
    <div data-page="invite-unverified" className="mx-auto flex min-h-[65vh] w-full max-w-2xl flex-col justify-center gap-6 px-4 py-12 sm:py-20">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-10">
        <ShieldAlert aria-hidden="true" className="mb-4 size-9 text-amber-600" />
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">초대 링크 안내</h1>
        <div role="status" aria-live="polite" className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm leading-7">
          <p className="font-semibold">초대 코드의 유효성을 확인할 수 없습니다.</p>
          <p>현재 서버에서 초대 코드 인증 및 초대 보상 지급 내역을 확인하는 기능을 제공하지 않습니다.</p>
        </div>
        <p className="mt-5 text-sm leading-7 text-muted-foreground">
          이 링크를 방문했다는 사실만으로 회원가입 혜택이나 가상 WLD 지급이 확정되지는 않습니다.
          초대 코드는 회원가입에 자동 적용되지 않으며, 실제 보상은 서버 원장 기록이 있어야 확인할 수 있습니다.
        </p>
        <nav aria-label="계정 이용" className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/register" className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
            일반 회원가입 <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <Link href="/login" className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-border px-5 py-3 text-sm font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
            기존 회원 로그인
          </Link>
        </nav>
      </div>
    </div>
  );
}
