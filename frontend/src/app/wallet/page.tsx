import type { Metadata } from 'next';
import Link from 'next/link';
import dynamicImport from 'next/dynamic';
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
  TrendingUp,
  TrendingDown,
  ExternalLink,
  ChevronRight,
  Layers,
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
import { PageHeader } from '@/components/page-header';
import { StatRow } from '@/components/d180/primitives';
import { readWalletOverview } from '@/lib/wallet-overview';
import { formatMoment, groupDigits } from '@/lib/money';
import { requireMember } from '@/lib/session';
import { CitizenTaxReceiptCard } from '@/components/citizen-tax-receipt-card';
import { PortfolioAllocationRadar } from '@/components/portfolio-allocation-radar';
import { sides } from './sides';
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
import { analyzePortfolio, type PortfolioHoldingInput } from '../stocks/portfolio/analysis';

const TradeDialog = dynamicImport(
  () => import('../stocks/trade-dialog').then((mod) => mod.TradeDialog),
);

export const metadata: Metadata = {
  title: '내 지갑 — 실시간 가상 자산 대시보드 및 주식 관리',
  description: '현금, 은행 예금, 가상 주식 포트폴리오를 한눈에 확인하고 즉시 송금, 입출금 및 주식 매도를 수행합니다.',
  robots: { index: false, follow: false },
};

const LATEST_ON_WALLET = 10;

function signedPercent(bpsText: string): string {
  const bps = Number(bpsText);
  if (!Number.isSafeInteger(bps)) return '—';
  const prefix = bps > 0 ? '+' : bps < 0 ? '−' : '';
  return `${prefix}${(Math.abs(bps) / 100).toLocaleString('ko-KR', { maximumFractionDigits: 2 })}%`;
}

