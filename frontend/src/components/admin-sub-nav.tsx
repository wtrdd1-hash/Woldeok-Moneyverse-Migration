'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Coins,
  ShieldCheck,
  Sliders,
  Megaphone,
  Landmark,
  TrendingUp,
  ShoppingBag,
  MessageCircle,
  ShieldAlert,
  BriefcaseBusiness,
  Building2,
  Radio,
  Vault,
  Activity,
  Globe,
  BarChart3,
  Building,
  ScrollText,
  HeartHandshake,
  Shield,
  ArrowLeftRight,
  Lock,
  Unlock,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { AdminQuickJumperModal } from './admin-quick-jumper-modal';
import { AdminStepupOtpModal } from './admin/admin-stepup-otp-modal';

interface AdminTabItem {
  readonly href: string;
  readonly label: string;
  readonly icon: React.ElementType;
}

export const ADMIN_TABS: readonly AdminTabItem[] = [
  { href: '/admin', label: '대시보드', icon: LayoutDashboard },
  { href: '/admin/money-flow', label: '유저 자금 흐름', icon: ArrowLeftRight },
  { href: '/admin/analytics', label: '그래프 분석', icon: BarChart3 },
  { href: '/admin/api-health', label: 'API 관제', icon: Activity },
  { href: '/admin/seo', label: 'SEO·색인', icon: Globe },
  { href: '/admin/blog', label: '블로그 관리', icon: ScrollText },
  { href: '/admin/treasury/grants', label: '창업 지원금 심사', icon: Vault },
  { href: '/admin/users', label: '회원 관리', icon: Users },
  { href: '/admin/security', label: '보안·차단', icon: ShieldAlert },
  { href: '/admin/support', label: '문의 채팅', icon: MessageCircle },
  { href: '/admin/economy', label: '경제·원장', icon: Coins },
  { href: '/admin/mint', label: '조폐국', icon: Coins },
  { href: '/admin/central-bank', label: '중앙은행', icon: Landmark },
  { href: '/admin/treasury', label: '국고·비축', icon: Vault },
  { href: '/admin/enterprises', label: '공기업·지배구조', icon: Building },
  { href: '/admin/bonds', label: '국채 거래소', icon: ScrollText },
  { href: '/admin/pension', label: '국민연금', icon: HeartHandshake },
  { href: '/admin/kdic', label: '예금보험공사', icon: Shield },
  { href: '/admin/fx', label: '서울외환시장', icon: ArrowLeftRight },
  { href: '/admin/catalog', label: '사업·시즌', icon: Building2 },
  { href: '/admin/work', label: '작업·직업', icon: BriefcaseBusiness },
  { href: '/admin/shop', label: '상점 관리', icon: ShoppingBag },
  { href: '/admin/logs', label: '감사 로그', icon: ShieldCheck },
  { href: '/admin/controls', label: '기능 스위치', icon: Sliders },
  { href: '/admin/content', label: '공지·갤러리', icon: Megaphone },
  { href: '/admin/discord', label: 'Discord', icon: Radio },
  { href: '/admin/bank', label: '은행·대출', icon: Landmark },
  { href: '/admin/market', label: '가상 시장', icon: TrendingUp },
  { href: '/admin/safety', label: '안전·삭제', icon: ShieldCheck },
];

/**
 * The tab the reader is on: the one whose path is the longest prefix of the
 * current one. Exported so the rule is testable without rendering.
 */
export function activeAdminTab(pathname: string): string | null {
  let winner: string | null = null;
  for (const tab of ADMIN_TABS) {
    const inside = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
    if (inside && (winner === null || tab.href.length > winner.length)) winner = tab.href;
  }
  return winner;
}

export function AdminSubNav() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const activeItemRef = useRef<HTMLLIElement>(null);
  const isAdminPath = pathname.startsWith('/admin');
  const active = isAdminPath ? activeAdminTab(pathname) : null;

  // 2FA Elevation State
  const [elevated, setElevated] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [revoking, setRevoking] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/auth/channel-otp/status', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json().catch(() => ({}));
      if (data.ok) {
        setElevated(Boolean(data.elevated));
        setRemainingSeconds(Number(data.remainingSeconds) || 0);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!isAdminPath) return;
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // 30초마다 동기화
    return () => clearInterval(interval);
  }, [isAdminPath, fetchStatus]);

  // 카운트다운 1초 인터벌
  useEffect(() => {
    if (!elevated || remainingSeconds <= 0) return;
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setElevated(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [elevated, remainingSeconds]);

  const handleRevoke = async () => {
    if (revoking) return;
    setRevoking(true);
    try {
      await fetch('/api/admin/auth/channel-otp/revoke', { method: 'POST' });
      setElevated(false);
      setRemainingSeconds(0);
    } catch {
      // ignore
    } finally {
      setRevoking(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Auto-scroll the active tab into view smoothly on mobile/narrow viewports.
  // Keep the hook unconditional so route changes never alter hook ordering.
  useEffect(() => {
    if (isAdminPath && activeItemRef.current && navRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [active, isAdminPath]);

  if (!isAdminPath) return null;

  return (
    <>
      <nav
        ref={navRef}
        aria-label="관리자 세부 내비게이션"
        className="w-full max-w-full min-w-0 mb-4 overflow-x-auto rounded-xl sm:rounded-2xl border border-border/60 bg-slate-900/40 dark:bg-[#0c1017]/80 backdrop-blur-2xl p-1.5 shadow-sm scrollbar-none touch-pan-x overscroll-x-contain select-none [&::-webkit-scrollbar]:hidden"
      >
        <ul className="flex w-max items-center gap-1 px-2 sm:w-auto sm:flex-wrap sm:px-0">
          <li className="shrink-0 pr-1 border-r border-border/60 mr-1 flex items-center gap-1.5">
            <AdminQuickJumperModal />
            {elevated ? (
              <div className="flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-lg px-2 py-1 text-[11px] font-mono font-bold tracking-tight">
                <Unlock className="size-3 shrink-0" />
                <span>2FA {formatTime(remainingSeconds)}</span>
                <button
                  type="button"
                  onClick={handleRevoke}
                  disabled={revoking}
                  className="ml-1 text-[10px] text-muted-foreground hover:text-rose-400 underline decoration-dotted transition-colors"
                  title="세션 즉시 잠금"
                >
                  잠금
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20 text-amber-400/90 rounded-lg px-2 py-1 text-[11px] font-medium transition-all"
                title="텔레그램/디스코드 2FA 세션 승격 (15분)"
              >
                <Lock className="size-3 shrink-0" />
                <span>2FA 승격</span>
              </button>
            )}
          </li>
          {ADMIN_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.href === active;

            return (
              <li key={tab.href} ref={isActive ? activeItemRef : undefined}>
                <Link
                  href={tab.href}
                  prefetch={false}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'group flex min-h-[44px] sm:min-h-9 shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-[0.98] outline-none',
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 font-bold ring-1 ring-emerald-500/30 shadow-xs'
                      : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground',
                  )}
                >
                  <Icon
                    className={cn(
                      'size-3.5 shrink-0 transition-colors',
                      isActive ? 'text-primary' : 'text-muted-foreground/70 group-hover:text-foreground',
                    )}
                  />
                  <span>{tab.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 2FA 세션 승격 모달 */}
      <AdminStepupOtpModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode="elevate"
        actionName="관리자 콘솔 15분 세션 승격"
        onSuccess={() => {
          setElevated(true);
          setRemainingSeconds(900);
          setModalOpen(false);
        }}
      />
    </>
  );
}
