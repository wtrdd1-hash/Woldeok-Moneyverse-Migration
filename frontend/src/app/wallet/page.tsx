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
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { apiOrNull } from '@/lib/api';
import { PageHeader } from '@/components/page-header';
import { StatRow } from '@/components/d180/primitives';
import { readWalletOverview } from '@/lib/wallet-overview';
import { formatMoment, groupDigits } from '@/lib/money';
import { requireMember } from '@/lib/session';
import { pick } from '@/lib/copy';
import { getServerLocale } from '@/lib/locale-server';
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
import { COPY, fill } from './copy';

const TradeDialog = dynamicImport(
  () => import('../stocks/trade-dialog').then((mod) => mod.TradeDialog),
);

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return {
    title: pick(locale, COPY.metaTitle),
    description: pick(locale, COPY.metaDescription),
    robots: { index: false, follow: false },
  };
}

const LATEST_ON_WALLET = 10;

function signedPercent(bpsText: string): string {
  const bps = Number(bpsText);
  if (!Number.isSafeInteger(bps)) return '—';
  const prefix = bps > 0 ? '+' : bps < 0 ? '−' : '';
  return `${prefix}${(Math.abs(bps) / 100).toLocaleString('ko-KR', { maximumFractionDigits: 2 })}%`;
}

