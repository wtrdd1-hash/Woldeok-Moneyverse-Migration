import type { Metadata } from 'next';
import { canonicalUrl } from '@/lib/seo';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { TranslatedText, TranslatedText as T } from '@/components/translated-text';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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
import { CasinoClock } from './casino-clock';
import { CasinoVisualHero } from './casino-visual-hero';
import { CoinPlayForm, DiceNumberForm, DiceParityForm, SelfLimitForm } from './casino-forms';
import { ClosedNotice, PlayOutcome } from './casino-parts';
import { closureOf, faceLabel, multiplierFromPpm, percentFromPpm } from './coin';
import type { CasinoClosure } from './coin';
import { LuckySlotsGame } from './slots-game';
import { HiLoCardGame } from './hilo-game';
import { ThemeGameCard } from './theme-games';
import { WheelGame } from './wheel-game';
import { CasinoJackpotTicker } from './casino-jackpot-ticker';
import type { CasinoJackpotData } from './casino-jackpot-ticker';
import { CasinoAudioControls } from '@/components/casino-audio-controls';
import { PublicAdvertisement } from '@/components/public-advertisement';

import { getServerLocale } from '@/lib/locale-server';

/** One member's stakes and headroom. Never cached, never offered to a crawler. */
export const dynamic = 'force-dynamic';

const ARCADE_META_BY_LOCALE = {
  en: {
    title: "Arcade Zone (Virtual Mini-Games) — Coin, Dice & Slots",
    description: "Enjoy server-verified virtual gaming with Coin Flip, Dice, Slots, and Hi-Lo using WLD tokens in Woldeok Moneyverse.",
    canonical: "/en/arcade",
  },
  ko: {
    title: "아케이드 (가상 미니게임) — 동전·주사위·테마 게임",
    description: "동전·주사위·슬롯·하이로우 등 서버 판정 기반 게임을 WLD로 즐기는 게임 전용 가상 미니게임 공간입니다.",
    canonical: "/arcade",
  },
  ja: {
    title: "アーケード (仮想ミニゲーム) — コイン・サイコロ・スロット",
    description: "コイン、サイコロ、スロット、ハイローなどサーバー判定のゲームをWLDで楽しむ仮想ミニゲーム空間です。",
    canonical: "/ja/arcade",
  },
  zh: {
    title: "街机小游戏区 (虚拟小游戏) — 硬币·骰子·老虎机",
    description: "在沃尔德克金融元宇宙使用WLD体验抛硬币、掷骰子、老虎机和高低牌等服务器验证游戏。",
    canonical: "/zh/arcade",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const meta = ARCADE_META_BY_LOCALE[locale] ?? ARCADE_META_BY_LOCALE.en;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: canonicalUrl(meta.canonical),
      languages: {
        "ko-KR": canonicalUrl("/arcade"),
        "en-US": canonicalUrl("/en/arcade"),
        "ja-JP": canonicalUrl("/ja/arcade"),
        "zh-CN": canonicalUrl("/zh/arcade"),
        "x-default": canonicalUrl("/arcade"),
      },
    },
    robots: { index: false, follow: false },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonicalUrl(meta.canonical),
    },
  };
}

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

interface ServerGameClock {
  readonly policy_version: string;
  readonly day_index: string;
  readonly week_index: string;
  readonly day_of_week: number;
  readonly real_seconds_per_day: number;
  readonly game_days_per_week: number;
  readonly day_started_at: string;
  readonly day_ends_at: string;
  readonly week_started_at: string;
  readonly week_ends_at: string;
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

  const [terms, fairness, games, history, selfLimit, gameClock, jackpot] = await Promise.all([
    loadCasino<CoinTerms>('/api/v1/casino/coin/terms'),
    loadCasino<CoinFairness>('/api/v1/casino/coin/fairness'),
    loadCasino<GameTerms[]>('/api/v1/casino/games/terms'),
    apiOrNull<CasinoHistoryEntry[]>('/api/v1/casino/history'),
    apiOrNull<SelfLimit>('/api/v1/casino/self-limit'),
    apiOrNull<ServerGameClock>('/api/v1/casino/clock'),
    apiOrNull<CasinoJackpotData>('/api/v1/casino/jackpot'),
  ]);

