import type { Metadata } from 'next';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { TranslatedText, TranslatedText as T } from '@/components/translated-text';
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
import { formatMoment, groupDigits } from '@/lib/money';
import { requireMember, isLoggedInMember } from '@/lib/session';
import { CasinoGuestView } from './casino-guest-view';
import { CoinPlayForm, DiceNumberForm, DiceParityForm, SelfLimitForm } from './casino-forms';
import { ClosedNotice, PlayOutcome } from './casino-parts';
import { closureOf, multiplierFromPpm, percentFromPpm } from './coin';
import type { CasinoClosure } from './coin';
import { CASINO_TRANSACTION_TYPES, ledgerLabel } from './dice';
import { LuckySlotsGame } from './slots-game';
import { HiLoCardGame } from './hilo-game';
import { ThemeGameCard } from './theme-games';

/** One member's stakes and headroom. Never cached, never offered to a crawler. */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '럭키존 (가상 미니게임) — 동전·주사위·테마 게임',
  description:
    '동전·주사위 기반 서버 게임과 슬롯·하이로우 테마 화면을 일일 이용 한도 안에서 즐기는 WLD 가상 미니게임입니다.',
  robots: { index: true, follow: true },
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

interface SelfLimit {
  readonly daily_bet_limit: string;
  readonly daily_loss_limit: string;
  readonly locked_until: string | null;
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
  const isMember = await isLoggedInMember();
  if (!isMember) {
    return <CasinoGuestView />;
  }
  await requireMember();