export default async function WalletPage() {
  await requireMember();
  const locale = await getServerLocale();
  const t = (copy: (typeof COPY)[keyof typeof COPY]) => pick(locale, copy);

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
          title={t(COPY.loadErrorTitle)}
          description={t(COPY.loadErrorDescription)}
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
          did not answer is shown as unavailable, never 0, and is left out of the total. */}
      <PageHeader title={t(COPY.title)}>{t(COPY.intro)}</PageHeader>
      <StatRow
        label={t(COPY.summaryLabel)}
        items={[
          {
            label: stocksKnown ? t(COPY.totalAssets) : t(COPY.cashPlusDeposits),
            value: <>{groupDigits(grandTotalAmount.toString())} <span className="text-sm font-medium text-[var(--g1-muted)]">WLD</span></>,
            note: stocksKnown ? t(COPY.totalNote) : t(COPY.stocksExcludedNote),
          },
          { label: t(COPY.activeCash), value: <><Amount value={balances.cash.availableAmount} /> WLD</>, note: t(COPY.activeCashNote) },
          { label: t(COPY.bankDeposits), value: <><Amount value={balances.bank.availableAmount} /> WLD</>, note: t(COPY.bankDepositsNote) },
          {
            label: t(COPY.stockValue),
            value: stocksKnown ? <>{groupDigits(actualStocksValue.toString())} WLD</> : null,
            tone: isStockProfit ? 'rise' : isStockLoss ? 'fall' : undefined,
            note: stockAnalysis ? fill(t(COPY.unrealizedPnl), { pct: signedPercent(stockAnalysis.total_gain_loss_bps) }) : stocksKnown ? t(COPY.noStocksNote) : undefined,
          },
        ]}
      />

      <div className="toss-card p-6 sm:p-8 space-y-6">
        {/* Daily reward bar */}
        <RewardButtons availability={rewardAvailability} />

        {/* Three large quick-action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <Button
            asChild
            className="min-h-[48px] h-12 rounded-2xl btn-toss font-black text-sm flex items-center justify-center gap-2 shadow-sm"
          >
            <Link href="#wallet-transfer">
              <Send className="size-4" />
              <span>{t(COPY.quickTransfer)}</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="min-h-[48px] h-12 rounded-2xl font-black text-sm border-border/80 bg-card hover:bg-muted/40 text-foreground flex items-center justify-center gap-2"
          >
            <Link href="/bank">
              <Landmark className="size-4" />
              <span>{t(COPY.goBank)}</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="min-h-[48px] h-12 rounded-2xl font-black text-sm border-border/80 bg-card hover:bg-muted/40 text-foreground flex items-center justify-center gap-2"
          >
            <Link href="/stocks">
              <TrendingUp className="size-4 text-emerald-500" />
              <span>{t(COPY.goExchange)}</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Ledger safety notice */}
      <div className="p-3.5 px-4 rounded-2xl bg-muted/20 border border-border/40 text-xs text-muted-foreground flex items-center gap-2">
        <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
        <span>{t(COPY.ledgerNotice)}</span>
      </div>

      {/* 3. Held virtual stocks with sell / buy-more controls */}
      <div className="toss-card p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <TrendingUp className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-foreground">{t(COPY.myStocks)}</h2>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {fill(t(COPY.stockCount), { n: String(stockHoldings.length) })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t(COPY.myStocksHint)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="min-h-[44px] sm:min-h-[36px] text-xs font-semibold gap-1">
              <Link href="/stocks/portfolio">
                <span>{t(COPY.portfolioAnalysis)}</span>
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
              <p className="text-sm font-bold text-foreground">{t(COPY.noStocks)}</p>
              <p className="text-xs text-muted-foreground">
                {t(COPY.noStocksHint)}
              </p>
            </div>
            <Button asChild className="btn-toss h-10 px-4 text-xs font-bold rounded-xl mt-2">
              <Link href="/stocks">{t(COPY.buyFirst)}</Link>
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
                  {/* Left: symbol, name, quantity and prices */}
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
                        {fill(t(COPY.allocation), { pct: signedPercent(holding.allocation_bps) })}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-mono tabular-nums min-w-0">
                      <span>
                        {t(COPY.heldLabel)} <strong className="text-foreground">{groupDigits(holding.quantity)}</strong>{t(COPY.sharesUnit)}
                      </span>
                      <span>·</span>
                      <span>
                        {t(COPY.avgCostLabel)} <strong className="text-foreground">{groupDigits(holding.average_cost)}</strong> WLD
                      </span>
                      <span>·</span>
                      <span>
                        {t(COPY.currentPriceLabel)} <strong className="text-foreground">{groupDigits(holding.current_price)}</strong> WLD
                      </span>
                    </div>
                  </div>

                  {/* Right: market value, gain/loss and one-tap sell / buy */}
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
                      {/* Instant sell dialog */}
                      <TradeDialog
                        stockId={holding.stock_id}
                        symbol={holding.symbol}
                        name={holding.name}
                        currentPrice={holding.current_price}
                        holdingQuantity={holding.quantity}
                        side="sell"
                        triggerLabel={t(COPY.sell)}
                        triggerVariant="trading-sell"
                        triggerClassName="min-h-[44px] sm:min-h-[38px] px-3.5 text-xs font-bold font-mono tabular-nums"
                      />

                      {/* Buy-more dialog */}
                      <TradeDialog
                        stockId={holding.stock_id}
                        symbol={holding.symbol}
                        name={holding.name}
                        currentPrice={holding.current_price}
                        available={balances.cash.availableAmount}
                        side="buy"
                        triggerLabel={t(COPY.buyMore)}
                        triggerVariant="trading-buy"
                        triggerClassName="min-h-[44px] sm:min-h-[38px] px-3.5 text-xs font-bold font-mono tabular-nums"
                      />

                      {/* Stock hub deep link */}
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="min-h-[44px] min-w-[44px] sm:min-h-[38px] sm:min-w-[38px] px-2 text-muted-foreground hover:text-foreground"
                        title={t(COPY.openStockHub)}
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

      {/* 4. Three tabs: transfer & bank, ledger activity, allocation & ID */}
      <Tabs defaultValue="transfer" className="space-y-6">
        <TabsList className="grid grid-cols-3 max-w-md w-full h-11 p-1 bg-muted/60 rounded-xl">
          <TabsTrigger value="transfer" className="rounded-lg text-xs sm:text-sm font-semibold">
            {t(COPY.tabTransfer)}
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg text-xs sm:text-sm font-semibold">
            {t(COPY.tabHistory)}
          </TabsTrigger>
          <TabsTrigger value="allocation" className="rounded-lg text-xs sm:text-sm font-semibold">
            {t(COPY.tabAllocation)}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: P2P transfer and bank counter */}
        <TabsContent value="transfer" className="space-y-6 focus-visible:outline-none">
          <div id="wallet-transfer" className="scroll-mt-24">
            <TransferForm key={userId} currency={balances.currency} userId={userId} />
          </div>

          <BankPanel />

          {/* Loans, shown only while one is open */}
          {loans.length > 0 && (
            <div className="toss-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <h3 className="font-bold text-sm text-foreground">{t(COPY.activeLoans)}</h3>
                <span className="text-xs text-muted-foreground">{fill(t(COPY.loanCount), { n: String(loans.length) })}</span>
              </div>
              <LoanList loans={loans} />
            </div>
          )}
        </TabsContent>

        {/* Tab 2: recent double-entry ledger activity */}
        <TabsContent value="history" className="space-y-6 focus-visible:outline-none">
          <div className="toss-card p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <History className="size-4 text-primary" />
                <h3 className="font-bold text-base text-foreground">{t(COPY.ledgerRecords)}</h3>
              </div>
              <div className="flex items-center gap-2">
                <ExportLedgerCsvButton transactions={recentTransactions} />
                <Button asChild variant="outline" size="sm" className="min-h-[44px] sm:min-h-[36px] text-xs font-semibold">
                  <Link href="/wallet/activity">{t(COPY.moreRecords)}</Link>
                </Button>
              </div>
            </div>

            {recentTransactions.length === 0 ? (
              <EmptyState
                title={t(COPY.noActivity)}
                description={t(COPY.noActivityHint)}
              />
            ) : (
              <TruncatedList
                title={t(COPY.walletRecords)}
                visibleCount={LATEST_ON_WALLET}
                rows={recentTransactions.map((entry) => {
                  const { debit, credit } = sides(entry, locale);
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

        {/* Tab 3: allocation radar, identity and tax receipt */}
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
              <h3 className="text-sm font-bold text-foreground">{t(COPY.moneyverseId)}</h3>
            </div>
            <MoneyverseId userId={userId} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