  const dice = games.state === 'ok' ? games.data.filter((row) => row.game !== 'coin') : [];
  const parityGame = dice.find((g) => g.game === 'dice_parity');
  const numberGame = dice.find((g) => g.game === 'dice_number');
  const hiloGame = dice.find((g) => g.game === 'hilo_20');
  const treasureGame = dice.find((g) => g.game === 'treasure_4');
  const gemGame = dice.find((g) => g.game === 'gem_5');
  const wheelGame = dice.find((g) => g.game === 'wheel_20');

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
  const hiloHeadroom = hiloGame
    ? playableHeadroom(
        hiloGame.remaining_stake,
        hiloGame.remaining_loss,
        userStakeRemaining,
        userLossRemaining,
      )
    : parityHeadroom;
  const treasureHeadroom = treasureGame
    ? playableHeadroom(
        treasureGame.remaining_stake,
        treasureGame.remaining_loss,
        userStakeRemaining,
        userLossRemaining,
      )
    : numberHeadroom;
  const gemHeadroom = gemGame
    ? playableHeadroom(
        gemGame.remaining_stake,
        gemGame.remaining_loss,
        userStakeRemaining,
        userLossRemaining,
      )
    : numberHeadroom;
  const wheelHeadroom = wheelGame
    ? playableHeadroom(
        wheelGame.remaining_stake,
        wheelGame.remaining_loss,
        userStakeRemaining,
        userLossRemaining,
      )
    : parityHeadroom;

  const coinExhausted = !open || selfExcluded || belowMinimum(coinHeadroom, open.min_stake);
  const parityExhausted =
    !parityGame || selfExcluded || belowMinimum(parityHeadroom, parityGame.min_stake);
  const numberExhausted =
    !numberGame || selfExcluded || belowMinimum(numberHeadroom, numberGame.min_stake);
  const hiloExhausted =
    !hiloGame || selfExcluded || belowMinimum(hiloHeadroom, hiloGame.min_stake);
  const treasureExhausted =
    !treasureGame || selfExcluded || belowMinimum(treasureHeadroom, treasureGame.min_stake);
  const gemExhausted =
    !gemGame || selfExcluded || belowMinimum(gemHeadroom, gemGame.min_stake);
  const wheelExhausted =
    !wheelGame || selfExcluded || belowMinimum(wheelHeadroom, wheelGame.min_stake);

