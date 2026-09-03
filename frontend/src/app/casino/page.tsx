import type { Metadata } from 'next';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
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
import { api, apiOrNull } from '@/lib/api';
import { compareAmounts, formatMoment, groupDigits } from '@/lib/money';
import { requireMember } from '@/lib/session';
import { CoinPlayForm, DiceNumberForm, DiceParityForm, SelfLimitForm } from './casino-forms';
import { ClosedNotice, PlayOutcome } from './casino-parts';
import { closureOf, multiplierFromPpm, percentFromPpm, trimZeros } from './coin';
import type { CasinoClosure } from './coin';
import { CASINO_TRANSACTION_TYPES, gameLabel, ledgerLabel } from './dice';

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
  readonly win_probability_ppm: number;
  readonly payout_multiplier_ppm: number;
  readonly house_edge_ppm: number;
  readonly worst_case_loss: string;
  /** What a winning maximum-stake play pays, net of the stake, after rounding (099). */
  readonly net_win_at_max: string;
}

/**
 * `public.casino_game_terms`, one row per game (100).
 *
 * The same shape as `CoinTerms` with the game's own code beside it, because
 * from 100 the daily allowances are one member's day rather than one game's:
 * `remaining_stake` is the same number on all three rows and spending it on
 * the coin leaves the dice with less.
 */
interface GameTerms extends CoinTerms {
  readonly game: string;
}

/**
 * The disclosed probability and the distribution trial behind it. Every trial
 * column is null until a trial qualifies, which is the state before the game
 * has ever opened.
 */
interface CoinFairness {
  readonly win_probability_ppm: number;
  readonly trial_id: string | null;
  readonly trials: string | null;
  readonly heads: string | null;
  readonly expected_win_probability_ppm: number | null;
  readonly observed_win_probability_ppm: number | null;
  readonly z_score: string | null;
  readonly tolerance_sigma: string | null;
  readonly created_at: string | null;
}

/** The member's own ledger, as /api/v1/wallet reports it. */
interface LedgerEntry {
  readonly transactionId: string;
  readonly type: string;
  readonly netAmount: string;
  readonly occurredAt: string;
}

interface WalletOverview {
  readonly recentTransactions: readonly LedgerEntry[];
}

/** The API's ceiling for that list, so this asks for everything it will give. */
const RECENT_LEDGER = 50;

type Loaded<T> =
  | { readonly state: 'ok'; readonly data: T }
  | { readonly state: 'closed'; readonly closure: CasinoClosure }
  | { readonly state: 'unavailable' };

/**
 * `api` rather than `apiOrNull`, because a closed casino and an unreachable
 * one are different facts and `apiOrNull` flattens both to null.
 *
 * A member who is told "불러오지 못했어요" about a game that is deliberately
 * shut will reload the page until they give up; a member told the game is not
 * open knows there is nothing to retry. The API sends a `code` on the closure
 * for exactly this reason, and this is the only place that reads it.
 */
async function loadCasino<T>(path: string): Promise<Loaded<T>> {
  try {
    return { state: 'ok', data: await api<T>(path) };
  } catch (error) {
    const closure = closureOf(error);
    return closure === null ? { state: 'unavailable' } : { state: 'closed', closure };
  }
}

