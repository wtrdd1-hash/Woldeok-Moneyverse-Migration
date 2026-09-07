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
import { closureOf, faceLabel, multiplierFromPpm, percentFromPpm } from './coin';
import type { CasinoClosure } from './coin';
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

interface CasinoHistoryEntry {
  readonly play_id: string;
  readonly game: 'coin' | 'dice_parity' | 'dice_number';
  readonly choice: string;
  readonly outcome: string;
  readonly stake_amount: string;
  readonly net_amount: string;
  readonly transaction_id: string;
  readonly played_at: string;
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

const RECENT_GAMES = 20;

export default async function CasinoPage() {
  const isMember = await isLoggedInMember();
  if (!isMember) {
    return <CasinoGuestView />;
  }
  await requireMember();

  const [terms, fairness, games, history, selfLimit] = await Promise.all([
    loadCasino<CoinTerms>('/api/v1/casino/coin/terms'),
    loadCasino<CoinFairness>('/api/v1/casino/coin/fairness'),
    loadCasino<GameTerms[]>('/api/v1/casino/games/terms'),
    apiOrNull<CasinoHistoryEntry[]>('/api/v1/casino/history'),
    apiOrNull<SelfLimit>('/api/v1/casino/self-limit'),
  ]);

  const dice = games.state === 'ok' ? games.data.filter((row) => row.game !== 'coin') : [];
  const parityGame = dice.find((g) => g.game === 'dice_parity');
  const numberGame = dice.find((g) => g.game === 'dice_number');

  const plays = history ?? [];

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
  const selfExcluded =
    selfLimit?.locked_until !== null &&
    selfLimit?.locked_until !== undefined &&
    Date.parse(selfLimit.locked_until) > Date.now();
  const coinHeadroom = open
    ? playableHeadroom(open.remaining_stake, open.remaining_loss, userStakeRemaining, userLossRemaining)
    : '0';
  const parityHeadroom = parityGame
    ? playableHeadroom(
        parityGame.remaining_stake,
        parityGame.remaining_loss,
        userStakeRemaining,
        userLossRemaining,
      )
    : '0';
  const numberHeadroom = numberGame
    ? playableHeadroom(
        numberGame.remaining_stake,
        numberGame.remaining_loss,
        userStakeRemaining,
        userLossRemaining,
      )
    : '0';
  const coinExhausted = !open || selfExcluded || belowMinimum(coinHeadroom, open.min_stake);
  const parityExhausted =
    !parityGame || selfExcluded || belowMinimum(parityHeadroom, parityGame.min_stake);
  const numberExhausted =
    !numberGame || selfExcluded || belowMinimum(numberHeadroom, numberGame.min_stake);

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
            korean="플랫폼은 한 판과 하루 이용량에 기본 상한을 두고 있습니다. 원한다면 더 낮은 나만의 베팅·손실 한도를 설정할 수 있으며 모든 결과는 서버에서 정산됩니다."
            english="The platform applies per-play and daily caps. You can opt into stricter personal stake and loss limits; every result is settled by the server."
          />
        </AlertDescription>
      </Alert>

      {selfExcluded && selfLimit?.locked_until ? (
        <Alert>
          <AlertTitle>자가 제외가 적용 중입니다.</AlertTitle>
          <AlertDescription>
            {formatMoment(selfLimit.locked_until, '설정한 잠금 시각')}까지 카지노 플레이와 한도 변경이
            모두 차단됩니다.
          </AlertDescription>
        </Alert>
      ) : null}

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
                  korean="플랫폼 기본 상한과 사용자가 설정한 자가 한도 중 더 엄격한 값이 적용됩니다."
                  english="The stricter of the platform cap and your personal limits is enforced."
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
                      <>
                        <OddsRow name="주사위 홀짝" terms={parityGame} />
                        <OddsRow name="하이 앤 로우" terms={parityGame} />
                        <OddsRow name="컬러 휠" terms={parityGame} />
                      </>
                    ) : null}
                    {numberGame ? (
                      <>
                        <OddsRow name="주사위 숫자" terms={numberGame} />
                        <OddsRow name="럭키 슬롯" terms={numberGame} />
                        <OddsRow name="보물 상자" terms={numberGame} />
                        <OddsRow name="럭키 젬" terms={numberGame} />
                      </>
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

          {/* 3개 서버 규칙과 5개 테마 인터페이스 */}
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
                    remainingStake={coinHeadroom}
                    exhausted={coinExhausted}
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
                      remainingStake={parityHeadroom}
                      exhausted={parityExhausted}
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
                      remainingStake={numberHeadroom}
                      exhausted={numberExhausted}
                    />
                  </CardContent>
                </Card>
              ) : (
                <EmptyState title="주사위 숫자 게임을 준비 중입니다." />
              )}
            </TabsContent>

            {/* 4. 럭키 777 슬롯 */}
            <TabsContent value="slots" className="mt-6 pt-2 grid gap-6">
              {numberGame ? (
                <LuckySlotsGame
                  minStake={numberGame.min_stake}
                  maxStake={numberGame.max_stake}
                  remainingStake={numberHeadroom}
                  exhausted={numberExhausted}
                  winProbability={percentFromPpm(numberGame.win_probability_ppm)}
                  payoutMultiplier={multiplierFromPpm(numberGame.payout_multiplier_ppm)}
                />
              ) : (
                <EmptyState title="슬롯의 서버 규칙을 불러오지 못했어요." />
              )}
            </TabsContent>

            {/* 5. 하이 앤 로우 */}
            <TabsContent value="hilo" className="mt-6 pt-2 grid gap-6">
              {parityGame ? (
                <HiLoCardGame
                  minStake={parityGame.min_stake}
                  maxStake={parityGame.max_stake}
                  remainingStake={parityHeadroom}
                  exhausted={parityExhausted}
                  winProbability={percentFromPpm(parityGame.win_probability_ppm)}
                  payoutMultiplier={multiplierFromPpm(parityGame.payout_multiplier_ppm)}
                />
              ) : (
                <EmptyState title="하이/로우의 서버 규칙을 불러오지 못했어요." />
              )}
            </TabsContent>

            <TabsContent value="wheel" className="mt-6 pt-2">
              {parityGame ? (
                <ThemeGameCard
                  game="wheel"
                  minStake={parityGame.min_stake}
                  maxStake={parityGame.max_stake}
                  remainingStake={parityHeadroom}
                  exhausted={parityExhausted}
                  winProbability={percentFromPpm(parityGame.win_probability_ppm)}
                  payoutMultiplier={multiplierFromPpm(parityGame.payout_multiplier_ppm)}
                />
              ) : (
                <EmptyState title="컬러 휠의 서버 규칙을 불러오지 못했어요." />
              )}
            </TabsContent>
            <TabsContent value="treasure" className="mt-6 pt-2">
              {numberGame ? (
                <ThemeGameCard
                  game="treasure"
                  minStake={numberGame.min_stake}
                  maxStake={numberGame.max_stake}
                  remainingStake={numberHeadroom}
                  exhausted={numberExhausted}
                  winProbability={percentFromPpm(numberGame.win_probability_ppm)}
                  payoutMultiplier={multiplierFromPpm(numberGame.payout_multiplier_ppm)}
                />
              ) : (
                <EmptyState title="보물 상자의 서버 규칙을 불러오지 못했어요." />
              )}
            </TabsContent>
            <TabsContent value="gems" className="mt-6 pt-2">
              {numberGame ? (
                <ThemeGameCard
                  game="gems"
                  minStake={numberGame.min_stake}
                  maxStake={numberGame.max_stake}
                  remainingStake={numberHeadroom}
                  exhausted={numberExhausted}
                  winProbability={percentFromPpm(numberGame.win_probability_ppm)}
                  payoutMultiplier={multiplierFromPpm(numberGame.payout_multiplier_ppm)}
                />
              ) : (
                <EmptyState title="럭키 젬의 서버 규칙을 불러오지 못했어요." />
              )}
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
            다른 지갑 거래와 관계없이 서버에 기록된 최근 {RECENT_GAMES}판을 보여줍니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history === null ? (
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
                    <TableHead>선택 → 서버 결과</TableHead>
                    <TableHead className="text-right">베팅</TableHead>
                    <TableHead className="text-right">정산</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plays.map((play) => (
                    <TableRow key={play.play_id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatMoment(play.played_at, '기록 확인 중')}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{casinoGameLabel(play.game)}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {casinoChoiceLabel(play.game, play.choice)} → {casinoOutcomeLabel(play.game, play.outcome)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {groupDigits(play.stake_amount)} WLD
                      </TableCell>
                      <TableCell className="text-right">
                        <PlayOutcome netAmount={play.net_amount} />
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

function playableHeadroom(
  platformStake: string,
  platformLoss: string,
  userStake: string | null,
  userLoss: string | null,
): string {
  const values = [platformStake, platformLoss, ...(userStake ? [userStake] : []), ...(userLoss ? [userLoss] : [])];
  return values.reduce((lowest, value) => (BigInt(value) < BigInt(lowest) ? value : lowest));
}

function belowMinimum(remainingAmount: string, minimumStake: string): boolean {
  return BigInt(remainingAmount) < BigInt(minimumStake);
}

function casinoGameLabel(game: CasinoHistoryEntry['game']): string {
  if (game === 'coin') return '동전 뒤집기';
  if (game === 'dice_parity') return '주사위 홀짝';
  return '주사위 숫자';
}

function casinoChoiceLabel(game: CasinoHistoryEntry['game'], choice: string): string {
  if (game === 'coin') return faceLabel(choice);
  if (game === 'dice_parity') return choice === 'odd' ? '홀' : choice === 'even' ? '짝' : choice;
  return `${choice}번`;
}

function casinoOutcomeLabel(game: CasinoHistoryEntry['game'], outcome: string): string {
  if (game === 'coin') return faceLabel(outcome);
  const face = Number.parseInt(outcome, 10);
  if (!Number.isInteger(face) || face < 1 || face > 6) return outcome;
  if (game === 'dice_parity') return `${face} (${face % 2 === 1 ? '홀' : '짝'})`;
  return `${face}번`;
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