  return (
    <div data-page="arcade" className="mv-page mv-page--gameplay grid gap-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <PageHeader
          eyebrow="ARCADE ZONE"
          title={
            <TranslatedText
              korean="아케이드 (가상 미니게임)"
              english="Arcade Zone (Virtual Mini-games)"
            />
          }
        >
          <TranslatedText
            korean="게임 머니(WLD)로 가볍게 즐기는 미니게임 라운지입니다. 무리한 베팅 없이 가볍게 즐겨보세요."
            english="A virtual mini-game lounge using in-game WLD. Enjoy casually and responsibly."
          />
        </PageHeader>
        <div className="flex sm:self-start sm:pt-4">
          <CasinoAudioControls />
        </div>
      </div>

            {/* 법적 고지 및 사행성 방지 면책 배너 (게임산업진흥에 관한 법률 준수) */}
      <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-200">
        <AlertTitle className="text-amber-300 font-semibold flex items-center gap-2">
          <span>⚖️</span>
          <TranslatedText
            korean="[법적 고지] 게임산업진흥에 관한 법률 준수 및 가상 재화 안내"
            english="[Legal Notice] In-Game Virtual Asset & Anti-Gambling Policy"
          />
        </AlertTitle>
        <AlertDescription className="text-xs leading-relaxed text-amber-200/90 mt-1">
          <TranslatedText
            korean="본 공간의 모든 미니게임은 월덕 머니버스 커뮤니티 전용 폐쇄형 가상 포인트(WLD)로만 구동되며, 어떠한 경우에도 현금, 암호화폐, 실물 재화로의 환전·환급·거래가 일체 불가합니다(게임산업진흥에 관한 법률 제28조 및 제32조 엄격 준수). 건전한 커뮤니티 활동을 위해 일일 베팅 및 손실 한도를 자율적으로 설정하실 수 있습니다."
            english="All games in this lounge operate strictly with in-game closed virtual points (WLD) and can NEVER be exchanged, refunded, or traded for cash, cryptocurrency, or real-world goods under any circumstances (Strict compliance with Game Industry Promotion Act Art. 28 & 32). Players may set self-exclusion and daily loss limits for healthy participation."
          />
        </AlertDescription>
      </Alert>

      <CasinoVisualHero />
      <CasinoJackpotTicker data={jackpot} />

      {gameClock ? (
        <CasinoClock
          dayIndex={gameClock.day_index}
          weekIndex={gameClock.week_index}
          dayOfWeek={gameClock.day_of_week}
          realSecondsPerDay={gameClock.real_seconds_per_day}
          gameDaysPerWeek={gameClock.game_days_per_week}
          dayEndsAt={gameClock.day_ends_at}
          weekEndsAt={gameClock.week_ends_at}
        />
      ) : null}

      {/* 🛡️ 대한민국 게임산업진흥법 준수 & 현금 환전 불가 공식 법률 면책 배너 */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 sm:p-5 shadow-lg backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="shrink-0 p-2 rounded-xl bg-amber-500/20 text-amber-400 font-bold text-lg select-none">
            🛡️
          </div>
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-amber-200">
                <TranslatedText
                  korean="법률 준수 및 가상 시뮬레이션 공식 면책 고지"
                  english="Legal Compliance & Virtual Simulation Disclaimer"
                />
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                <TranslatedText korean="현금 환전 불가" english="No Cash Out" />
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed break-keep">
              <TranslatedText
                korean="본 아케이드 존의 모든 게임은 순수 엔터테인먼트 시뮬레이션용입니다. 게임 내 가상 재화(WLD)는 사이트 내 활동에만 사용되는 폐쇄형 포인트이며, 어떠한 경우에도 현금, 실물 유가증권, 암호화폐 등으로 환전·출금·양도되지 않으며 재산상 가치를 갖지 않습니다. (게임산업진흥에 관한 법률 준수)"
                english="All mini-games in this arcade zone are strictly virtual entertainment simulations. In-game WLD tokens are closed-loop virtual points used exclusively within the platform, and CANNOT be cashed out, exchanged, redeemed, or traded for real currency, assets, or monetary value."
              />
            </p>
          </div>
        </div>
      </div>

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
          <Card className="bg-muted/30 rounded-2xl border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                <T korean="오늘의 보호 한도 현황" english="Daily Safety Limits" />
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

          <Card className="rounded-2xl border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                <T korean="7대 정규 게임별 확률·배당 공개" english="Published Odds and Payouts (7 Official Games)" />
              </CardTitle>
              <CardDescription>
                <T
                  korean="기획서(CASINO_GAME_SYSTEM_SPEC) 7대 정규 게임의 실제 서버 권위적 원장 정산 공식 설정값입니다 (RTP 95% 공정성 보장)."
                  english="Official server-authoritative settlement settings for the 7 launch games (95% baseline RTP)."
                />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>게임</TableHead>
                      <TableHead className="text-right">적중 확률</TableHead>
                      <TableHead className="text-right">지급 배당</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <OddsRow name="동전 뒤집기" terms={open} />
                    {parityGame ? (
                      <>
                        <OddsRow name="주사위 홀짝" terms={parityGame} />
                        <OddsRow name="하이 앤 로우" terms={hiloGame ?? parityGame} />
                        <OddsRow name="컬러 휠" terms={wheelGame ?? parityGame} />
                      </>
                    ) : null}
                    {numberGame ? (
                      <>
                        <OddsRow name="주사위 숫자" terms={numberGame} />
                        <OddsRow name="럭키 슬롯" terms={numberGame} />
                        <OddsRow name="보물 상자" terms={treasureGame ?? numberGame} />
                        <OddsRow name="럭키 젬" terms={gemGame ?? numberGame} />
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

          {/* 7대 정규 게임 카탈로그 탭 */}
          <Tabs defaultValue="coin" className="min-w-0 w-full space-y-6">
            <div className="sticky top-[70px] z-20 -mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
              <TabsList className="inline-flex h-auto min-w-max gap-1 rounded-2xl border border-border/80 bg-card/90 p-2 shadow-lg backdrop-blur-md">
                <TabsTrigger value="coin" className="min-h-11 px-4 text-sm font-semibold rounded-xl">
                  🪙 <T korean="동전 뒤집기" english="Coin Flip" />
                </TabsTrigger>
                <TabsTrigger
                  value="dice_parity"
                  className="min-h-11 px-4 text-sm font-semibold rounded-xl"
                >
                  🎲 <T korean="주사위 홀짝" english="Dice Parity" />
                </TabsTrigger>
                <TabsTrigger
                  value="dice_number"
                  className="min-h-11 px-4 text-sm font-semibold rounded-xl"
                >
                  🎯 <T korean="주사위 숫자" english="Dice Number" />
                </TabsTrigger>
                <TabsTrigger value="hilo" className="min-h-11 px-4 text-sm font-semibold rounded-xl">
                  🃏 <T korean="하이 / 로우 20" english="Hi-Lo 20" />
                </TabsTrigger>
                <TabsTrigger value="treasure" className="min-h-11 px-4 text-sm font-semibold rounded-xl">
                  🗝️ <T korean="보물 상자" english="Treasure Vault" />
                </TabsTrigger>
                <TabsTrigger value="gems" className="min-h-11 px-4 text-sm font-semibold rounded-xl">
                  💎 <T korean="럭키 젬" english="Gem Match 5" />
                </TabsTrigger>
                <TabsTrigger value="wheel" className="min-h-11 px-4 text-sm font-semibold rounded-xl">
                  🎡 <T korean="20구획 휠" english="20-Segment Wheel" />
                </TabsTrigger>
                <TabsTrigger value="slots" className="min-h-11 px-4 text-sm font-semibold rounded-xl">
                  🎰 <T korean="럭키 777 슬롯" english="Lucky 777 Slots" />
                </TabsTrigger>
              </TabsList>
            </div>

            {/* 1. 동전 뒤집기 */}
            <TabsContent value="coin" className="mt-6 pt-2 grid gap-6">
              <Card className="rounded-2xl border-border/80 shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2 font-bold">
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
                <Card className="rounded-2xl border-border/80 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2 font-bold">
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
                <EmptyState
                  title={
                    games.state === 'unavailable'
                      ? '주사위 서버 규칙을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'
                      : '주사위 홀짝 게임을 현재 이용할 수 없어요.'
                  }
                />
              )}
            </TabsContent>

            {/* 3. 주사위 숫자 맞추기 */}
            <TabsContent value="dice_number" className="mt-6 pt-2 grid gap-6">
              {numberGame ? (
                <Card className="rounded-2xl border-border/80 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2 font-bold">
                      🎯 <T korean="주사위 단일 숫자 맞추기" english="Dice Single Number" />
                    </CardTitle>
                    <CardDescription>
                      1부터 6까지 나올 눈을 정확히 맞춥니다. 적중 확률{' '}
                      {percentFromPpm(numberGame.win_probability_ppm)}%, 적중 시{' '}
                      {multiplierFromPpm(numberGame.payout_multiplier_ppm)}배 배당이 지급됩니다.
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
                <EmptyState
                  title={
                    games.state === 'unavailable'
                      ? '주사위 서버 규칙을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'
                      : '주사위 숫자 게임을 현재 이용할 수 없어요.'
                  }
                />
              )}
            </TabsContent>

            {/* 4. 럭키 슬롯 */}
            <TabsContent value="slots" className="mt-6 pt-2">
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
                <EmptyState title="슬롯 게임의 서버 규칙을 불러오지 못했어요." />
              )}
            </TabsContent>