export default async function WalletPage() {
  await requireMember();

  const [walletRaw, loanData, rewardAvailability, portfolioData] = await Promise.all([
    apiOrNull<unknown>('/api/v1/wallet?recent=50'),
    apiOrNull<{ loans: LoanView[] }>('/api/v1/bank/loans'),
    apiOrNull<RewardAvailability>('/api/v1/rewards/availability'),
    apiOrNull<{ holdings: PortfolioHoldingInput[] }>('/api/v1/stocks/portfolio'),
  ]);

  const wallet: Overview | null = readWalletOverview(walletRaw);
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
  let stockAnalysis: ReturnType<typeof analyzePortfolio> | null = null;
  if (stockHoldings.length > 0) {
    try {
      stockAnalysis = analyzePortfolio(stockHoldings);
    } catch {
      stockAnalysis = null;
    }
  }

  const actualStocksValue = stockAnalysis ? BigInt(stockAnalysis.total_market_value) : 0n;
  const totalGainLossBps = stockAnalysis ? Number(stockAnalysis.total_gain_loss_bps) : 0;
  const isStockProfit = stockAnalysis ? BigInt(stockAnalysis.total_unrealized_gain_loss) > 0n : false;
  const isStockLoss = stockAnalysis ? BigInt(stockAnalysis.total_unrealized_gain_loss) < 0n : false;

  const cashAvailable = BigInt(balances.cash.availableAmount || '0');
  const bankAvailable = BigInt(balances.bank.availableAmount || '0');
  // portfolioData null = the API did not answer; [] holdings = verified none.
  const stocksKnown = portfolioData !== null && (stockHoldings.length === 0 || stockAnalysis !== null);
  const grandTotalAmount = cashAvailable + bankAvailable + (stocksKnown ? actualStocksValue : 0n);

  return (
    <div data-page="wallet" className="min-h-screen pb-24 space-y-6">
      <LiveRefresh />

      {/* DESIGN180 page head + one StatRow (QA 2026-11-25). A portfolio the API
          did not answer is 확인 불가, never 0, and is left out of the total. */}
      <PageHeader title="지갑">원장에 기록된 현금과 은행 예금, 보유 주식 평가액입니다.</PageHeader>
      <StatRow
        label="내 자산 요약"
        items={[
          {
            label: stocksKnown ? '총 자산' : '현금 + 예금',
            value: <>{groupDigits(grandTotalAmount.toString())} <span className="text-sm font-medium text-[var(--g1-muted)]">WLD</span></>,
            note: stocksKnown ? '현금 + 예금 + 주식 평가액' : '주식 평가액을 확인하지 못해 제외했어요',
          },
          { label: '활동 현금', value: <><Amount value={balances.cash.availableAmount} /> WLD</>, note: '즉시 사용 가능' },
          { label: '은행 예금', value: <><Amount value={balances.bank.availableAmount} /> WLD</>, note: '은행 금고에 예치' },
          {
            label: '주식 평가액',
            value: stocksKnown ? <>{groupDigits(actualStocksValue.toString())} WLD</> : null,
            tone: isStockProfit ? 'rise' : isStockLoss ? 'fall' : undefined,
            note: stockAnalysis ? `평가 손익 ${signedPercent(stockAnalysis.total_gain_loss_bps)}` : stocksKnown ? '보유 주식 없음' : undefined,
          },
        ]}
      />

      <div className="toss-card p-6 sm:p-8 space-y-6">
        {/* 일일 보상 수령 바 */}
        <RewardButtons availability={rewardAvailability} />

        {/* 하단 3대 큼직한 퀵 액션 버튼 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <Button
            asChild
            className="min-h-[48px] h-12 rounded-2xl btn-toss font-black text-sm flex items-center justify-center gap-2 shadow-sm"
          >
            <Link href="#wallet-transfer">
              <Send className="size-4" />
              <span>간편 송금하기</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="min-h-[48px] h-12 rounded-2xl font-black text-sm border-border/80 bg-card hover:bg-muted/40 text-foreground flex items-center justify-center gap-2"
          >
            <Link href="/bank">
              <Landmark className="size-4" />
              <span>가상 은행 가기</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="min-h-[48px] h-12 rounded-2xl font-black text-sm border-border/80 bg-card hover:bg-muted/40 text-foreground flex items-center justify-center gap-2"
          >
            <Link href="/stocks">
              <TrendingUp className="size-4 text-emerald-500" />
              <span>가상 거래소 가기</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. 안전 고지 칩 */}
      <div className="p-3.5 px-4 rounded-2xl bg-muted/20 border border-border/40 text-xs text-muted-foreground flex items-center gap-2">
        <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
        <span>모든 송금 및 주식 체결, 은행 잔액 변동은 복식부기 불변 경제 원장에 안전하게 기록됩니다.</span>
      </div>

      {/* 3. 🔥 핵심 추가: 보유 가상 주식 및 실시간 매도/매수 포트폴리오 카드 */}
      <div className="toss-card p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <TrendingUp className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-foreground">내 보유 주식</h2>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {stockHoldings.length}종목
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                보유 주식을 즉시 매도하여 현금화하거나 추가 매수할 수 있습니다.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="min-h-[44px] sm:min-h-[36px] text-xs font-semibold gap-1">
              <Link href="/stocks/portfolio">
                <span>포트폴리오 정밀 분석</span>
                <ChevronRight className="size-3" />
              </Link>
            </Button>
          </div>
        </div>

        {stockHoldings.length === 0 ? (
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto size-12 rounded-2xl bg-muted/40 flex items-center justify-center text-muted-foreground">
              <TrendingUp className="size-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">보유 중인 주식이 없습니다.</p>
              <p className="text-xs text-muted-foreground">
                가상 주식 거래소에서 상장 종목을 확인하고 첫 투자를 시작해 보세요!
              </p>
            </div>
            <Button asChild className="btn-toss h-10 px-4 text-xs font-bold rounded-xl mt-2">
              <Link href="/stocks">가상 거래소에서 주식 사기 →</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {stockAnalysis?.holdings.map((holding) => {
              const gainLossNum = BigInt(holding.unrealized_gain_loss);
              const isProfit = gainLossNum > 0n;
              const isLoss = gainLossNum < 0n;

              return (
                <div
                  key={holding.stock_id}
                  className="py-4 first:pt-1 last:pb-1 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* 좌측: 종목 심볼, 이름, 보유 수량 및 단가 */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-muted/60 text-foreground border border-border/50">
                        {holding.symbol}
                      </span>
                      <Link
                        href={`/stocks/${encodeURIComponent(holding.symbol)}`}
                        className="font-bold text-sm text-foreground hover:text-primary transition-colors flex items-center gap-1 group"
                      >
                        <span>{holding.name}</span>
                        <ExternalLink className="size-3 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <span className="text-xs font-mono text-muted-foreground">
                        비중 {signedPercent(holding.allocation_bps)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-mono tabular-nums min-w-0">
                      <span>
                        보유: <strong className="text-foreground">{groupDigits(holding.quantity)}</strong>주
                      </span>
                      <span>·</span>
                      <span>
                        평단가: <strong className="text-foreground">{groupDigits(holding.average_cost)}</strong> WLD
                      </span>
                      <span>·</span>
                      <span>
                        현재가: <strong className="text-foreground">{groupDigits(holding.current_price)}</strong> WLD
                      </span>
                    </div>
                  </div>

                  {/* 우측: 평가금액, 손익 및 원터치 매도/매수 버튼 */}
                  <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 sm:gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-border/30 shrink-0">
                    <div className="text-left md:text-right font-mono">
                      <div className="text-sm sm:text-base font-extrabold text-foreground tabular-nums">
                        {groupDigits(holding.market_value)} <span className="text-xs font-normal text-muted-foreground">WLD</span>
                      </div>
                      <div
                        className={`text-xs font-bold tabular-nums ${
                          isProfit
                            ? 'text-red-600 dark:text-red-400'
                            : isLoss
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {isProfit ? '+' : ''}
                        {groupDigits(holding.unrealized_gain_loss)} WLD ({signedPercent(holding.gain_loss_bps)})
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {/* 🔥 즉시 매도 다이얼로그 (판매) */}
                      <TradeDialog
                        stockId={holding.stock_id}
                        symbol={holding.symbol}
                        name={holding.name}
                        currentPrice={holding.current_price}
                        holdingQuantity={holding.quantity}
                        side="sell"
                        triggerLabel="매도"
                        triggerVariant="trading-sell"
                        triggerClassName="min-h-[44px] sm:min-h-[38px] px-3.5 text-xs font-bold font-mono tabular-nums"
                      />

                      {/* 추가 매수 다이얼로그 */}
                      <TradeDialog
                        stockId={holding.stock_id}
                        symbol={holding.symbol}
                        name={holding.name}
                        currentPrice={holding.current_price}
                        available={balances.cash.availableAmount}
                        side="buy"
                        triggerLabel="추가 매수"
                        triggerVariant="trading-buy"
                        triggerClassName="min-h-[44px] sm:min-h-[38px] px-3.5 text-xs font-bold font-mono tabular-nums"
                      />

                      {/* 종목 허브 딥링크 */}
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="min-h-[44px] min-w-[44px] sm:min-h-[38px] sm:min-w-[38px] px-2 text-muted-foreground hover:text-foreground"
                        title="종목 허브 상세로 이동"
                      >
                        <Link href={`/stocks/${encodeURIComponent(holding.symbol)}`}>
                          <ExternalLink className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. 3대 핵심 탭 UI (간편 송금 & 은행, 활동 내역, 자산 배분 & ID) */}
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
            <TransferForm key={userId} currency={balances.currency} userId={userId} />
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
                <Button asChild variant="outline" size="sm" className="min-h-[44px] sm:min-h-[36px] text-xs font-semibold">
                  <Link href="/wallet/activity">최근 기록 더 보기 →</Link>
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
                      amount={entry.netAmount}
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
            stocksWld={Number(actualStocksValue)}
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
