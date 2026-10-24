import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, AlertTriangle, Briefcase, Landmark, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: '월덕 머니버스 서비스 소개',
  description: '가상 주식, 은행, 직업 활동을 경험하는 월덕 머니버스를 소개합니다.',
  robots: { index: false, follow: false },
};

export async function generateMetadata(): Promise<Metadata> {
  // A path segment supplied by anyone cannot prove a referral code is valid.
  return metadata;
}

/** Legacy invite links remain usable for navigation, never for unverified credits. */
export default function InviteLandingPage() {
  return (
    <main data-page="invite" className="mx-auto grid w-full max-w-4xl gap-8 px-4 py-10 sm:py-16">
      <header className="grid gap-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">월덕 머니버스에 오신 것을 환영합니다</h1>
        <p className="mx-auto max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          월덕 머니버스는 가상 주식, 은행, 직업 활동을 체험할 수 있는 게임형 가상 경제 서비스입니다.
        </p>
      </header>

      <section aria-labelledby="invite-information" className="grid gap-4 rounded-2xl border bg-card p-5 sm:p-8">
        <div role="status" className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm leading-6">
          <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-amber-600" />
          <p>이 링크에 포함된 초대 코드는 서버에서 확인되지 않았습니다. 현재 초대 코드 인증 및 초대 보상 지급 기능은 제공되지 않으며, WLD나 아이템 지급을 보장하지 않습니다.</p>
        </div>
        <h2 id="invite-information" className="text-lg font-semibold">서비스를 시작하려면</h2>
        <p className="text-sm leading-6 text-muted-foreground">공식 회원가입 또는 로그인 화면으로 이동해 주세요. 초대 코드 없이도 일반 가입을 진행할 수 있습니다.</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/register" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2">
            회원가입 <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <Link href="/login" className="inline-flex min-h-11 items-center justify-center rounded-lg border px-5 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2">
            기존 회원 로그인
          </Link>
        </div>
      </section>

      <section aria-label="주요 가상 경제 활동" className="grid gap-4 sm:grid-cols-3">
        <Feature icon={<TrendingUp aria-hidden="true" className="size-5" />} title="가상 주식" description="게임 속 가상 기업의 가격과 거래를 살펴보세요." />
        <Feature icon={<Landmark aria-hidden="true" className="size-5" />} title="가상 은행" description="게임 내 예금 및 자산 관리 기능을 알아보세요." />
        <Feature icon={<Briefcase aria-hidden="true" className="size-5" />} title="직업 활동" description="다양한 가상 직업과 활동을 경험해 보세요." />
      </section>
      <p className="text-center text-xs text-muted-foreground">WLD와 서비스 내 금융 활동은 현금·실제 투자 상품이 아닌 게임 전용 가상 데이터입니다.</p>
    </main>
  );
}

function Feature({ icon, title, description }: { readonly icon: React.ReactNode; readonly title: string; readonly description: string }) {
  return (
    <div className="grid gap-2 rounded-xl border bg-card p-5">
      <span className="text-primary">{icon}</span>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}