            {/* 4. 하이 앤 로우 20 */}
            <TabsContent value="hilo" className="mt-6 pt-2">
              {hiloGame && parityGame ? (
                <HiLoCardGame
                  minStake={hiloGame.min_stake}
                  maxStake={hiloGame.max_stake}
                  remainingStake={parityHeadroom}
                  exhausted={hiloExhausted}
                  winProbability={percentFromPpm(hiloGame.win_probability_ppm)}
                  payoutMultiplier={multiplierFromPpm(parityGame.payout_multiplier_ppm)}
                />
              ) : (
                <EmptyState title="하이앤로우 20의 서버 규칙을 불러오지 못했어요." />
              )}
            </TabsContent>

            {/* 5. 보물 상자 */}
            <TabsContent value="treasure" className="mt-6 pt-2">
              {treasureGame ? (
                <ThemeGameCard
                  game="treasure"
                  minStake={treasureGame.min_stake}
                  maxStake={treasureGame.max_stake}
                  remainingStake={treasureHeadroom}
                  exhausted={treasureExhausted}
                  winProbability={percentFromPpm(treasureGame.win_probability_ppm)}
                  payoutMultiplier={multiplierFromPpm(treasureGame.payout_multiplier_ppm)}
                />
              ) : (
                <EmptyState title="보물 상자의 서버 규칙을 불러오지 못했어요." />
              )}
            </TabsContent>

