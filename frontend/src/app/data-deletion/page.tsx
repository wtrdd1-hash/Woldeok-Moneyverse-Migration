import type { Metadata } from 'next';
import { DeletionRequestInfo } from '@/components/deletion-request-info';
import { PageHeader } from '@/components/page-header';

export const metadata: Metadata = {
  title: '개인정보 삭제 요청',
  description: '계정을 유지하면서 월덕 머니버스 개인정보 삭제를 요청하는 방법과 보관 기준',
  alternates: { canonical: '/data-deletion' },
};

export default function DataDeletionPage() {
  return (
    <div className="grid gap-6">
      <PageHeader title="개인정보 삭제 요청" />
      <DeletionRequestInfo mode="data" />
    </div>
  );
}
