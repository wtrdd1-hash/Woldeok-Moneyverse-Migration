import Link from 'next/link';
import {
  ArrowRight,
  BriefcaseBusiness,
  Dices,
  MessageSquare,
  ShieldCheck,
  ShoppingBag,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { HomeAdvertisement } from '@/components/home-advertisement';
import { LobbyCount } from '@/components/lobby-count';
import { TranslatedText as T } from '@/components/translated-text';
import { WalletGlance } from '@/components/wallet-glance';
import { formatDay } from '@/lib/money';

interface Announcement {
  readonly announcementId: string;
  readonly title: string;
  readonly body: string;
  readonly isPinned?: boolean;
  readonly publishedAt: string | null;
}

interface MobileHomeViewProps {
  readonly notices: readonly Announcement[];
}

const PRIMARY_LINKS = [
  { href: '/work', icon: BriefcaseBusiness, ko: '오늘의 일', en: 'Work', hintKo: '보상 받기', hintEn: 'Earn WLD' },
  { href: '/wallet', icon: Wallet, ko: '지갑', en: 'Wallet', hintKo: '잔액과 기록', hintEn: 'Balance & history' },
  { href: '/stocks', icon: TrendingUp, ko: '거래소', en: 'Market', hintKo: '가상 주식', hintEn: 'Virtual stocks' },
  { href: '/quests', icon: ArrowRight, ko: '퀘스트', en: 'Quests', hintKo: '오늘 목표', hintEn: 'Today’s goals' },
] as const;

const SECONDARY_LINKS = [
  { href: '/shop', icon: ShoppingBag, ko: '상점', en: 'Shop' },
  { href: '/casino', icon: Dices, ko: '미니게임', en: 'Games' },
  { href: '/lobby', icon: MessageSquare, ko: '로비', en: 'Lobby' },
] as const;

export function MobileHomeView({ notices }: MobileHomeViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <section className="border-y border-border/80 py-5 sm:py-7">
        <div className="flex items-center justify-between gap-4">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Woldeok Moneyverse
          </p>
          <span className="inline-flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            <T korean="서비스 연결됨" english="Connected" />
          </span>
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">
              <T korean="내 가상경제 현황" english="Your economy at a glance" />
            </p>
            <div className="mt-1 font-mono text-[clamp(2.6rem,13vw,5.4rem)] font-medium leading-none tracking-[-0.075em] text-foreground">
              <WalletGlance />
            </div>
          </div>
          <div className="flex gap-3 sm:gap-5 text-sm font-semibold">
            <Link
              href="/work"
              className="inline-flex min-h-11 items-center rounded-xl bg-primary/10 hover:bg-primary/20 px-4 py-2 font-bold text-primary transition-colors"
            >
              <T korean="오늘 할 일 보기" english="Start today" />
            </Link>
            <Link
              href="/wallet/activity"
              className="inline-flex min-h-11 items-center rounded-xl border border-border/80 hover:bg-secondary px-4 py-2 font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              <T korean="거래 기록" english="Activity" />
            </Link>
          </div>
        </div>

        <p className="mt-5 max-w-2xl text-sm leading-6 text-muted-foreground">
          <T
            korean="오늘 할 일, 잔액, 시장과 커뮤니티를 한 화면에서 이어서 확인하세요."
            english="Continue from today’s work into your wallet, market, and community without losing context."
          />
        </p>
      </section>

      <section aria-labelledby="today-route-title" className="grid gap-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <T korean="바로 이어서" english="Continue" />
            </p>
            <h2 id="today-route-title" className="mt-1 text-[1.35rem] font-bold tracking-[-0.035em]">
              <T korean="오늘의 동선" english="Today’s route" />
            </h2>
          </div>
          <span className="rounded-full bg-secondary/80 px-2.5 py-0.5 font-mono text-xs font-semibold text-muted-foreground">
            <T korean="4개 동선" english="4 steps" />
          </span>
        </div>

        <nav aria-label="Quick routes" className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-1">
          {PRIMARY_LINKS.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex min-h-[72px] items-center justify-between gap-3.5 rounded-2xl border border-border/80 bg-card/60 p-4 transition-all hover:border-primary/40 hover:bg-card hover:shadow-sm"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-mono text-xs font-black text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[15px] font-bold text-foreground">
                      <Icon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <T korean={item.ko} english={item.en} />
                    </div>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      <T korean={item.hintKo} english={item.hintEn} />
                    </span>
                  </div>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-wrap gap-2 pt-2">
          {SECONDARY_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-secondary/60 hover:bg-secondary px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon className="size-3.5" />
                <T korean={item.ko} english={item.en} />
              </Link>
            );
          })}
        </div>
      </section>

      {notices.length > 0 && (
        <section aria-labelledby="home-notices-title" className="grid gap-3 pt-2">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <T korean="운영 기록" english="Field notes" />
              </p>
              <h2 id="home-notices-title" className="mt-1 text-[1.35rem] font-bold tracking-[-0.035em]">
                <T korean="최근 달라진 것" english="What changed recently" />
              </h2>
            </div>
            <Link href="/announcements" className="min-h-11 py-3 text-xs font-semibold text-muted-foreground underline underline-offset-4">
              <T korean="전체 기록" english="All updates" />
            </Link>
          </div>

          <div className="border-t border-border/80">
            {notices.map((notice) => (
              <Link
                key={notice.announcementId}
                href="/announcements"
                className="grid gap-1 border-b border-border/70 py-4 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-4"
              >
                <span className="font-mono text-[10px] text-muted-foreground">{formatDay(notice.publishedAt)}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">{notice.title}</span>
                  <span className="mt-1 line-clamp-2 block text-xs leading-5 text-muted-foreground">{notice.body}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-2 border-t border-border/80 pt-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ShieldCheck className="size-4 text-muted-foreground" />
            <T korean="게임 안에서만 작동하는 경제" english="An economy that stays in the game" />
          </div>
          <p className="mt-2 max-w-3xl text-xs leading-5 text-muted-foreground">
            <T
              korean="WLD와 보상은 서비스 내부의 가상 데이터이며 현금 환전이나 실물 거래 기능을 제공하지 않습니다."
              english="WLD and rewards are service-internal virtual data; no cash exchange or real-world trading is provided."
            />
          </p>
        </div>
        <div className="pt-1 text-[11px] text-muted-foreground">
          <T korean="로비 접속" english="Lobby online" /> · <LobbyCount />
        </div>
      </section>

      <HomeAdvertisement />
    </div>
  );
}