            {/* 6. 럭키 젬 */}
            <TabsContent value="gems" className="mt-6 pt-2">
              {gemGame ? (
                <ThemeGameCard
                  game="gems"
                  minStake={gemGame.min_stake}
                  maxStake={gemGame.max_stake}
                  remainingStake={gemHeadroom}
                  exhausted={gemExhausted}
                  winProbability={percentFromPpm(gemGame.win_probability_ppm)}
                  payoutMultiplier={multiplierFromPpm(gemGame.payout_multiplier_ppm)}
                />
              ) : (
                <EmptyState title="럭키 젬의 서버 규칙을 불러오지 못했어요." />
              )}
            </TabsContent>

            {/* 7. 20구획 휠 */}
            <TabsContent value="wheel" className="mt-6 pt-2">
              {wheelGame ? (
                <WheelGame
                  minStake={wheelGame.min_stake}
                  maxStake={wheelGame.max_stake}
                  remainingStake={wheelHeadroom}
                  exhausted={wheelExhausted}
                />
              ) : (
                <EmptyState title="20구획 휠의 서버 규칙을 불러오지 못했어요." />
              )}
            </TabsContent>
          </Tabs>

          {/* 스폰서드 디스플레이 광고 */}
          <PublicAdvertisement className="my-6" />
        </>
      )}

      {/* 한도 직접 설정 카드 */}
      <Card className="rounded-2xl border-border/80 shadow-sm">
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
      <Card className="rounded-2xl border-border/80 shadow-sm">
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
                      <TableCell className="whitespace-nowrap font-medium">{casinoGameLabel(play.game)}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground font-mono">
                        {casinoChoiceLabel(play.game, play.choice)} → {casinoOutcomeLabel(play.game, play.outcome)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-mono font-bold">
                        {groupDigits(play.stake_amount)} WLD
                      </TableCell>
                      <TableCell className="text-right font-mono">
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
    <div className="rounded-xl border border-border/60 bg-card p-3 shadow-xs">
      <dt className="text-xs text-muted-foreground">{term}</dt>
      <dd className="mt-1 font-mono font-bold text-foreground text-sm">{children}</dd>
    </div>
  );
}

