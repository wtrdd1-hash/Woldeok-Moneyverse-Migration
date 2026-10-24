import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { requireMember } from '@/lib/session';
import { receiptPath } from '../receipt-path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata: Metadata = { title: '거래 참조번호로 찾기', robots: { index: false, follow: false } };

export default async function WalletReceiptLookup({
  searchParams,
}: { readonly searchParams: Promise<{ reference?: string }> }) {
  await requireMember();
  const { reference } = await searchParams;
  const path = typeof reference === 'string' ? receiptPath(reference) : null;
  if (path) redirect(path);

  return (
    <div className="mv-page mv-page--finance grid gap-5">
      <PageHeader eyebrow="PRIVATE RECEIPT" title="거래 참조번호로 찾기">
        최근 목록에 보이지 않는 내 거래도 참조번호로 확인할 수 있습니다.
      </PageHeader>
      <form method="get" className="grid max-w-lg gap-3">
        <label htmlFor="transaction-reference" className="text-sm font-medium">거래 참조번호 (UUID)</label>
        <Input id="transaction-reference" name="reference" autoComplete="off" maxLength={36} required
          placeholder="00000000-0000-0000-0000-000000000000" />
        {reference && !path && <p role="alert" className="text-sm text-destructive">올바른 거래 참조번호를 입력해 주세요.</p>}
        <Button type="submit" className="w-fit">내 거래 확인</Button>
      </form>
      <Button asChild variant="outline" className="w-fit"><Link href="/wallet/activity">기록으로 돌아가기</Link></Button>
    </div>
  );
}
