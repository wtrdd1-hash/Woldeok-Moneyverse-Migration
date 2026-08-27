import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { PrivacyDocument } from '@/components/policy/privacy-document';

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: '월덕 머니버스가 처리하는 개인정보와 이용자의 권리',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="grid gap-6">
      <PageHeader title="개인정보처리방침" />
      <PrivacyDocument />
    </div>
  );
}
