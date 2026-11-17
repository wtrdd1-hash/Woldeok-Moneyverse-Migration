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
      <section className="rounded-lg border bg-card p-4 text-sm leading-relaxed" aria-label="Google Play Android app scope">
        <h2 className="mb-2 font-semibold">
          {localeLabel(locale, 'Android 앱 적용 안내', 'Official Android App Coverage', 'Android アプリへの適用', 'Android 应用适用范围', 'Áp dụng cho ứng dụng Android')}
        </h2>
        <p>
          {localeLabel(
            locale,
            '본 이용약관은 Google Play에서 배포되는 공식 월덕 머니버스(Woldeok Moneyverse) Android 앱에도 적용됩니다. Android 앱에서 이용하는 계정, 가상 WLD, 지갑, 경제 활동, 커뮤니티 및 보상에는 아래와 동일한 이용 기준이 적용됩니다. WLD는 현금으로 환전할 수 없는 서비스 내 가상 데이터입니다.',
            'These Terms of Service also apply to the official Woldeok Moneyverse Android app distributed through Google Play. The same rules below cover accounts, virtual WLD, wallets, economic activities, community features, and rewards accessed through the Android app. WLD is in-service virtual data and cannot be redeemed for cash.',
            '本利用規約は、Google Play で配信される公式 Woldeok Moneyverse Android アプリにも適用されます。WLD は現金化できないサービス内の仮想データです。',
            '本服务条款同样适用于通过 Google Play 发布的 Woldeok Moneyverse 官方 Android 应用。WLD 为服务内虚拟数据，不可兑换现金。',
            'Các điều khoản này cũng áp dụng cho ứng dụng Android Woldeok Moneyverse chính thức được phát hành qua Google Play. WLD là dữ liệu ảo trong dịch vụ, không thể quy đổi thành tiền mặt.'
          )}
        </p>
      </section>
      <TermsDocument locale={locale} />
    </div>
  );
}
