import type { Metadata } from 'next';
import Link from 'next/link';
import { requireMember } from '@/lib/session';
import { PageHeader } from '@/components/page-header';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: '클럽 창설 이용 안내', robots: { index: false, follow: false } };

export default async function NewClubPage() {
  await requireMember();
  return (
    <main className="container mx-auto max-w-3xl space-y-6 px-4 py-8">
      <PageHeader eyebrow="클럽·협동조합" title="클럽 창설 이용 안내">
        <p>실제 WLD 결제 영수증이 검증되기 전에는 클럽 창설 요청을 받지 않습니다.</p>
      </PageHeader>
      <section role="status" className="space-y-3 rounded-xl border border-amber-500/40 bg-amber-500/5 p-5">
        <h2 className="text-lg font-semibold">클럽 창설은 현재 이용할 수 없습니다.</h2>
        <p className="text-sm leading-6">서버의 창설 API가 원장 거래 검증 전까지 요청을 거부합니다. 이 화면에서는 10,000 WLD 소각이나 창설 완료를 약속하지 않습니다.</p>
        <Link href="/clubs" className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2">실제 클럽 목록으로 돌아가기</Link>
      </section>
    </main>
  );
}
