import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Wallet,
  ArrowRightLeft,
  Landmark,
  FileText,
  PieChart,
  ShieldCheck,
  Send,
  History,
  IdCard,
} from 'lucide-react';
import { Amount } from '@/components/amount';
import { EmptyState } from '@/components/empty-state';
import { LiveRefresh } from '@/components/live-refresh';
import { PostingStrip } from '@/components/posting-strip';
import { TruncatedList } from '@/components/truncated-list';
import { TranslatedText as T } from '@/components/translated-text';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { formatMoment, groupDigits } from '@/lib/money';
import { requireMember } from '@/lib/session';
import { CitizenTaxReceiptCard } from '@/components/citizen-tax-receipt-card';
import { PortfolioAllocationRadar } from '@/components/portfolio-allocation-radar';
import { postingAmount, sides } from './sides';
import type { Overview } from './sides';
import { ExportLedgerCsvButton } from './export-ledger-csv';
import {
  BankPanel,
  RewardButtons,
  LoanList,
  MoneyverseId,
  TransferForm,
} from './wallet-forms';
import type { LoanView } from './wallet-forms';
import type { RewardAvailability } from './wallet-forms';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const dynamic = 'force-dynamic';

const LATEST_ON_WALLET = 10;

export const metadata: Metadata = {
  title: '내 지갑 & P2P 간편 송금',
  description: 'WLD 가상 잔액 조회, 원클릭 P2P 송금, 복식부기 원장 거래 내역 및 자산 배분을 한곳에서 관리하는 토스형 내 지갑',
  robots: { index: false, follow: false },
};

