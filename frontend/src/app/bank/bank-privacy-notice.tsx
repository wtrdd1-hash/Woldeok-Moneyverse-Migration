import type { Locale } from '@/lib/locale';
import { localeLabel } from '@/lib/locale';

/** Bank balances and credit evidence are private member data, not a public feed. */
export function BankPrivacyNotice({ locale }: { locale: Locale }) {
  return (
    <p className="text-xs text-muted-foreground" role="note">
      {localeLabel(
        locale,
        '대출과 신용정보는 로그인한 본인만 조회할 수 있습니다.',
        'Only you can view your loan and credit information while signed in.',
        'ローンと信用情報はログインした本人のみ閲覧できます。',
        '贷款与信用信息仅供已登录的本人查看。',
      )}
    </p>
  );
}
