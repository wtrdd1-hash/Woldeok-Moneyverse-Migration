import Link from 'next/link';
import {
  Wallet,
  Dices,
  TrendingUp,
  ShoppingBag,
  Sparkles,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
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
  readonly publishedAt: string | null;
}

interface MobileHomeViewProps {
  readonly notices: readonly Announcement[];
}

export function MobileHomeView({ notices }: MobileHomeViewProps) {
  return (
    <div className="flex flex-col gap-6 lg:hidden">
      {/* 1. 상단 섹션: 스마트폰에서는 1열, 패드(태블릿 md:)에서는 2열 나란히 배치 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-stretch">
        {/* 달빛 지갑 대시보드 카드 */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-5 md:p-6 shadow-lg shadow-primary/5">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-base md:text-lg">🌙</span>
                <span className="text-xs md:text-sm font-black tracking-wider uppercase text-primary">
                  Woldeok Moonlight
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] md:text-xs font-semibold text-muted-foreground">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <T korean="원장 실시간 연동" english="Live Ledger" />
              </div>
            </div>

            <div className="mt-4 md:mt-6">
              <p className="text-xs md:text-sm font-medium text-muted-foreground">
                <T korean="보유 가상자산" english="Total Balance" />
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <div className="text-2xl md:text-3xl font-black tracking-tight text-foreground font-mono">
                  <WalletGlance />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 md:mt-8 grid grid-cols-2 gap-2.5">
            <Link
              href="/wallet"
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary font-bold text-sm text-primary-foreground shadow-md active:scale-98 transition-transform hover:bg-primary/90"
            >
              <Wallet className="size-4 md:size-5" />
              <span><T korean="지갑 관리" english="Wallet" /></span>
            </Link>
            <Link
              href="/casino"
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-primary/40 bg-card font-bold text-sm text-primary shadow-sm active:scale-98 transition-transform hover:bg-primary/10"
            >
              <Dices className="size-4 md:size-5" />
              <span><T korean="미니게임 5종" english="Mini Games" /></span>
            </Link>
          </div>
        </div>

        {/* 6구 원터치 퀵 액션 그리드 (패드에서는 오른쪽 열에 균형 있게 안착) */}
        <div className="flex flex-col justify-between">
          <div className="mb-2.5 flex items-center justify-between px-1">
            <h2 className="text-sm md:text-base font-bold tracking-tight text-foreground">
              <T korean="빠른 바로가기" english="Quick Actions" />
            </h2>
            <span className="text-[11px] md:text-xs text-muted-foreground">
              <T korean="1탭 바로 이동" english="1-Tap Access" />
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 h-full">
            <QuickActionButton
              href="/wallet"
              icon={Wallet}
              title={<T korean="덕지갑" english="Wallet" />}
              desc={<T korean="WLD 송금" english="Transfer" />}
              accent="amber"
            />
            <QuickActionButton
              href="/casino"
              icon={Dices}
              title={<T korean="럭키존" english="Casino" />}
              desc={<T korean="5종 게임" english="5 Games" />}
              accent="purple"
            />
            <QuickActionButton
              href="/stocks"
              icon={TrendingUp}
              title={<T korean="거래소" english="Exchange" />}
              desc={<T korean="실시간 주식" english="Stocks" />}
              accent="blue"
            />
            <QuickActionButton
              href="/shop"
              icon={ShoppingBag}
              title={<T korean="덕마켓" english="Shop" />}
              desc={<T korean="아이템 상점" english="Catalog" />}
              accent="emerald"
            />
            <QuickActionButton
              href="/quests"
              icon={Sparkles}
              title={<T korean="퀘스트" english="Quests" />}
              desc={<T korean="일일 보상" english="Daily Mission" />}
              accent="rose"
            />
            <QuickActionButton
              href="/lobby"
              icon={MessageSquare}
              title={<T korean="웹 로비" english="Lobby" />}
              desc={<LobbyCount />}
              accent="cyan"
            />
          </div>
        </div>
      </div>

      {/* 2. 소식 & 업데이트: 스마트폰 가로 스크롤, 패드 2~3열 카드 그리드 */}
      {notices.length > 0 && (
        <section aria-label="최신 소식">
          <div className="mb-2.5 flex items-center justify-between px-1">
            <h2 className="text-sm md:text-base font-bold tracking-tight text-foreground">
              <T korean="월간 소식 & 업데이트" english="Monthly Updates" />
            </h2>
            <Link
              href="/announcements"
              className="flex items-center text-xs md:text-sm font-bold text-primary"
            >
              <span><T korean="전체 보기" english="View All" /></span>
              <ChevronRight className="size-3.5 md:size-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {notices.map((notice) => (
              <div
                key={notice.announcementId}
                className="rounded-xl border border-border/50 bg-card p-4 shadow-sm hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center justify-between text-[11px] md:text-xs text-muted-foreground">
                  <span className="font-mono">{formatDay(notice.publishedAt)}</span>
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 font-bold text-primary text-[10px]">
                    NOTICE
                  </span>
                </div>
                <h3 className="mt-2 text-sm md:text-base font-bold line-clamp-1 text-foreground">
                  {notice.title}
                </h3>
                <p className="mt-1 text-xs md:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {notice.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. 스폰서 광고 */}
      <HomeAdvertisement />

      {/* 4. 신뢰 및 서비스 안내 카드 */}
      <div className="rounded-xl border border-border/40 bg-surface/50 p-4 md:p-5 text-xs md:text-sm text-muted-foreground">
        <div className="flex items-center gap-2 font-bold text-foreground mb-1.5">
          <ShieldCheck className="size-4 md:size-5 text-primary" />
          <span><T korean="공정한 가상경제 시스템" english="Fair Virtual Economy System" /></span>
        </div>
        <p className="leading-relaxed">
          <T
            korean="월덕 머니버스의 모든 재화(WLD)는 커뮤니티 활동 및 게임 보상으로만 획득할 수 있으며, 현금 환전 및 실물 거래는 엄격히 제한됩니다."
            english="All WLD in Woldeok Moneyverse is virtual community currency earned through activities and gameplay, with no cash exchange."
          />
        </p>
      </div>

      <HomeAdvertisement />
    </div>
  );
}

function QuickActionButton({
  href,
  icon: Icon,
  title,
  desc,
  accent,
}: {
  readonly href: string;
  readonly icon: React.ElementType;
  readonly title: React.ReactNode;
  readonly desc: React.ReactNode;
  readonly accent: 'amber' | 'purple' | 'blue' | 'emerald' | 'rose' | 'cyan';
}) {
  const accentColors = {
    amber: 'bg-primary/10 text-primary group-hover:bg-primary/20',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500/20',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:bg-rose-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-500/20',
  };

  return (
    <Link
      href={href}
      className="group flex flex-col items-center justify-center rounded-2xl border border-border/40 bg-card p-3 md:p-4 text-center shadow-sm transition-all active:scale-95 hover:border-primary/30 min-h-[90px] md:min-h-[105px]"
    >
      <div className={`mb-2 flex size-10 md:size-12 items-center justify-center rounded-xl transition-colors ${accentColors[accent]}`}>
        <Icon className="size-5 md:size-6" />
      </div>
      <span className="text-xs md:text-sm font-bold text-foreground">{title}</span>
      <span className="mt-0.5 text-[10px] md:text-xs text-muted-foreground">{desc}</span>
    </Link>
  );
}
