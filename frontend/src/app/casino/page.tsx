import type { Metadata } from 'next';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { TranslatedText } from '@/components/translated-text';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api, apiOrNull } from '@/lib/api';
import { compareAmounts, formatMoment, groupDigits } from '@/lib/money';
import { requireMember } from '@/lib/session';
import { CoinPlayForm, DiceNumberForm, DiceParityForm, SelfLimitForm } from './casino-forms';
import { ClosedNotice, PlayOutcome } from './casino-parts';
import { closureOf, multiplierFromPpm, percentFromPpm } from './coin';
import type { CasinoClosure } from './coin';
import { CASINO_TRANSACTION_TYPES, ledgerLabel } from './dice';
import { LuckySlotsGame } from './slots-game';
import { HiLoCardGame } from './hilo-game';

/** One member's stakes and headroom. Never cached, never offered to a crawler. */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '럭키존 (가상 미니게임)',
  robots: { index: false, follow: false },
};

/** public.casino_coin_terms, as backend/src/casino/casino.repository.ts returns it. */
interface CoinTerms {
  readonly enabled: boolean;
  readonly min_stake: string;
  readonly max_stake: string;
  readonly daily_stake_limit: string;
  readonly daily_loss_limit: string;
  readonly daily_stake_used: string;
  readonly daily_loss_used: string;
  readonly remaining_stake: string;
  readonly remaining_loss: string;
  readonly worst_case_loss: string;
  readonly win_probability_ppm: number;
  readonly payout_multiplier_ppm: number;
  readonly house_edge_ppm: number;
  readonly net_win_at_max: string;
}

interface GameTerms {
  readonly game: string;
  readonly min_stake: string;
  readonly max_stake: string;
  readonly worst_case_loss: string;
  readonly remaining_stake: string;
  readonly remaining_loss: string;
  readonly win_probability_ppm: number;
  readonly payout_multiplier_ppm: number;
  readonly net_win_at_max: string;
}

interface CoinFairness {
  readonly trial_id: string | null;
  readonly trials: string | null;
  readonly heads: string | null;
  readonly expected_win_probability_ppm: number | null;
  readonly observed_win_probability_ppm: number | null;
  readonly z_score: string | null;
  readonly tolerance_sigma: string | null;
  readonly created_at: string | null;
}

interface LedgerEntry {
  readonly transactionId: string;
  readonly occurredAt: string;
  readonly type: string;
  readonly netAmount: string;
}

interface WalletOverview {
  readonly recentTransactions: readonly LedgerEntry[];
}

type Loaded<T> =
  | { readonly state: 'ok'; readonly data: T }
  | { readonly state: 'closed'; readonly closure: CasinoClosure }
  | { readonly state: 'unavailable' };

async function loadCasino<T>(path: string): Promise<Loaded<T>> {
  try {
    const data = await api<T>(path);
    return { state: 'ok', data };
  } catch (error: unknown) {
    const closure = closureOf(error);
    if (closure !== null) return { state: 'closed', closure };
    return { state: 'unavailable' };
  }
}

const RECENT_LEDGER = 10;