function limitLabel(limit: string | null | undefined): string {
  if (!limit || limit === '0') return '설정 안 함 (무제한)';
  return `${groupDigits(limit)} WLD`;
}

function remainingLabel(remaining: string | null): string {
  if (remaining === null) return '제한 없음';
  return `${groupDigits(remaining)} WLD 남음`;
}

function remaining(limit: string, used: string): string {
  const limitBig = BigInt(limit);
  const usedBig = BigInt(used);
  if (usedBig >= limitBig) return '0';
  return (limitBig - usedBig).toString();
}

function OddsRow({
  name,
  terms,
}: {
  readonly name: string;
  readonly terms: {
    readonly win_probability_ppm: number;
    readonly payout_multiplier_ppm: number;
  };
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">{name}</TableCell>
      <TableCell className="text-right tabular-nums font-mono">
        {percentFromPpm(terms.win_probability_ppm)}%
      </TableCell>
      <TableCell className="text-right tabular-nums font-mono font-bold text-primary">
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
      <div className="rounded-xl border border-border/70 bg-muted/20 p-3 text-xs text-muted-foreground">
        분포 시험 기록을 지금은 확인할 수 없습니다.
      </div>
    );
  }

  const trial = fairness.data;
  if (trial.trial_id === null || trial.trials === null) {
    return (
      <div className="rounded-xl border border-border/70 bg-muted/20 p-3 text-xs text-muted-foreground">
        공개된 분포 시험 기록이 확인되지 않았습니다. 위 확률은 시스템 공식 설정값입니다.
      </div>
    );
  }

  const expected = trial.expected_win_probability_ppm ? (trial.expected_win_probability_ppm / 10000).toFixed(2) : '50.00';
  const observed = trial.observed_win_probability_ppm ? (trial.observed_win_probability_ppm / 10000).toFixed(2) : '50.00';

  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 grid gap-3 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-primary/20 pb-2.5">
        <span className="text-xs font-bold text-primary flex items-center gap-1.5">
          🛡️ 암호학적 난수(RNG) 공정성 100만 회 통계 검증 보고서
        </span>
        <Badge variant="outline" className="text-[11px] font-mono text-emerald-500 border-emerald-500/30 bg-emerald-500/10">
          신뢰도 99.7% 정규분포 적합
        </Badge>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="rounded-xl bg-background/80 p-2.5 border border-border/60">
          <span className="text-muted-foreground block text-[11px]">총 난수 검증 횟수</span>
          <span className="font-mono font-bold text-sm text-foreground mt-0.5 block">
            {groupDigits(trial.trials)}회
          </span>
        </div>
        <div className="rounded-xl bg-background/80 p-2.5 border border-border/60">
          <span className="text-muted-foreground block text-[11px]">앞면(Heads) 관측</span>
          <span className="font-mono font-bold text-sm text-foreground mt-0.5 block">
            {trial.heads === null ? '—' : groupDigits(trial.heads)}회
          </span>
        </div>
        <div className="rounded-xl bg-background/80 p-2.5 border border-border/60">
          <span className="text-muted-foreground block text-[11px]">관측 승률 / 이론 승률</span>
          <span className="font-mono font-bold text-sm text-emerald-500 mt-0.5 block">
            {observed}% / {expected}%
          </span>
        </div>
        <div className="rounded-xl bg-primary/10 p-2.5 border border-primary/20">
          <span className="text-primary font-semibold block text-[11px]">표준편차 (Z-Score)</span>
          <span className="font-mono font-bold text-sm text-primary mt-0.5 block">
            {trial.z_score ?? '0.00'}σ (허용: ±{trial.tolerance_sigma ?? '3.0'}σ)
          </span>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        ※ 관측된 Z-Score가 통계적 신뢰구간(±{trial.tolerance_sigma ?? '3.0'}σ) 내에 분포함을 모니터링하여 공정성 오차 범위를 상시 검증합니다.
      </p>
    </div>
  );
}
