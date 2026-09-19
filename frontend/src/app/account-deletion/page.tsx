import type { Metadata } from 'next';
import { DeletionRequestInfo } from '@/components/deletion-request-info';
import { PageHeader } from '@/components/page-header';

export const metadata: Metadata = {
  title: '계정 삭제 요청',
  description: '월덕 머니버스 계정 및 관련 데이터 삭제 요청 방법과 보관 기준',
  alternates: { canonical: '/account-deletion' },
};

export default function AccountDeletionPage() {
  return (
    <div data-page="account-deletion" className="mv-page mv-page--utility grid gap-6">
      <PageHeader title="계정 삭제 요청" />
      <DeletionRequestInfo mode="account" />
    </div>
  );
}