  const [terms, fairness, games, wallet, selfLimit] = await Promise.all([
    loadCasino<CoinTerms>('/api/v1/casino/coin/terms'),
    loadCasino<CoinFairness>('/api/v1/casino/coin/fairness'),
    loadCasino<GameTerms[]>('/api/v1/casino/games/terms'),
    apiOrNull<WalletOverview>(`/api/v1/wallet?recent=${RECENT_LEDGER}`),
    apiOrNull<SelfLimit>('/api/v1/casino/self-limit'),
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
  const userStakeRemaining =
    open && selfLimit && selfLimit.daily_bet_limit !== '0'
      ? remaining(selfLimit.daily_bet_limit, open.daily_stake_used)
      : null;
  const userLossRemaining =
    open && selfLimit && selfLimit.daily_loss_limit !== '0'
      ? remaining(selfLimit.daily_loss_limit, open.daily_loss_used)
      : null;
  const exhausted = userStakeRemaining === '0' || userLossRemaining === '0';

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
            korean="시스템의 일일 이용 상한은 없습니다. 원한다면 나만의 베팅·손실 한도를 직접 설정할 수 있으며 모든 결과는 서버에서 정산됩니다."
            english="There is no platform daily cap. You can opt into your own stake and loss limits; every result is settled by the server."
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
              <CardTitle className="text-base font-semibold">
                <T korean="오늘의 이용 현황" english="Today's Gaming" />
              </CardTitle>
              <CardDescription>
                <T
                  korean="시스템 상한 없이 이용하며, 사용자가 설정한 자가 한도만 적용됩니다."
                  english="No platform cap applies; only limits you choose are enforced."
                />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-2 text-sm sm:grid-cols-3 sm:gap-x-6">
                <Fact term={<T korean="내 베팅 한도" english="My Stake Limit" />}>
                  {limitLabel(selfLimit?.daily_bet_limit)}
                </Fact>
                <Fact term={<T korean="오늘 건 금액" english="Today Stake Used" />}>
                  {groupDigits(open.daily_stake_used)} WLD
                </Fact>
                <Fact term={<T korean="남은 베팅 한도" english="Remaining Stake" />}>
                  {remainingLabel(userStakeRemaining)}
                </Fact>
                <Fact term={<T korean="내 손실 한도" english="My Loss Limit" />}>
                  {limitLabel(selfLimit?.daily_loss_limit)}
                </Fact>
                <Fact term={<T korean="오늘 잃은 금액" english="Today Loss Used" />}>
                  {groupDigits(open.daily_loss_used)} WLD
                </Fact>
                <Fact term={<T korean="남은 손실 한도" english="Remaining Loss" />}>
                  {remainingLabel(userLossRemaining)}
                </Fact>
              </dl>
              <div className="mt-4 pt-3 border-t">
                <FairnessNote fairness={fairness} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                <T korean="게임별 확률·배당 공개" english="Published Odds and Payouts" />
              </CardTitle>
              <CardDescription>
                <T
                  korean="실제 서버 정산에 사용하는 공식 설정값입니다. 슬롯은 주사위 숫자, 하이로우는 주사위 홀짝 규칙을 사용합니다."
                  english="These are the official server settlement settings. Slots use dice-number rules and Hi-Lo uses dice-parity rules."
                />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <T korean="게임" english="Game" />
                      </TableHead>
                      <TableHead className="text-right">
                        <T korean="적중 확률" english="Win chance" />
                      </TableHead>
                      <TableHead className="text-right">
                        <T korean="적중 배당" english="Payout" />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <OddsRow name="동전 뒤집기" terms={open} />
                    {parityGame ? (
                      <OddsRow name="주사위 홀짝 · 하이로우" terms={parityGame} />
                    ) : null}
                    {numberGame ? (
                      <OddsRow name="주사위 숫자 · 럭키 슬롯" terms={numberGame} />
                    ) : null}
                  </TableBody>
                </Table>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                WLD는 사이트 안에서만 사용하는 가상 게임 머니이며 현금 교환·환전·출금이
                불가능합니다.
              </p>
            </CardContent>
          </Card>

          {/* 3개 서버 규칙과 2개 테마 인터페이스 */}
          <Tabs defaultValue="coin" className="min-w-0 w-full space-y-6">
            <div className="sticky top-[70px] z-20 -mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
              <TabsList className="inline-flex h-auto min-w-max gap-1 rounded-2xl border border-slate-800/80 bg-slate-900/90 p-2 shadow-lg backdrop-blur-md">
                <TabsTrigger value="coin" className="py-2.5 text-sm font-semibold rounded-lg">
                  🪙 <T korean="동전 뒤집기" english="Coin Flip" />
                </TabsTrigger>
                <TabsTrigger
                  value="dice_parity"
                  className="py-2.5 text-sm font-semibold rounded-lg"
                >
                  🎲 <T korean="주사위 홀짝" english="Dice Parity" />
                </TabsTrigger>
                <TabsTrigger
                  value="dice_number"
                  className="py-2.5 text-sm font-semibold rounded-lg"
                >
                  🎯 <T korean="주사위 숫자" english="Dice Number" />
                </TabsTrigger>
                <TabsTrigger value="slots" className="py-2.5 text-sm font-semibold rounded-lg">
                  🎰 <T korean="럭키 슬롯" english="Lucky Slots" />
                </TabsTrigger>
                <TabsTrigger value="hilo" className="py-2.5 text-sm font-semibold rounded-lg">
                  🃏 <T korean="하이 앤 로우" english="Hi-Lo Cards" />
                </TabsTrigger>
                <TabsTrigger value="wheel" className="py-2.5 text-sm font-semibold rounded-lg">
                  🎡 컬러 휠
                </TabsTrigger>
                <TabsTrigger value="treasure" className="py-2.5 text-sm font-semibold rounded-lg">
                  🗝️ 보물 상자
                </TabsTrigger>
                <TabsTrigger value="gems" className="py-2.5 text-sm font-semibold rounded-lg">
                  💎 럭키 젬
                </TabsTrigger>
              </TabsList>
            </div>

            {/* 1. 동전 뒤집기 */}
            <TabsContent value="coin" className="mt-6 pt-2 grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    🪙 <T korean="동전 뒤집기" english="Coin Flip" />
                  </CardTitle>
                  <CardDescription>
                    앞면과 뒷면 중 하나를 선택합니다. 적중 확률{' '}
                    {percentFromPpm(open.win_probability_ppm)}%, 적중 시{' '}
                    {multiplierFromPpm(open.payout_multiplier_ppm)}배 배당이 지급됩니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CoinPlayForm
                    minStake={open.min_stake}
                    maxStake={open.max_stake}
                    remainingStake={open.remaining_stake}
                    exhausted={exhausted}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* 2. 주사위 홀짝 */}
            <TabsContent value="dice_parity" className="mt-6 pt-2 grid gap-6">
              {parityGame ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      🎲 <T korean="주사위 홀짝 맞추기" english="Dice Parity Guess" />
                    </CardTitle>
                    <CardDescription>
                      주사위 눈이 홀수인지 짝수인지 예측합니다. 적중 확률{' '}
                      {percentFromPpm(parityGame.win_probability_ppm)}%, 적중 시{' '}
                      {multiplierFromPpm(parityGame.payout_multiplier_ppm)}배 배당이 지급됩니다.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DiceParityForm
                      minStake={parityGame.min_stake}
                      maxStake={parityGame.max_stake}
                      remainingStake={parityGame.remaining_stake}
                      exhausted={exhausted}
                    />
                  </CardContent>
                </Card>
              ) : (
                <EmptyState title="주사위 홀짝 게임을 준비 중입니다." />
              )}
            </TabsContent>

