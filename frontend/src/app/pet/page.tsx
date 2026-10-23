import type { Metadata } from 'next';
import Link from 'next/link';
import { DeokiPetStation } from '@/components/deoki-pet-station';
import { requireMember } from '@/lib/session';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '덕이 펫 · 정보성 포춘쿠키 - 월덕 머니버스',
  description: '덕이를 쓰다듬고 서버에서 제공하는 정보성 점괘를 확인하세요. WLD 보상은 지급되지 않습니다.',
  robots: { index: false, follow: false },
};

export default async function PetPage() {
  await requireMember();
  return (
    <main className="mx-auto w-full max-w-3xl space-y-5 px-3 py-6 pb-24 sm:px-6">
      <nav aria-label="현재 위치" className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <Link href="/" className="underline underline-offset-4 hover:text-foreground">홈</Link>
        <span aria-hidden="true">/</span>
        <Link href="/roadmap" className="underline underline-offset-4 hover:text-foreground">성장 가이드</Link>
      </nav>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">덕이 펫 · 정보성 포춘쿠키</h1>
        <p className="text-sm text-muted-foreground">
          쓰다듬기 친밀도는 현재 화면의 연출이며 저장되지 않습니다. 포춘쿠키는 서버에서 점괘만 제공하고 WLD 보상은 지급되지 않습니다.
        </p>
      </div>
      <DeokiPetStation />
      <p className="text-sm text-muted-foreground">
        실제 가상자산 잔액은 <Link href="/wallet" className="underline underline-offset-4">내 지갑</Link>에서 확인할 수 있습니다.
      </p>
    </main>
  );
}
