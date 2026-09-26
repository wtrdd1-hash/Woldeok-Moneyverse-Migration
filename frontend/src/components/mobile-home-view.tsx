'use client';

import Link from 'next/link';
import {
  ArrowRight,
  TrendingUp,
  Wallet,
  Briefcase,
  Landmark,
  Building2,
  ShoppingBag,
  Gamepad2,
  CheckCircle2,
  Award,
  Users,
  ShieldCheck,
  Send,
  Coins,
  Activity,
  Flame,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  Compass,
} from 'lucide-react';
import { TranslatedText as T } from '@/components/translated-text';
import { WalletGlance } from '@/components/wallet-glance';
import { LobbyCount } from '@/components/lobby-count';
import { HomeAdvertisement } from '@/components/home-advertisement';
import { CasualDopamineStation } from '@/components/casual-dopamine-station';
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

export function MobileHomeView({ notices }: MobileHomeViewProps) {
  return (
    <div className="mx-auto w-full max-w-[1440px] grid gap-8 sm:gap-10">
      {/* 1. TOP HERO: High-Density Net Worth & Immediate Actions */}
      <section aria-labelledby="hero-balance-heading" className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card/90 backdrop-blur-md p-5 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
              WOLDEOK MONEYVERSE · <T korean="실시간 경제 원장 가동 중" english="Live Ledger Active" />
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <ShieldCheck className="size-3.5 text-emerald-500" />
            <T korean="100% 가상 머니 시뮬레이터" english="100% Virtual Simulator" />
          </div>
        </div>

        <div className="grid gap-6 pt-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p id="hero-balance-heading" className="text-xs sm:text-sm font-semibold text-muted-foreground">
              <T korean="내 가상 자산 총액" english="Total Virtual Net Worth" />
            </p>
            <div className="mt-2 font-mono text-[clamp(2.5rem,7vw,4.5rem)] font-extrabold tracking-tight text-foreground flex items-baseline gap-2">
              <WalletGlance />
            </div>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <T
                korean="직업 보상, 예적금 이자, 주식 평가액이 안전하게 통합 관리되고 있어요."
                english="Your work rewards, bank savings, and stock equity are securely aggregated."
              />
            </p>
          </div>

          {/* 4 Core Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5 sm:gap-3">
            <Link
              href="/wallet"
              className="flex items-center gap-3 p-3.5 rounded-xl border border-border/70 bg-muted/40 hover:bg-muted hover:border-amber-500/40 transition-all active:scale-[0.98] group"
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <Send className="size-5" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs sm:text-sm font-bold text-foreground truncate">
                  <T korean="돈 보내기" english="Transfer" />
                </span>
                <span className="block text-[10px] text-muted-foreground truncate">
                  <T korean="무수수료 멱등 송금" english="Zero Fee" />
                </span>
              </div>
            </Link>

            <Link
              href="/work"
              className="flex items-center gap-3 p-3.5 rounded-xl border border-border/70 bg-muted/40 hover:bg-muted hover:border-blue-500/40 transition-all active:scale-[0.98] group"
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Briefcase className="size-5" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs sm:text-sm font-bold text-foreground truncate">
                  <T korean="직업 업무" english="Careers" />
                </span>
                <span className="block text-[10px] text-muted-foreground truncate">
                  <T korean="일일 보상 수령" english="Daily Work" />
                </span>
              </div>
            </Link>

            <Link
              href="/stocks"
              className="flex items-center gap-3 p-3.5 rounded-xl border border-border/70 bg-muted/40 hover:bg-muted hover:border-emerald-500/40 transition-all active:scale-[0.98] group"
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <TrendingUp className="size-5" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs sm:text-sm font-bold text-foreground truncate">
                  <T korean="주식 거래" english="Stocks" />
                </span>
                <span className="block text-[10px] text-muted-foreground truncate">
                  <T korean="실시간 호가 매매" english="Live Market" />
                </span>
              </div>
            </Link>

            <Link
              href="/bank"
              className="flex items-center gap-3 p-3.5 rounded-xl border border-border/70 bg-muted/40 hover:bg-muted hover:border-purple-500/40 transition-all active:scale-[0.98] group"
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <Landmark className="size-5" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs sm:text-sm font-bold text-foreground truncate">
                  <T korean="가상 은행" english="Bank" />
                </span>
                <span className="block text-[10px] text-muted-foreground truncate">
                  <T korean="복리 예금·국채" english="Savings & Bonds" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 1.5 CASUAL DOPAMINE ARCADE STATION */}
      <section aria-labelledby="dopamine-station-heading">
        <CasualDopamineStation />
      </section>

      {/* 2. DUAL-COLUMN LIVE DASHBOARD */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Card: Live Stock Market Highlights */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-emerald-500" />
                <h2 className="text-sm font-bold text-foreground">
                  <T korean="가상 주식 시장 주요 종목" english="Hot Stock Highlights" />
                </h2>
              </div>
              <Link href="/stocks" className="text-xs font-semibold text-amber-500 hover:underline inline-flex items-center gap-1">
                <T korean="거래소 바로가기" english="View Exchange" /> <ChevronRight className="size-3" />
              </Link>
            </div>

            <div className="divide-y divide-border/50 mt-2">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <b className="text-sm font-bold text-foreground">월덕게임즈 (WDG)</b>
                  <span className="block text-[11px] text-muted-foreground">가상 엔터테인먼트 · 시총 1위</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-foreground">1,450 WLD</span>
                  <span className="block font-mono text-[11px] font-bold text-emerald-500">+4.8% ▲</span>
                </div>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <b className="text-sm font-bold text-foreground">파이낸스덕 (FNAK)</b>
                  <span className="block text-[11px] text-muted-foreground">가상 핀테크 인프라</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-foreground">820 WLD</span>
                  <span className="block font-mono text-[11px] font-bold text-emerald-500">+2.1% ▲</span>
                </div>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <b className="text-sm font-bold text-foreground">치무테크 (CHIMU)</b>
                  <span className="block text-[11px] text-muted-foreground">메타버스 로보틱스</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-foreground">3,140 WLD</span>
                  <span className="block font-mono text-[11px] font-bold text-red-500">-1.2% ▼</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <span><T korean="호가 체결 틱 주기" english="Order Tick Rate" />: 10s</span>
            <Link href="/stocks/alerts" className="font-semibold text-foreground hover:underline">
              <T korean="목표가 알림 설정" english="Price Alerts" />
            </Link>
          </div>
        </div>

        {/* Right Card: Career Station & Daily Quests */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Briefcase className="size-4 text-blue-500" />
                <h2 className="text-sm font-bold text-foreground">
                  <T korean="오늘의 직업 업무 스테이션" english="Career Work Station" />
                </h2>
              </div>
              <Link href="/work" className="text-xs font-semibold text-amber-500 hover:underline inline-flex items-center gap-1">
                <T korean="직업 센터" english="Work Center" /> <ChevronRight className="size-3" />
              </Link>
            </div>

            <div className="mt-3 p-3.5 rounded-xl border border-border/60 bg-muted/30">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-foreground"><T korean="일일 보상 수령 한도" english="Daily Reward Quota" /></span>
                <span className="font-mono text-amber-500">진행 가능</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full w-[65%]" />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>8대 직업 배정 대기 중</span>
                <span className="font-mono">쿨다운 즉시 해제</span>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <Link
                href="/work"
                className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card hover:bg-muted/40 transition-colors text-xs"
              >
                <span className="font-medium text-foreground flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <T korean="오늘의 할 일: 직업 업무 시작하고 보상 받기" english="Today Task: Perform Career Shift" />
                </span>
                <ArrowRight className="size-3.5 text-muted-foreground" />
              </Link>
              <Link
                href="/bank"
                className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card hover:bg-muted/40 transition-colors text-xs"
              >
                <span className="font-medium text-foreground flex items-center gap-2">
                  <Coins className="size-4 text-amber-500" />
                  <T korean="가상은행: 만기 확정 국채 연 12.0% 이자 확인" english="Bank: 12.0% Yield Treasury Bond" />
                </span>
                <ArrowRight className="size-3.5 text-muted-foreground" />
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <span><T korean="자정 리셋 (UTC 00:00)" english="Resets at 00:00 UTC" /></span>
            <Link href="/quests" className="font-semibold text-foreground hover:underline">
              <T korean="퀘스트 전체 보기" english="All Quests" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. 4-PILLAR SERVICE DIRECTORY */}
      <section aria-labelledby="all-services-heading" className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 id="all-services-heading" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Compass className="size-3.5" />
            <T korean="머니버스 전체 서비스 디렉터리" english="Moneyverse Service Directory" />
          </h2>
          <span className="text-[11px] font-semibold text-primary">18개 전 도메인</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Pillar 1: Finance */}
          <div className="rounded-2xl border border-border/70 bg-card/70 p-4 space-y-2">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider block pb-1 border-b border-border/40">
              <T korean="금융 & 투자" english="Finance" />
            </span>
            <Link href="/stocks" className="flex items-center justify-between py-1 text-xs font-medium text-foreground hover:text-amber-500">
              <span><T korean="가상 주식 거래소" english="Stock Exchange" /></span>
              <ChevronRight className="size-3 text-muted-foreground" />
            </Link>
            <Link href="/bank" className="flex items-center justify-between py-1 text-xs font-medium text-foreground hover:text-amber-500">
              <span><T korean="가상 중앙은행" english="Virtual Bank" /></span>
              <ChevronRight className="size-3 text-muted-foreground" />
            </Link>
            <Link href="/wallet" className="flex items-center justify-between py-1 text-xs font-medium text-foreground hover:text-amber-500">
              <span><T korean="덕지갑 & 송금" english="WLD Wallet" /></span>
              <ChevronRight className="size-3 text-muted-foreground" />
            </Link>
          </div>

          {/* Pillar 2: Economy */}
          <div className="rounded-2xl border border-border/70 bg-card/70 p-4 space-y-2">
            <span className="text-xs font-bold text-blue-500 uppercase tracking-wider block pb-1 border-b border-border/40">
              <T korean="경제 & 활동" english="Economy" />
            </span>
            <Link href="/work" className="flex items-center justify-between py-1 text-xs font-medium text-foreground hover:text-blue-500">
              <span><T korean="직업 & 승급" english="Career & Work" /></span>
              <ChevronRight className="size-3 text-muted-foreground" />
            </Link>
            <Link href="/businesses" className="flex items-center justify-between py-1 text-xs font-medium text-foreground hover:text-blue-500">
              <span><T korean="가상 사업체" english="Businesses" /></span>
              <ChevronRight className="size-3 text-muted-foreground" />
            </Link>
            <Link href="/shop" className="flex items-center justify-between py-1 text-xs font-medium text-foreground hover:text-blue-500">
              <span><T korean="아이템 상점" english="Item Shop" /></span>
              <ChevronRight className="size-3 text-muted-foreground" />
            </Link>
          </div>

          {/* Pillar 3: Play & Season */}
          <div className="rounded-2xl border border-border/70 bg-card/70 p-4 space-y-2">
            <span className="text-xs font-bold text-purple-500 uppercase tracking-wider block pb-1 border-b border-border/40">
              <T korean="플레이 & 시즌" english="Play" />
            </span>
            <Link href="/casino" className="flex items-center justify-between py-1 text-xs font-medium text-foreground hover:text-purple-500">
              <span><T korean="엔터테인먼트 카지노" english="Casino Minigames" /></span>
              <ChevronRight className="size-3 text-muted-foreground" />
            </Link>
            <Link href="/quests" className="flex items-center justify-between py-1 text-xs font-medium text-foreground hover:text-purple-500">
              <span><T korean="일일·주간 퀘스트" english="Quests" /></span>
              <ChevronRight className="size-3 text-muted-foreground" />
            </Link>
            <Link href="/seasons" className="flex items-center justify-between py-1 text-xs font-medium text-foreground hover:text-purple-500">
              <span><T korean="시즌 패스 & 랭킹" english="Season Pass" /></span>
              <ChevronRight className="size-3 text-muted-foreground" />
            </Link>
          </div>

          {/* Pillar 4: Community */}
          <div className="rounded-2xl border border-border/70 bg-card/70 p-4 space-y-2">
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider block pb-1 border-b border-border/40">
              <T korean="커뮤니티 & 공간" english="Community" />
            </span>
            <Link href="/board" className="flex items-center justify-between py-1 text-xs font-medium text-foreground hover:text-emerald-500">
              <span><T korean="커뮤니티 광장" english="Forum" /></span>
              <ChevronRight className="size-3 text-muted-foreground" />
            </Link>
            <Link href="/gallery" className="flex items-center justify-between py-1 text-xs font-medium text-foreground hover:text-emerald-500">
              <span><T korean="미디어 갤러리" english="Media Gallery" /></span>
              <ChevronRight className="size-3 text-muted-foreground" />
            </Link>
            <Link href="/spaces" className="flex items-center justify-between py-1 text-xs font-medium text-foreground hover:text-emerald-500">
              <span><T korean="가상 부동산 & 스페이스" english="Spaces" /></span>
              <ChevronRight className="size-3 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. NOTICES & LOBBY */}
      {notices.length > 0 && (
        <section aria-labelledby="home-notices-title" className="grid gap-3 pt-2">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <T korean="운영 소식" english="Field Notes" />
              </p>
              <h2 id="home-notices-title" className="mt-1 text-base sm:text-lg font-bold">
                <T korean="최근 변경 및 업데이트" english="Latest Updates" />
              </h2>
            </div>
            <Link href="/announcements" className="text-xs font-semibold text-muted-foreground hover:underline">
              <T korean="전체 보기" english="All Updates" />
            </Link>
          </div>

          <div className="border-t border-border/80 divide-y divide-border/60">
            {notices.map((notice) => (
              <Link
                key={notice.announcementId}
                href="/announcements"
                className="grid gap-1 py-3.5 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-4 hover:bg-muted/20 transition-colors"
              >
                <span className="font-mono text-[10px] text-muted-foreground">{formatDay(notice.publishedAt)}</span>
                <div className="min-w-0">
                  <span className="block text-xs sm:text-sm font-bold text-foreground truncate">{notice.title}</span>
                  <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{notice.body}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Footer Info Banner */}
      <section className="border-t border-border/80 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-emerald-500" />
          <T
            korean="모든 WLD와 자산은 게임 내에서만 유효한 가상 시뮬레이션 데이터입니다."
            english="All WLD and assets are virtual simulation data only."
          />
        </div>
        <div className="text-[11px]">
          <T korean="현재 로비 접속" english="Lobby Online" /> · <LobbyCount />
        </div>
      </section>

      <HomeAdvertisement />
    </div>
  );
}