            {/* 3. 주사위 숫자 */}
            <TabsContent value="dice_number" className="mt-6 pt-2 grid gap-6">
              {numberGame ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      🎯 <T korean="주사위 숫자 맞추기" english="Dice Number Guess" />
                    </CardTitle>
                    <CardDescription>
                      1부터 6까지 정확한 주사위 눈을 맞춥니다. 적중 확률{' '}
                      {percentFromPpm(numberGame.win_probability_ppm)}%, 적중 시{' '}
                      {multiplierFromPpm(numberGame.payout_multiplier_ppm)}배 대박 배당이
                      지급됩니다.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DiceNumberForm
                      minStake={numberGame.min_stake}
                      maxStake={numberGame.max_stake}
                      remainingStake={numberGame.remaining_stake}
                      exhausted={exhausted}
                    />
                  </CardContent>
                </Card>
              ) : (
                <EmptyState title="주사위 숫자 게임을 준비 중입니다." />
              )}
            </TabsContent>

            {/* 4. 럭키 777 슬롯 */}
            <TabsContent value="slots" className="mt-6 pt-2 grid gap-6">
              <LuckySlotsGame
                minStake={open.min_stake}
                maxStake={open.max_stake}
                exhausted={exhausted}
              />
            </TabsContent>

            {/* 5. 하이 앤 로우 */}
            <TabsContent value="hilo" className="mt-6 pt-2 grid gap-6">
              <HiLoCardGame
                minStake={open.min_stake}
                maxStake={open.max_stake}
                exhausted={exhausted}
              />
            </TabsContent>

            <TabsContent value="wheel" className="mt-6 pt-2">
              <ThemeGameCard
                game="wheel"
                minStake={open.min_stake}
                maxStake={open.max_stake}
                exhausted={exhausted}
              />
            </TabsContent>
            <TabsContent value="treasure" className="mt-6 pt-2">
              <ThemeGameCard
                game="treasure"
                minStake={open.min_stake}
                maxStake={open.max_stake}
                exhausted={exhausted}
              />
            </TabsContent>
            <TabsContent value="gems" className="mt-6 pt-2">
              <ThemeGameCard
                game="gems"
                minStake={open.min_stake}
                maxStake={open.max_stake}
                exhausted={exhausted}
              />
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* 한도 직접 설정 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>
            <T korean="나만의 안전 한도 설정" english="Responsible Gaming Self-Limits" />
          </CardTitle>
          <CardDescription>
            <T
              korean="하루 동안 이용할 최대 베팅액과 손실 한도를 직접 설정할 수 있습니다. 0으로 설정하면 해당 항목이 비활성화됩니다."
              english="Configure your daily maximum stake and loss limits. Setting 0 leaves the limit unbound."
            />
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <SelfLimitForm />
        </CardContent>
      </Card>

      {/* 최근 게임 기록 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>
            <T korean="최근 게임 기록" english="Recent Gaming History" />
          </CardTitle>
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

function Fact({
  term,
  children,
}: {
  readonly term: React.ReactNode;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{term}</dt>
      <dd className="tabular">{children}</dd>
    </div>
  );
}

function remaining(limit: string, used: string): string {
  const value = BigInt(limit) - BigInt(used);
  return value > 0n ? value.toString() : '0';
}

function limitLabel(limit: string | undefined): string {
  return !limit || limit === '0' ? '무제한' : `${groupDigits(limit)} WLD`;
}

function remainingLabel(value: string | null): string {
  return value === null ? '무제한' : `${groupDigits(value)} WLD`;
}

function OddsRow({
  name,
  terms,
}: {
  readonly name: string;
  readonly terms: Pick<GameTerms, 'win_probability_ppm' | 'payout_multiplier_ppm'>;
}) {
  return (
    <TableRow>
      <TableCell>{name}</TableCell>
      <TableCell className="text-right tabular-nums">
        {percentFromPpm(terms.win_probability_ppm)}%
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {multiplierFromPpm(terms.payout_multiplier_ppm)}배
      </TableCell>
    </TableRow>
  );
}

function FairnessNote({ fairness }: { readonly fairness: Loaded<CoinFairness> }) {
  if (fairness.state !== 'ok') {
    return (
      <p className="text-xs text-muted-foreground">분포 시험 기록을 지금은 확인할 수 없습니다.</p>
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
      공정성 검증: {groupDigits(trial.trials)}회 검증 중 앞면{' '}
      {trial.heads === null ? '—' : groupDigits(trial.heads)}회 관측 (관측 확률{' '}
      {trial.observed_win_probability_ppm === null
        ? '—'
        : `${percentFromPpm(trial.observed_win_probability_ppm)}%`}
      )
    </p>
  );
}
