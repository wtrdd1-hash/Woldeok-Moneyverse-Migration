import Link from 'next/link';
import { Home, ArrowLeft, TrendingUp, Landmark, Wallet, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[65vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="relative mb-6">
        <span className="text-7xl font-black tracking-tighter text-amber-500/20 sm:text-9xl">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-black text-amber-500 sm:text-2xl">
            PAGE NOT FOUND
          </span>
        </div>
      </div>

      <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
        요청하신 페이지를 찾을 수 없습니다
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground [word-break:keep-all]">
        입력하신 주소가 잘못되었거나, 페이지가 변경 혹은 삭제되어 더 이상 제공되지 않습니다.
        아래 주요 서비스를 이용하시거나 홈 화면으로 안전하게 이동해 보세요.
      </p>

      {/* Main Action Buttons */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="min-h-11 bg-amber-500 font-bold text-black hover:bg-amber-400">
          <Link href="/" className="inline-flex items-center gap-2">
            <Home className="size-4" />
            홈으로 이동
          </Link>
        </Button>
        <Button asChild variant="outline" className="min-h-11 border-border/80 font-medium">
          <Link href="/announcements" className="inline-flex items-center gap-2">
            <Bell className="size-4" />
            공지사항 확인
          </Link>
        </Button>
      </div>

      {/* Quick Services Links Bar */}
      <div className="mt-12 w-full rounded-2xl border border-border/60 bg-surface/50 p-5 backdrop-blur-sm">
        <p className="text-xs font-semibold text-muted-foreground">
          자주 찾는 머니버스 핵심 금융 서비스
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2.5 sm:gap-3">
          <Link
            href="/stocks"
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border/40 bg-surface/80 p-3 text-xs font-medium text-foreground transition-colors hover:border-amber-500/40 hover:bg-surface"
          >
            <TrendingUp className="size-4 text-emerald-500" />
            <span>주식 거래소</span>
          </Link>
          <Link
            href="/bank"
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border/40 bg-surface/80 p-3 text-xs font-medium text-foreground transition-colors hover:border-amber-500/40 hover:bg-surface"
          >
            <Landmark className="size-4 text-sky-500" />
            <span>중앙은행</span>
          </Link>
          <Link
            href="/wallet"
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border/40 bg-surface/80 p-3 text-xs font-medium text-foreground transition-colors hover:border-amber-500/40 hover:bg-surface"
          >
            <Wallet className="size-4 text-amber-500" />
            <span>통합 지갑</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
