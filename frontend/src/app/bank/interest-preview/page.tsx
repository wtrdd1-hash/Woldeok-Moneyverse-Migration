import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Amount } from '@/components/amount';
import { EmptyState } from '@/components/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiOrNull } from '@/lib/api';
import { getServerLocale } from '@/lib/locale-server';
import { localeLabel } from '@/lib/locale';
import { requireMember } from '@/lib/session';
import { parseInterestClaimPreview } from './interest-preview';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: '가상 은행 이자 수령 미리보기',
  robots: { index: false, follow: false },
};

export default async function InterestPreviewPage() {
  await requireMember();
  const locale = await getServerLocale();
  const preview = parseInterestClaimPreview(
    await apiOrNull<unknown>('/api/v1/banking/claim-interest/preview'),
  );
  return (
    <main data-page="bank-interest-preview" className="mv-page mv-page--finance grid gap-5">
      <Button asChild variant="ghost" className="w-fit">
        <Link href="/bank"><ArrowLeft className="mr-2 size-4" />{localeLabel(locale, '가상 은행으로 돌아가기', 'Back to virtual bank', '銀行へ戻る', '返回虚拟银行')}</Link>
      </Button>
      <h1 className="text-2xl font-bold">{localeLabel(locale, '복리 이자 수령 미리보기', 'Compound interest claim preview', '複利受取プレビュー', '复利领取预览')}</h1>
      {!preview ? (
        <EmptyState title={localeLabel(locale, '실제 이자 정보를 확인할 수 없습니다.', 'Verified interest data is unavailable.', '利息データを確認できません。', '无法验证利息数据。')} />
      ) : (
        <Card>
          <CardHeader><CardTitle>{localeLabel(locale, '현재 조회된 금액', 'Current verified amounts', '現在の金額', '当前已验证金额')}</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <dl className="grid gap-3 sm:grid-cols-3">
              <div><dt className="text-sm text-muted-foreground">{localeLabel(locale, '예금 잔액', 'Deposit balance', '預金残高', '存款余额')}</dt><dd className="font-bold"><Amount value={preview.currentBankBalanceWld} currency /></dd></div>
              <div><dt className="text-sm text-muted-foreground">{localeLabel(locale, '미수령 이자', 'Unclaimed interest', '未受取利息', '未领取利息')}</dt><dd className="font-bold"><Amount value={preview.accruedInterestWld} currency /></dd></div>
              <div><dt className="text-sm text-muted-foreground">{localeLabel(locale, '가정상 수령 후 잔액', 'Hypothetical post-claim balance', '仮の受取後残高', '假设领取后余额')}</dt><dd className="font-bold"><Amount value={preview.hypotheticalBankBalanceWld} currency /></dd></div>
            </dl>
            <p className="text-sm text-muted-foreground">{localeLabel(locale,
              '읽기 전용 미리보기입니다. WLD는 이동하지 않았습니다. 실제 수령 시 서버가 이자, 예치 시간 및 정책을 다시 확인하므로 금액이나 수령 가능 여부가 달라질 수 있습니다.',
              'Read-only preview. No WLD moved. The server rechecks interest, holding time and policy when claiming; the amount and eligibility may change.',
              '読み取り専用のプレビューです。WLDの移動はありません。受取時に再検証されます。',
              '此为只读预览，未转移WLD。实际领取时服务器会重新验证。')}</p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