export default async function CasinoPage() {
  await requireMember();

  const [terms, fairness, games, wallet] = await Promise.all([
    loadCasino<CoinTerms>('/api/v1/casino/coin/terms'),
    loadCasino<CoinFairness>('/api/v1/casino/coin/fairness'),
    loadCasino<GameTerms[]>('/api/v1/casino/games/terms'),
    apiOrNull<WalletOverview>(`/api/v1/wallet?recent=${RECENT_LEDGER}`),
  ]);

  const dice = games.state === 'ok' ? games.data.filter((row) => row.game !== 'coin') : [];
  const parityGame = dice.find((g) => g.game === 'dice_parity');
  const numberGame = dice.find((g) => g.game === 'dice_number');

  const plays = (wallet?.recentTransactions ?? []).filter((entry) =>
    CASINO_TRANSACTION_TYPES.includes(entry.type),
  );

  const closure: CasinoClosure | null =
    terms.state === 'closed'
      ? terms.closure
      : terms.state === 'ok' && !terms.data.enabled
        ? 'disabled'
        : null;

  const open = closure === null && terms.state === 'ok' ? terms.data : null;

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="LUCKY ZONE"
        title={
          <TranslatedText
            korean="럭키존 (가상 미니게임)"
            english="Lucky Zone (Virtual Mini-games)"
          />
        }
      >
        <TranslatedText
          korean="게임 머니(WLD)로 가볍게 즐기는 미니게임 라운지입니다. 무리한 베팅 없이 가볍게 즐겨보세요."
          english="A virtual mini-game lounge using in-game WLD. Enjoy casually and responsibly."
        />
      </PageHeader>

      <Alert>
        <AlertTitle>
          <TranslatedText
            korean="안전한 플레이를 위한 안내"
            english="Play responsibly and within your limits"
          />
        </AlertTitle>
        <AlertDescription>
          <TranslatedText
            korean="모든 게임은 공정한 난수로 결정됩니다. 하루 이용 한도와 손실 한도를 직접 설정하고 안전하게 즐겨보세요."
            english="All games are determined by verifiable random numbers. Please set daily limits to enjoy safely."
          />
        </AlertDescription>
      </Alert>

      {closure !== null ? (
        <ClosedNotice closure={closure} />
      ) : terms.state !== 'ok' ? (
        <EmptyState
          title="미니게임 정보를 불러오지 못했어요."
          description="잠시 후 다시 시도해 주세요."
        />
      ) : null}

      {open && (
        <>
          {/* 오늘 남은 한도 현황 카드 */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">오늘의 이용 한도 현황</CardTitle>
              <CardDescription>하루 동안 사용할 수 있는 베팅 및 손실 한도입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-2 text-sm sm:grid-cols-3 sm:gap-x-6">
                <Fact term="하루 베팅 한도">{groupDigits(open.daily_stake_limit)} WLD</Fact>
                <Fact term="오늘 건 금액">{groupDigits(open.daily_stake_used)} WLD</Fact>
                <Fact term="남은 베팅 한도">{groupDigits(open.remaining_stake)} WLD</Fact>
                <Fact term="하루 손실 한도">{groupDigits(open.daily_loss_limit)} WLD</Fact>
                <Fact term="오늘 잃은 금액">{groupDigits(open.daily_loss_used)} WLD</Fact>
                <Fact term="남은 손실 한도">{groupDigits(open.remaining_loss)} WLD</Fact>
              </dl>
              <div className="mt-4 pt-3 border-t">
                <FairnessNote fairness={fairness} />
              </div>
            </CardContent>
          </Card>

          {/* 5종 미니게임 탭 로비 */}
          <Tabs defaultValue="coin" className="w-full">
            <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full h-auto p-1.5 gap-1.5 bg-muted/60 rounded-xl">
              <TabsTrigger value="coin" className="py-2.5 text-sm font-semibold rounded-lg">
                🪙 동전 뒤집기
              </TabsTrigger>
              <TabsTrigger value="dice_parity" className="py-2.5 text-sm font-semibold rounded-lg">
                🎲 주사위 홀짝
              </TabsTrigger>
              <TabsTrigger value="dice_number" className="py-2.5 text-sm font-semibold rounded-lg">
                🎯 주사위 숫자
              </TabsTrigger>
              <TabsTrigger value="slots" className="py-2.5 text-sm font-semibold rounded-lg">
                🎰 럭키 슬롯
              </TabsTrigger>
              <TabsTrigger value="hilo" className="py-2.5 text-sm font-semibold rounded-lg">
                🃏 하이 앤 로우
              </TabsTrigger>
            </TabsList>

            {/* 1. 동전 뒤집기 */}
            <TabsContent value="coin" className="mt-4 grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">🪙 동전 뒤집기</CardTitle>
                  <CardDescription>
                    앞면과 뒷면 중 하나를 선택합니다. 적중 확률 {percentFromPpm(open.win_probability_ppm)}%, 적중 시 {multiplierFromPpm(open.payout_multiplier_ppm)}배 배당이 지급됩니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CoinPlayForm
                    minStake={open.min_stake}
                    maxStake={open.max_stake}
                    remainingStake={open.remaining_stake}
                    exhausted={
                      compareAmounts(open.remaining_stake, '0') <= 0 ||
                      compareAmounts(open.remaining_loss, '0') <= 0
                    }
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* 2. 주사위 홀짝 */}
            <TabsContent value="dice_parity" className="mt-4 grid gap-6">
              {parityGame ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">🎲 주사위 홀짝 맞추기</CardTitle>
                    <CardDescription>
                      주사위 눈이 홀수인지 짝수인지 예측합니다. 적중 확률 {percentFromPpm(parityGame.win_probability_ppm)}%, 적중 시 {multiplierFromPpm(parityGame.payout_multiplier_ppm)}배 배당이 지급됩니다.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DiceParityForm
                      minStake={parityGame.min_stake}
                      maxStake={parityGame.max_stake}
                      remainingStake={parityGame.remaining_stake}
                      exhausted={
                        compareAmounts(parityGame.remaining_stake, '0') <= 0 ||
                        compareAmounts(parityGame.remaining_loss, '0') <= 0
                      }
                    />
                  </CardContent>
                </Card>
              ) : (
                <EmptyState title="주사위 홀짝 게임을 준비 중입니다." />
              )}
            </TabsContent>

            {/* 3. 주사위 숫자 */}
            <TabsContent value="dice_number" className="mt-4 grid gap-6">
              {numberGame ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">🎯 주사위 숫자 맞추기</CardTitle>
                    <CardDescription>
                      1부터 6까지 정확한 주사위 눈을 맞춥니다. 적중 확률 {percentFromPpm(numberGame.win_probability_ppm)}%, 적중 시 {multiplierFromPpm(numberGame.payout_multiplier_ppm)}배 대박 배당이 지급됩니다.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DiceNumberForm
                      minStake={numberGame.min_stake}
                      maxStake={numberGame.max_stake}
                      remainingStake={numberGame.remaining_stake}
                      exhausted={
                        compareAmounts(numberGame.remaining_stake, '0') <= 0 ||
                        compareAmounts(numberGame.remaining_loss, '0') <= 0
                      }
                    />
                  </CardContent>
                </Card>
              ) : (
                <EmptyState title="주사위 숫자 게임을 준비 중입니다." />
              )}
            </TabsContent>

            {/* 4. 럭키 777 슬롯 */}
            <TabsContent value="slots" className="mt-4 grid gap-6">
              <LuckySlotsGame
                minStake={open.min_stake}
                maxStake={open.max_stake}
                exhausted={
                  compareAmounts(open.remaining_stake, '0') <= 0 ||
                  compareAmounts(open.remaining_loss, '0') <= 0
                }
              />
            </TabsContent>

            {/* 5. 하이 앤 로우 */}
            <TabsContent value="hilo" className="mt-4 grid gap-6">
              <HiLoCardGame
                minStake={open.min_stake}
                maxStake={open.max_stake}
                exhausted={
                  compareAmounts(open.remaining_stake, '0') <= 0 ||
                  compareAmounts(open.remaining_loss, '0') <= 0
                }
              />
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* 한도 직접 설정 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>나만의 안전 한도 설정</CardTitle>
          <CardDescription>
            하루 동안 이용할 최대 베팅액과 손실 한도를 직접 설정할 수 있습니다. 0으로 설정하면 해당 항목이 비활성화됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <SelfLimitForm />
        </CardContent>
      </Card>

      {/* 최근 게임 기록 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 게임 기록</CardTitle>
          <CardDescription>
            내 지갑에 기록된 최근 {RECENT_LEDGER}건의 미니게임 결과입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {wallet === null ? (
            <EmptyState title="기록을 불러오지 못했어요." />
          ) : plays.length === 0 ? (
            <EmptyState
              title="아직 게임 기록이 없어요."
              description="게임을 플레이하면 결과가 여기에 표시됩니다."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>시각</TableHead>
                    <TableHead>게임</TableHead>
                    <TableHead className="text-right">결과</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plays.map((play) => (
                    <TableRow key={play.transactionId}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatMoment(play.occurredAt, '기록 확인 중')}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{ledgerLabel(play.type)}</TableCell>
                      <TableCell className="text-right">
                        <PlayOutcome netAmount={play.netAmount} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Fact({ term, children }: { readonly term: string; readonly children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{term}</dt>
      <dd className="tabular">{children}</dd>
    </div>
  );
}

function FairnessNote({ fairness }: { readonly fairness: Loaded<CoinFairness> }) {
  if (fairness.state !== 'ok') {
    return (
      <p className="text-xs text-muted-foreground">
        분포 시험 기록을 지금은 확인할 수 없습니다.
      </p>
    );
  }

  const trial = fairness.data;
  if (trial.trial_id === null || trial.trials === null) {
    return (
      <p className="text-xs text-muted-foreground">
        공개된 분포 시험 기록이 확인되지 않았습니다. 위 확률은 시스템 공식 설정값입니다.
      </p>
    );
  }

  return (
    <p className="text-xs leading-[1.8] text-muted-foreground">
      공정성 검증: {groupDigits(trial.trials)}회 검증 중 앞면 {trial.heads === null ? '—' : groupDigits(trial.heads)}회 관측 (관측 확률 {trial.observed_win_probability_ppm === null ? '—' : `${percentFromPpm(trial.observed_win_probability_ppm)}%`})
    </p>
  );
}