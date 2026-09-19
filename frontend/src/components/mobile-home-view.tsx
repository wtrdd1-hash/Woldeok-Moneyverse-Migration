import Link from 'next/link';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Dices,
  MessageSquare,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { WalletGlance } from '@/components/wallet-glance';
import { LobbyCount } from '@/components/lobby-count';
import { HomeAdvertisement } from '@/components/home-advertisement';
import { TranslatedText as T } from '@/components/translated-text';
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
  { href: '/quests', icon: Sparkles, ko: '퀘스트', en: 'Quests', hintKo: '오늘 목표', hintEn: 'Today’s goals' },
] as const;

const SECONDARY_LINKS = [
  { href: '/shop', icon: ShoppingBag, ko: '상점', en: 'Shop' },
  { href: '/casino', icon: Dices, ko: '미니게임', en: 'Games' },
  { href: '/lobby', icon: MessageSquare, ko: '로비', en: 'Lobby' },
] as const;

export function MobileHomeView({ notices }: MobileHomeViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.72fr)] lg:gap-5">
        <div className="relative min-h-[320px] overflow-hidden rounded-[28px] border border-primary/20 bg-[#0d1728] p-5 sm:p-7 lg:p-9">
          <div aria-hidden className="absolute -right-24 -top-28 size-72 rounded-full bg-primary/10 blur-3xl" />
          <div aria-hidden className="absolute bottom-0 left-[35%] h-px w-1/2 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="relative flex h-full flex-col">
            <div className="flex items-center justify-between gap-4">
              <p className="eyebrow">Woldeok Moneyverse</p>
              <span className="inline-flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                <T korean="서비스 연결됨" english="Connected" />
              </span>
            </div>

            <div className="mt-12 max-w-2xl sm:mt-16">
              <p className="text-sm font-medium text-muted-foreground">
                <T korean="내 가상경제 현황" english="Your economy at a glance" />
              </p>
              <div className="mt-2 font-mono text-[clamp(2.3rem,9vw,5rem)] font-semibold leading-none tracking-[-0.06em] text-foreground">
                <WalletGlance />
              </div>
              <p className="mt-4 max-w-lg text-sm leading-7 text-muted-foreground sm:text-base">
                <T
                  korean="오늘 할 일, 잔액, 시장과 커뮤니티를 한 화면에서 이어서 확인하세요."
                  english="Continue from today’s work into your wallet, market, and community without losing context."
                />
              </p>
            </div>
            <div className="mt-auto flex flex-wrap gap-2 pt-8">
              <Link
                href="/work"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-extrabold text-primary-foreground transition-transform hover:-translate-y-px"
              >
                <BriefcaseBusiness className="size-4" />
                <T korean="오늘 할 일 보기" english="Start today" />
              </Link>
              <Link
                href="/wallet"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border/80 bg-white/[0.03] px-4 text-sm font-bold text-foreground hover:bg-white/[0.06]"
              >
                <T korean="거래 기록" english="Activity" />
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>

        <aside className="rounded-[28px] border border-border/80 bg-card/55 p-4 sm:p-5">
          <div className="flex items-end justify-between gap-3 border-b border-border/70 pb-4">
            <div>
              <p className="text-xs font-bold text-muted-foreground"><T korean="바로 이어서" english="Continue" /></p>
              <h2 className="mt-1 text-lg font-extrabold"><T korean="오늘의 동선" english="Today’s route" /></h2>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">4 STEPS</span>
          </div>
          <nav className="divide-y divide-border/60" aria-label="Quick routes">
            {PRIMARY_LINKS.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group grid min-h-[72px] grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 py-2.5"
                >
                  <span className="font-mono text-[11px] text-muted-foreground">0{index + 1}</span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 font-bold">
                      <Icon className="size-4 text-primary" />
                      <T korean={item.ko} english={item.en} />
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      <T korean={item.hintKo} english={item.hintEn} />
                    </span>
                  </span>
                  <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 flex flex-wrap gap-2">
            {SECONDARY_LINKS.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border/80 px-3 text-xs font-bold text-muted-foreground hover:border-primary/30 hover:text-foreground">
                  <Icon className="size-3.5" />
                  <T korean={item.ko} english={item.en} />
                </Link>
              );
            })}
          </div>
        </aside>
      </section>
      {notices.length > 0 && (
        <section aria-labelledby="home-notices-title" className="grid gap-4">
          <div className="flex items-end justify-between gap-4 border-b border-border/70 pb-4">
            <div>
              <p className="eyebrow"><T korean="운영 기록" english="Field notes" /></p>
              <h2 id="home-notices-title" className="mt-2 text-2xl font-extrabold">
                <T korean="최근 달라진 것" english="What changed recently" />
              </h2>
            </div>
            <Link href="/announcements" className="inline-flex min-h-11 items-center gap-1 text-xs font-bold text-primary">
              <T korean="전체 기록" english="All updates" />
              <ArrowUpRight className="size-4" />
            </Link>
          </div>

          <div className="divide-y divide-border/60 border-y border-border/60">
            {notices.map((notice, index) => (
              <Link
                key={notice.announcementId}
                href="/announcements"
                className="group grid gap-2 py-5 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:items-start sm:gap-5"
              >
                <span className="font-mono text-[11px] text-muted-foreground">{formatDay(notice.publishedAt)}</span>
                <span className="min-w-0">
                  <span className="block text-base font-extrabold text-foreground">{notice.title}</span>
                  <span className="mt-1 line-clamp-2 block text-sm leading-6 text-muted-foreground">{notice.body}</span>
                </span>
                <span className="hidden text-xs font-bold text-muted-foreground transition-colors group-hover:text-primary sm:block">
                  0{index + 1}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
      <section className="grid gap-4 border-l-2 border-primary/60 pl-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:pl-6">
        <div>
          <div className="flex items-center gap-2 font-extrabold text-foreground">
            <ShieldCheck className="size-4 text-primary" />
            <T korean="게임 안에서만 작동하는 경제" english="An economy that stays in the game" />
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
            <T
              korean="WLD와 보상은 서비스 내부의 가상 데이터이며 현금 환전이나 실물 거래 기능을 제공하지 않습니다."
              english="WLD and rewards are service-internal virtual data; no cash exchange or real-world trading is provided."
            />
          </p>
        </div>
        <div className="text-xs font-bold text-muted-foreground">
          <T korean="로비 접속" english="Lobby online" /> · <LobbyCount />
        </div>
      </section>

      <HomeAdvertisement />
    </div>
  );
}