export default async function WalletPage() {
  await requireMember();

  const [wallet, loanData, rewardAvailability, portfolioData] = await Promise.all([
    apiOrNull<Overview>('/api/v1/wallet?recent=50'),
    apiOrNull<{ loans: LoanView[] }>('/api/v1/bank/loans'),
    apiOrNull<RewardAvailability>('/api/v1/rewards/availability'),
    apiOrNull<{ holdings: Array<{ current_price: string; quantity: number }> }>('/api/v1/stocks/portfolio'),
  ]);

  if (!wallet) {
    return (
      <div data-page="wallet" className="min-h-screen pb-24 space-y-6">
        <EmptyState
          title={<T korean="지금은 지갑을 불러올 수 없어요." english="Cannot load wallet at this time." />}
          description={<T korean="잠시 후 다시 확인해 주세요." english="Please try again in a few moments." />}
        />
      </div>
    );
  }

  const { balances, recentTransactions, userId } = wallet;
  const loans = loanData?.loans ?? [];

  const stockHoldings = portfolioData?.holdings ?? [];
  const actualStocksValue = stockHoldings.reduce(
    (sum, h) => sum + Math.round((Number(h.current_price) || 0) * (Number(h.quantity) || 0)),
    0
  );

  return (
    <div data-page="wallet" className="min-h-screen pb-24 space-y-6">
      <LiveRefresh />

      {/* 1. 상단 토스형 내 자산 메인 히어로 카드 */}
      <div className="toss-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Wallet className="size-5" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-semibold">내 가상 자산 총액</span>
              <h1 className="text-sm font-bold text-foreground">활동 현금 + 은행 예금 합산</h1>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-muted/60 text-muted-foreground border border-border/50">
            {balances.currency}
          </span>
        </div>

        {/* 큼직한 총 잔액 */}
        <div className="space-y-1">
          <div className="font-fintech text-4xl sm:text-5xl font-black text-foreground tracking-tight">
            <Amount value={balances.totalAvailableAmount} />{' '}
            <span className="text-xl sm:text-2xl font-bold text-muted-foreground">WLD</span>
          </div>
        </div>

        {/* 지갑 세부 잔액 스트립 (활동 현금 vs 은행 예금) */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-muted/20 border border-border/40">
          <div>
            <span className="text-xs text-muted-foreground block">활동 현금 (즉시 사용)</span>
            <span className="font-fintech font-bold text-base sm:text-lg text-primary">
              <Amount value={balances.cash.availableAmount} /> WLD
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">은행 예금 (복리 적립 중)</span>
            <span className="font-fintech font-bold text-base sm:text-lg text-foreground">
              <Amount value={balances.bank.availableAmount} /> WLD
            </span>
          </div>
        </div>

        {/* 일일 보상 수령 바 */}
        <RewardButtons availability={rewardAvailability} />

        {/* 하단 2대 큼직한 퀵 액션 버튼 */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            asChild
            className="h-13 rounded-2xl btn-toss font-black text-sm flex items-center justify-center gap-2 shadow-sm"
          >
            <Link href="#wallet-transfer">
              <Send className="size-4" />
              <span>간편 송금하기</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-13 rounded-2xl font-black text-sm border-border/80 bg-card hover:bg-muted/40 text-foreground flex items-center justify-center gap-2"
          >
            <Link href="/bank">
              <Landmark className="size-4" />
              <span>가상 은행 가기</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. 안전 고지 칩 */}
      <div className="p-3.5 px-4 rounded-2xl bg-muted/20 border border-border/40 text-xs text-muted-foreground flex items-center gap-2">
        <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
        <span>모든 송금 및 잔액 변동은 복식부기 불변 경제 원장에 안전하게 기록됩니다.</span>
      </div>

      {/* 3. 3대 핵심 탭 UI (간편 송금 & 은행, 활동 내역, 자산 배분 & ID) */}
      <Tabs defaultValue="transfer" className="space-y-6">
        <TabsList className="grid grid-cols-3 max-w-md w-full h-11 p-1 bg-muted/60 rounded-xl">
          <TabsTrigger value="transfer" className="rounded-lg text-xs sm:text-sm font-semibold">
            간편 송금 & 입출금
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg text-xs sm:text-sm font-semibold">
            원장 활동 내역
          </TabsTrigger>
          <TabsTrigger value="allocation" className="rounded-lg text-xs sm:text-sm font-semibold">
            자산 배분 & ID
          </TabsTrigger>
        </TabsList>

        {/* 탭 1: P2P 간편 송금 및 은행 창구 */}
        <TabsContent value="transfer" className="space-y-6 focus-visible:outline-none">
          <div id="wallet-transfer" className="scroll-mt-24">
            <TransferForm currency={balances.currency} />
          </div>

          <BankPanel />

          {/* 대출 현황 (진행 중일 경우만 노출) */}
          {loans.length > 0 && (
            <div className="toss-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <h3 className="font-bold text-sm text-foreground">진행 중인 가상 대출</h3>
                <span className="text-xs text-muted-foreground">{loans.length}건</span>
              </div>
              <LoanList loans={loans} />
            </div>
          )}
        </TabsContent>

        {/* 탭 2: 복식부기 원장 최근 활동 내역 */}
        <TabsContent value="history" className="space-y-6 focus-visible:outline-none">
          <div className="toss-card p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <History className="size-4 text-primary" />
                <h3 className="font-bold text-base text-foreground">원장 거래 기록</h3>
              </div>
              <div className="flex items-center gap-2">
                <ExportLedgerCsvButton transactions={recentTransactions} />
                <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                  <Link href="/wallet/activity">전체 내역 보기 →</Link>
                </Button>
              </div>
            </div>

            {recentTransactions.length === 0 ? (
              <EmptyState
                title="아직 기록된 활동이 없어요."
                description="보상을 받거나 WLD를 송금하면 실제 원장 기록이 여기에 표시됩니다."
              />
            ) : (
              <TruncatedList
                title="내 지갑 기록"
                visibleCount={LATEST_ON_WALLET}
                rows={recentTransactions.map((entry) => {
                  const { debit, credit } = sides(entry);
                  return (
                    <PostingStrip
                      key={entry.transactionId}
                      debit={debit}
                      credit={credit}
                      amount={postingAmount(entry)}
                      label={entry.label}
                      at={formatMoment(entry.occurredAt)}
                    />
                  );
                })}
              />
            )}
          </div>
        </TabsContent>

        {/* 탭 3: 자산 배분 레이더, 식별 정보 및 세무 영수증 */}
        <TabsContent value="allocation" className="space-y-6 focus-visible:outline-none">
          <PortfolioAllocationRadar
            cashWld={Number(balances.cash.availableAmount) || 0}
            savingsWld={Number(balances.bank.availableAmount) || 0}
            stocksWld={actualStocksValue}
            bondsWld={0}
          />

          <CitizenTaxReceiptCard />

          <div className="toss-card p-6 space-y-3">
            <div className="flex items-center gap-2">
              <IdCard className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-bold text-foreground">내 머니버스 고유 ID</h3>
            </div>
            <MoneyverseId userId={userId} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
