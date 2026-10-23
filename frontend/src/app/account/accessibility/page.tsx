import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReadingScaleControls } from '@/components/reading-scale-controls';
import { requireMember } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: '회원 읽기 접근성 설정', robots: { index: false, follow: false } }; // noindex

export default async function AccountAccessibilityPage() {
  await requireMember();
  return (
    <div data-page="account-accessibility" className="mv-page mv-page--member mx-auto grid w-full max-w-3xl min-w-0 gap-6 pb-12">
      <PageHeader eyebrow="ACCOUNT · ACCESSIBILITY" title="읽기 접근성 설정">이 기기의 글자 크기를 조절할 수 있습니다. 계정에 동기화되지 않습니다.</PageHeader>
      <Card className="min-w-0"><CardHeader><CardTitle>글자 크기</CardTitle></CardHeader><CardContent><ReadingScaleControls /></CardContent></Card>
      <Link href="/account" className="w-fit rounded-md text-primary underline underline-offset-4 focus-visible:outline-2">내 계정으로 돌아가기</Link>
    </div>
  );
}
