import Link from 'next/link';
import {
  ArrowRight,
  Award,
  BriefcaseBusiness,
  Building2,
  Calendar,
  CheckSquare,
  Dices,
  Landmark,
  MessageSquare,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import { HomeAdvertisement } from '@/components/home-advertisement';
import { LobbyCount } from '@/components/lobby-count';
import { TranslatedText as T } from '@/components/translated-text';
import { Badge } from '@/components/ui/badge';
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

const QUICK_SERVICES = [
  { href: '/stocks', icon: TrendingUp, ko: '거래소', en: 'Exchange', badge: '주식', color: 'text-emerald-500 bg-emerald-500/10' },
  { href: '/wallet', icon: Wallet, ko: '지갑', en: 'Wallet', badge: '자산', color: 'text-primary bg-primary/10' },
  { href: '/bank', icon: Landmark, ko: '가상은행', en: 'Bank', badge: '예적금', color: 'text-amber-500 bg-amber-500/10' },
  { href: '/work', icon: BriefcaseBusiness, ko: '직업', en: 'Work', badge: '보상', color: 'text-blue-500 bg-blue-500/10' },
  { href: '/businesses', icon: Building2, ko: '사업체', en: 'Biz', badge: '법인', color: 'text-indigo-500 bg-indigo-500/10' },
  { href: '/shop', icon: ShoppingBag, ko: '상점', en: 'Shop', badge: '아이템', color: 'text-rose-500 bg-rose-500/10' },
  { href: '/casino', icon: Dices, ko: '카지노', en: 'Casino', badge: '게임', color: 'text-amber-400 bg-amber-400/10' },
  { href: '/quests', icon: CheckSquare, ko: '퀘스트', en: 'Quests', badge: '미션', color: 'text-purple-500 bg-purple-500/10' },
  { href: '/seasons', icon: Zap, ko: '시즌', en: 'Seasons', badge: '랭킹', color: 'text-yellow-500 bg-yellow-500/10' },
  { href: '/clubs', icon: Users, ko: '클럽', en: 'Clubs', badge: '협동', color: 'text-emerald-400 bg-emerald-400/10' },
] as const;

const PRIMARY_LINKS = [
  { href: '/work', icon: BriefcaseBusiness, ko: '오늘의 일', en: 'Work', hintKo: '보상 받기', hintEn: 'Earn WLD' },
  { href: '/wallet', icon: Wallet, ko: '지갑', en: 'Wallet', hintKo: '잔액과 기록', hintEn: 'Balance & history' },
  { href: '/stocks', icon: TrendingUp, ko: '거래소', en: 'Market', hintKo: '가상 주식', hintEn: 'Virtual stocks' },
  { href: '/quests', icon: ArrowRight, ko: '퀘스트', en: 'Quests', hintKo: '오늘 목표', hintEn: 'Today’s goals' },
] as const;

const SECONDARY_LINKS = [
  { href: '/bank', icon: Landmark, ko: '가상 금융', en: 'Banking' },
  { href: '/businesses', icon: Building2, ko: '게임 사업', en: 'Businesses' },
  { href: '/shop', icon: ShoppingBag, ko: '상점', en: 'Shop' },
  { href: '/casino', icon: Dices, ko: '미니게임', en: 'Games' },
  { href: '/board', icon: MessageSquare, ko: '커뮤니티', en: 'Board' },
  { href: '/lobby', icon: MessageSquare, ko: '로비', en: 'Lobby' },
] as const;

export function MobileHomeView({ notices }: MobileHomeViewProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Hero Asset Overview Section */}
      <section className="border-y border-border/80 py-5 sm:py-7">
        <div className="flex items-center justify-between gap-4">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Woldeok Moneyverse
          </p>
          <span className="inline-flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
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
          <div className="flex gap-5 text-sm font-semibold">
            <Link href="/work" className="inline-flex min-h-11 items-center border-b border-primary/70 text-foreground">
              <T korean="오늘 할 일 보기" english="Start today" />
            </Link>
            <Link href="/wallet/activity" className="inline-flex min-h-11 items-center border-b border-border text-muted-foreground hover:text-foreground">
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

      {/* Toss-Style Quick Services Grid */}
      <section aria-labelledby="quick-services-title" className="grid gap-3">
        <div className="flex items-center justify-between">
          <h2 id="quick-services-title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <T korean="전체 주요 서비스 바로가기" english="Quick Services" />
          </h2>
          <span className="text-[11px] font-semibold text-primary">10대 핵심 기능</span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-2 sm:gap-2.5">
          {QUICK_SERVICES.map((srv) => {
            const Icon = srv.icon;
            return (
              <Link
                key={srv.href}
                href={srv.href}
                className="group flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border border-border/60 bg-card/60 hover:bg-card hover:border-primary/40 transition-all shadow-2xs hover:shadow-xs text-center"
              >
                <div className={`flex size-10 sm:size-11 items-center justify-center rounded-xl mb-1.5 transition-transform group-hover:scale-105 ${srv.color}`}>
                  <Icon className="size-5 sm:size-5.5" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-foreground truncate w-full">
                  <T korean={srv.ko} english={srv.en} />
                </span>
                <span className="text-[9px] text-muted-foreground mt-0.5">
                  {srv.badge}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Today Route Section */}
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
          <span className="font-mono text-[10px] text-muted-foreground">04</span>
        </div>

        <nav className="border-t border-border/80" aria-label="Quick routes">
          {PRIMARY_LINKS.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group grid min-h-[68px] grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-border/70"
              >
                <span className="font-mono text-[11px] text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-[15px] font-semibold text-foreground">
                    <Icon className="size-4 text-muted-foreground" />
                    <T korean={item.ko} english={item.en} />
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    <T korean={item.hintKo} english={item.hintEn} />
                  </span>
                </span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
          {SECONDARY_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
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
