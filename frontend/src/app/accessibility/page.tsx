import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReadingScaleControls } from '@/components/reading-scale-controls';

export const metadata: Metadata = { title: '읽기 접근성 설정', robots: { index: false, follow: false } };

export default function AccessibilityPage() {
  return (
    <main data-page="accessibility" className="mv-page mx-auto grid w-full max-w-3xl min-w-0 gap-6 pb-12">
      <PageHeader eyebrow="ACCESSIBILITY" title="읽기 접근성 설정">로그인하지 않아도 글자 크기를 조정할 수 있습니다.</PageHeader>
      <Card className="min-w-0"><CardHeader><CardTitle>기기별 읽기 설정</CardTitle></CardHeader><CardContent><ReadingScaleControls /></CardContent></Card>
      <Link href="/" className="w-fit rounded-md text-primary underline underline-offset-4 focus-visible:outline-2">홈으로 돌아가기</Link>
    </main>
  );
}