export default async function CasinoPage() {
  await requireMember();

  // One round, not one per panel. The odds, the member's headroom and the
  // ledger are three independent reads and nothing here depends on another's
  // answer, so they leave together.
  const [terms, fairness, games, wallet] = await Promise.all([
    loadCasino<CoinTerms>('/api/v1/casino/coin/terms'),
    loadCasino<CoinFairness>('/api/v1/casino/coin/fairness'),
    // The dice games' odds and today's headroom, in one read of one day. Three
    // separate per-game calls could disagree with each other by the time they
    // were rendered side by side, and the allowance they report is shared.
    loadCasino<GameTerms[]>('/api/v1/casino/games/terms'),
    apiOrNull<WalletOverview>(`/api/v1/wallet?recent=${RECENT_LEDGER}`),
  ]);

  const dice = games.state === 'ok' ? games.data.filter((row) => row.game !== 'coin') : [];

  // Every game, not just the coin. The dice write `VIRTUAL_DICE_GAME` and
  // filtering on the coin's type alone would have shown a member an empty
  // history right after they had played -- which reads as a lost stake.
  const plays = (wallet?.recentTransactions ?? []).filter((entry) =>
    CASINO_TRANSACTION_TYPES.includes(entry.type),
  );

  // The switch is read twice on the way here — once by the route's gate, once
  // inside `casino_coin_terms` — and they are two reads of one row. If the
  // gate let the request through and the row still says closed, the closed
  // answer is the one to believe: it is the same comparison the play function
  // makes before it takes a stake, so offering the form would offer a stake
  // the game is about to refuse.
  const closure: CasinoClosure | null =
    terms.state === 'closed'
      ? terms.closure
      : terms.state === 'ok' && !terms.data.enabled
        ? 'disabled'
        : null;

  const open = closure === null && terms.state === 'ok' ? terms.data : null;

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="LUCKY ZONE" title="럭키존 (가상 미니게임)">
        게임 안의 WLD로만 진행하는 확률 게임입니다. 현금 충전·환전·실물 경품이 없고, 실제
        도박이나 투자와는 관련이 없습니다.
      </PageHeader>

      <Alert>
        <AlertTitle>천천히, 정해 둔 만큼만</AlertTitle>
        <AlertDescription>
          확률과 배당은 걸기 전에 화면에 공개되고, 오래 한다고 유리해지지 않습니다. 하루 한도를
          스스로 정해 두고, 정해 둔 만큼만 이용해 주세요.
        </AlertDescription>
      </Alert>

      {closure !== null ? (
        <ClosedNotice closure={closure} />
      ) : terms.state !== 'ok' ? (
        <EmptyState
          title="동전 게임 정보를 불러오지 못했어요."
          description="확률과 한도를 확인하기 전에는 참여를 열지 않습니다. 잠시 후 다시 시도해 주세요."
        />
      ) : null}

      {open && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>공개 확률과 배당</CardTitle>
              <CardDescription>
                걸기 전에 확인해 주세요. 결과·확률·지급액은 모두 서버가 결정합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <dl className="grid gap-1 text-sm sm:grid-cols-2 sm:gap-x-8">
                <Fact term="적중 확률">{percentFromPpm(open.win_probability_ppm)}%</Fact>
                <Fact term="적중 시 배당">
                  {multiplierFromPpm(open.payout_multiplier_ppm)}배
                </Fact>
                <Fact term="기대 손실률">{percentFromPpm(open.house_edge_ppm)}%</Fact>
                <Fact term="오늘 잃을 수 있는 최대">
                  {groupDigits(open.worst_case_loss)} WLD
                </Fact>
              </dl>
              <FairnessNote fairness={fairness} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>한 판 걸기</CardTitle>
              {/* The odds again, at the moment of the decision. They are
                  disclosed in full a card above, but a member who scrolled
                  past it would otherwise place a stake without them on
                  screen -- and before the stake is where the disclosure has
                  to be. */}
              <CardDescription>
                앞면과 뒷면 중 하나를 고르고 걸 금액을 정하면, 동전은 서버가 던집니다. 적중 확률{' '}
                {percentFromPpm(open.win_probability_ppm)}%, 적중 시{' '}
                {multiplierFromPpm(open.payout_multiplier_ppm)}배입니다. 최대인{' '}
                {groupDigits(open.max_stake)} WLD를 걸어 이기면 순이익은{' '}
                {groupDigits(open.net_win_at_max)} WLD이고, 지급액은 원 단위로 내림합니다.
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

          <Card>
            <CardHeader>
              <CardTitle>오늘 남은 한도</CardTitle>
              <CardDescription>운영 정책의 한도와, 오늘 내가 사용한 만큼입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-1 text-sm sm:grid-cols-2 sm:gap-x-8">
                <Fact term="하루 베팅 한도">{groupDigits(open.daily_stake_limit)} WLD</Fact>
                <Fact term="오늘 건 금액">{groupDigits(open.daily_stake_used)} WLD</Fact>
                <Fact term="하루 손실 한도">{groupDigits(open.daily_loss_limit)} WLD</Fact>
                <Fact term="오늘 잃은 금액">{groupDigits(open.daily_loss_used)} WLD</Fact>
                <Fact term="남은 베팅 한도">{groupDigits(open.remaining_stake)} WLD</Fact>
                <Fact term="남은 손실 한도">{groupDigits(open.remaining_loss)} WLD</Fact>
              </dl>
            </CardContent>
          </Card>

          {/* The other two games (100). They are rendered from the same read as
              the coin, and each says its own odds before its own form, because
              14.3 wants the disclosure before the stake and not on a page a
              member has to go and find.

              One allowance covers all three, so the card above is the whole
              day's headroom and is deliberately not repeated per game -- three
              copies of one number invite the reading that each game has its
              own. Each form says so in its own words instead. */}
          {dice.map((game) => (
            <Card key={game.game}>
              <CardHeader>
                <CardTitle>{gameLabel(game.game)}</CardTitle>
                <CardDescription>
                  적중 확률 {percentFromPpm(game.win_probability_ppm)}%, 적중 시{' '}
                  {multiplierFromPpm(game.payout_multiplier_ppm)}배입니다. 최대인{' '}
                  {groupDigits(game.max_stake)} WLD를 걸어 이기면 순이익은{' '}
                  {groupDigits(game.net_win_at_max)} WLD이고, 지급액은 원 단위로 내림합니다. 오늘
                  더 잃을 수 있는 금액은 {groupDigits(game.worst_case_loss)} WLD입니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {game.game === 'dice_parity' ? (
                  <DiceParityForm
                    minStake={game.min_stake}
                    maxStake={game.max_stake}
                    remainingStake={game.remaining_stake}
                    exhausted={
                      compareAmounts(game.remaining_stake, '0') <= 0 ||
                      compareAmounts(game.remaining_loss, '0') <= 0
                    }
                  />
                ) : (
                  <DiceNumberForm
                    minStake={game.min_stake}
                    maxStake={game.max_stake}
                    remainingStake={game.remaining_stake}
                    exhausted={
                      compareAmounts(game.remaining_stake, '0') <= 0 ||
                      compareAmounts(game.remaining_loss, '0') <= 0
                    }
                  />
                )}
              </CardContent>
            </Card>
          ))}

        </>
      )}

      {/* Outside the `open` branch on purpose. A self-exclusion is a
          protective control, and the game being closed is the moment a
          member is most likely to want one set for when it opens. The route
          behind it is not gated either. */}
      <Card>
        <CardHeader>
          <CardTitle>내가 정하는 한도</CardTitle>
          <CardDescription>
            운영 한도와 별개로 나에게 거는 한도입니다. 둘 중 더 엄격한 쪽이 적용됩니다. 게임이
            닫혀 있어도 미리 정해 둘 수 있어요.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {/* Honest about what this screen cannot show. The database has a
              writer for the self-limit and no reader, so the saved value is
              not knowable here — and inventing one, or leaving the fields
              looking like the current setting, would be worse than saying so. */}
          <p className="text-sm text-muted-foreground">
            지금 저장되어 있는 한도는 아직 이 화면에서 다시 불러올 수 없어요. 아래에서 새로
            저장하면 그 값으로 바뀝니다.
          </p>
          <SelfLimitForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>최근 기록</CardTitle>
          <CardDescription>
            내 지갑에 남은 최근 {RECENT_LEDGER}건 가운데 동전 게임 기록만 모았어요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {wallet === null ? (
            <EmptyState title="기록을 불러오지 못했어요." />
          ) : plays.length === 0 ? (
            <EmptyState
              title="아직 게임 기록이 없어요."
              description="한 판 걸면 결과가 경제 원장에 남고 여기에 표시됩니다."
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
                      {/* Which game it was. The ledger keeps one type per
                          game and three of them now land in this one table,
                          so a row without it is a result nobody can place. */}
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

/**
 * The evidence behind the disclosed probability.
 *
 * A trial is a million tosses counted and compared against the claim, and the
 * feature switch cannot be opened without one that passes. Before the first
 * one exists every column is null — which is a different fact from the read
 * having failed, so the two say different things.
 */
function FairnessNote({ fairness }: { readonly fairness: Loaded<CoinFairness> }) {
  if (fairness.state !== 'ok') {
    return (
      <p className="text-xs text-muted-foreground">
        분포 시험 기록을 지금은 확인할 수 없어요.
      </p>
    );
  }

  const trial = fairness.data;
  if (trial.trial_id === null || trial.trials === null) {
    return (
      <p className="text-xs text-muted-foreground">
        아직 공개된 분포 시험 기록이 없어요. 위 확률은 게임이 사용하는 값 그대로입니다.
      </p>
    );
  }

  return (
    <p className="text-xs leading-[1.8] text-muted-foreground">
      공정성 검증: {groupDigits(trial.trials)}회를 던져 앞면이{' '}
      {trial.heads === null ? '—' : groupDigits(trial.heads)}회 나왔고, 관측 확률은{' '}
      {trial.observed_win_probability_ppm === null
        ? '—'
        : `${percentFromPpm(trial.observed_win_probability_ppm)}%`}
      였어요. 허용 범위 {trial.tolerance_sigma === null ? '—' : trimZeros(trial.tolerance_sigma)}
      σ 안의 {trial.z_score === null ? '—' : trimZeros(trial.z_score)}σ로,{' '}
      {formatMoment(trial.created_at, '기록 확인 중')}에 기록되었습니다.
    </p>
  );
}
