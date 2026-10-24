import { Card, CardContent } from '@/components/ui/card';
import { groupDigits } from '@/lib/money';
import { localeLabel, type Locale } from '@/lib/locale';

export interface LoanExposureSummary {
  readonly currency: 'WLD';
  readonly scope: 'latest-20';
  readonly totalLoans: number;
  readonly activeCount: number;
  readonly overdueCount: number;
  readonly repaidCount: number;
  readonly outstandingAmount: string;
  readonly overdueAmount: string;
}

export function LoanExposureCard({ summary, locale = 'ko' }: { summary: LoanExposureSummary | null; locale?: Locale }) {
  return (
    <Card data-testid="bank-loan-exposure" aria-label={localeLabel(locale, '최근 대출 현황', 'Recent loan exposure', '最近のローン状況', '近期贷款概况')}>
      <CardContent className="space-y-2 py-5">
        <h2 className="font-semibold">{localeLabel(locale, '최근 대출 현황', 'Recent loan exposure', '最近のローン状況', '近期贷款概况')}</h2>
        {!summary || summary.scope !== 'latest-20' ? (
          <p role="status">{localeLabel(locale, '지금은 대출 현황을 조회할 수 없어요.', 'Loan summary is unavailable right now.', '現在ローンの概要を取得できません。', '暂时无法查询贷款概况。')}</p>
        ) : (
          <div className="space-y-2">
            <p className="text-xl font-bold" data-testid="loan-outstanding">{groupDigits(summary.outstandingAmount)} WLD</p>
            <p className="text-sm text-muted-foreground">
              {localeLabel(locale, '상환 중', 'Active', '返済中', '还款中')} {summary.activeCount}{locale === 'ko' ? '건' : ''}
              {' · '}{localeLabel(locale, '연체', 'Overdue', '延滞', '逾期')} {summary.overdueCount}{locale === 'ko' ? '건' : ''}
              {' · '}{localeLabel(locale, '상환 완료', 'Repaid', '完済', '已还清')} {summary.repaidCount}{locale === 'ko' ? '건' : ''}
            </p>
            <p className="text-sm">{localeLabel(locale, '연체 잔액', 'Overdue balance', '延滞残高', '逾期余额')}: {groupDigits(summary.overdueAmount)} WLD</p>
            <p className="text-xs text-muted-foreground">
              {localeLabel(locale, '최근 최대 20건의 기록만 합산합니다. 전체 대출 잔액이나 최종 상환액이 아닙니다.', 'Based on up to 20 recent loans only; not a lifetime balance or payoff quote.', '直近最大20件のみの集計です。全期間の残高や最終返済額ではありません。', '仅汇总最近最多20笔贷款，并非全部余额或最终还款额。')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
