import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { PrivacyDocument } from '@/components/policy/privacy-document';
import { getServerLocale } from '@/lib/locale-server';
import { localeLabel } from '@/lib/locale';
import { canonicalUrl } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return {
    title: localeLabel(locale, '개인정보처리방침', 'Privacy Policy', 'プライバシーポリシー', '隐私政策', 'Chính sách Quyền riêng tư'),
    description: localeLabel(
      locale,
      '월덕 머니버스가 처리하는 개인정보와 이용자의 권리',
      'Privacy Policy and user data protection commitments of Woldeok Moneyverse.',
      'ウォルドク・マネーバースが取り扱う個人情報およびユーザーの権利について。',
      '月德虚拟金融平台个人信息处理规则与用户数据权利说明。',
      'Chính sách bảo vệ quyền riêng tư và dữ liệu người dùng tại Woldeok Moneyverse.'
    ),
    alternates: { canonical: canonicalUrl('/privacy') },
  };
}

export default async function PrivacyPage() {
  const locale = await getServerLocale();
  return (
    <div data-page="privacy" className="mv-page mv-page--utility grid gap-6">
      <PageHeader
        title={localeLabel(
          locale,
          '개인정보처리방침',
          'Privacy Policy',
          'プライバシーポリシー',
          '隐私政策',
          'Chính sách Quyền riêng tư'
        )}
      />
      <PrivacyDocument />
    </div>
  );
}
