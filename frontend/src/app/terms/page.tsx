import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { TermsDocument } from '@/components/policy/terms-document';

/**
 * Static. Policy text changes on a deliberate deploy, never on a schedule,
 * and the consent step embeds this page — so it has to render identically for
 * everyone and arrive fast.
 */
export const metadata: Metadata = {
  title: '이용약관',
  description: '월덕 머니버스 이용약관 전문',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <div className="grid gap-6">
      <PageHeader title="이용약관" />
      <TermsDocument />
    </div>
  );
}
