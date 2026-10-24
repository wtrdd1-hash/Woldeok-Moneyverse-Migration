import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { TermsDocument } from '@/components/policy/terms-document';
import { getServerLocale } from '@/lib/locale-server';
import { localeLabel } from '@/lib/locale';
import { canonicalUrl } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return {
    title: localeLabel(locale, '이용약관', 'Terms of Service', '利用規約', '服务条款', 'Điều khoản Dịch vụ'),
    description: localeLabel(
      locale,
      '월덕 머니버스 이용약관 전문',
      'Woldeok Moneyverse Terms of Service and user agreement.',
      'ウォルドク・マネーバース利用規約の全文です。',
      '月德虚拟金融元宇宙服务条款全文。',
      'Toàn văn Điều khoản Dịch vụ của Woldeok Moneyverse.'
    ),
    alternates: { canonical: canonicalUrl('/terms') },
  };
}

export default async function TermsPage() {
  const locale = await getServerLocale();
  return (
    <div data-page="terms" className="mv-page mv-page--utility grid gap-6">
      <PageHeader
        title={localeLabel(
          locale,
          '이용약관',
          'Terms of Service',
          '利用規約',
          '服务条款',
          'Điều khoản Dịch vụ'
        )}
      />
      <TermsDocument />
    </div>
  );
}
