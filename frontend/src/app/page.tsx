import type { Metadata } from 'next';
import Link from 'next/link';
import { currentViewer } from '@/lib/viewer';
import { apiOrNull } from '@/lib/api';

export const metadata: Metadata = {
  title: '홈 대시보드 · W Moneyverse',
  description: '게임형 금융 · 가상경제 서비스 홈 대시보드',
};

interface WalletSummary {
  readonly cashBalance?: string | number;
  readonly depositBalance?: string | number;
  readonly netWorth?: string | number;
}

export default async function HomePage() {
  const viewer = await currentViewer();
  const wallet = await apiOrNull<WalletSummary>('/api/v1/wallet/summary');

  const signedIn = viewer?.signedIn ?? false;
  const nickname = signedIn ? '회원' : '여행자';

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1240px] mx-auto animate-fade-in">
      {/* 1. Game-Economy Hero Banner with Neon City Skyline & W Emblem */}
      <section
        aria-labelledby="home-hero-title"
        className="relative flex items-center justify-between bg-gradient-to-br from-[#141a32]/95 to-[#0d1123]/98 border border-[#8b5cf6]/25 rounded-2xl p-8 lg:p-10 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
      >
        <div className="relative z-10 flex flex-col gap-3 max-w-[580px]">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#a78bfa] uppercase">
            <span>✦</span>
            <span>WOLDEOK MONEYVERSE • HOME</span>
          </div>
          <h2 id="home-hero-title" className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            홈 대시보드
          </h2>
          <p className="text-sm lg:text-base text-[#cbd5e1] leading-relaxed">
            게임형 금융 · 가상경제 서비스<br />
            <span className="text-xs text-[#94a3b8]">실제 서비스 기능 및 권한에 따라 표시</span>
          </p>

          {/* Time scale info box (matching v10 preview spec exactly) */}
          <div className="mt-3 p-3 lg:p-4 bg-[#0f152a]/80 border border-[#9c83ff]/35 rounded-xl inline-flex flex-col gap-1 w-fit">
            <span className="text-[#cbb9ff] text-xs font-bold">서버 게임 시간 기준</span>
            <span className="text-white text-xs lg:text-sm font-mono font-medium">
              현실 10분 = 서버 1일 · 서버 7일 = 서버 1주
            </span>
          </div>
        </div>

        {/* Hero Right Visual: Neon Skyline SVG, Moon Ring, W Gem Badge */}
        <div className="relative z-0 hidden md:flex items-center justify-center min-w-[320px] h-[220px]" aria-hidden="true">
          <svg className="absolute right-0 bottom-[-20px] h-[220px] opacity-70 pointer-events-none" viewBox="0 0 400 220" fill="none">
            <path
              d="M40 220V120H70V80H90V220H130V60H160V100H180V220H220V90H240V40H260V220H300V110H330V70H350V220H400V220H0V220H40Z"
              fill="url(#neon-skyline-grad)"
              opacity="0.4"
            />
            <path
              d="M120 220V110H140V70H170V220H210V50H230V20H250V220H280V130H310V90H340V220Z"
              fill="url(#neon-buildings-grad)"
              opacity="0.6"
            />
            <defs>
              <linearGradient id="neon-skyline-grad" x1="200" y1="40" x2="200" y2="220" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8b5cf6" stopOpacity="0.6" />
                <stop offset="1" stopColor="#1e1b4b" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="neon-buildings-grad" x1="230" y1="20" x2="230" y2="220" gradientUnits="userSpaceOnUse">
                <stop stopColor="#c084fc" stopOpacity="0.8" />
                <stop offset="1" stopColor="#312e81" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>

          {/* Moon Glow Ring */}
          <div className="absolute right-8 top-4 w-36 h-36 rounded-full border-2 border-[#8b5cf6]/50 bg-radial from-[#8b5cf6]/20 to-transparent shadow-[0_0_35px_rgba(139,92,246,0.35)]" />

          {/* W Emblem Crown Badge */}
          <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1e1b4b]/95 to-[#0f172a]/95 border border-[#a78bfa]/40 flex items-center justify-center shadow-[0_0_25px_rgba(139,92,246,0.35)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/favicon.ico" alt="W Emblem" className="w-12 h-12 object-contain drop-shadow-[0_0_10px_rgba(192,132,252,0.6)]" />
          </div>
        </div>
      </section>

      {/* 2. Dual-Card 2-Column Exact Grid Layout (Matching v2026.11.23.10 preview) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Card: Real Asset Status */}
        <article className="bg-[#11162b] border border-[#8b5cf6]/20 rounded-2xl p-6 lg:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.35)] flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-[#1f2647] pb-4">
            <h3 className="text-lg font-bold text-white tracking-tight">실제 자산 현황</h3>
            {signedIn && (
              <span className="text-xs px-2.5 py-1 bg-[#1e1b4b] border border-[#7c3aed]/40 text-[#c084fc] rounded-lg font-semibold">
                {nickname} 님 접속 중
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3.5">
            {/* Item 1: Game Progress / Asset */}
            <div className="p-4 bg-[#0b0f1d] border border-slate-700/20 hover:border-[#8b5cf6]/40 rounded-xl transition-all">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-[#f1f5f9]">게임 진행 상태</span>
                {signedIn && wallet?.netWorth && (
                  <span className="text-xs font-mono font-bold text-[#34d399]">
                    순자산: {Number(wallet.netWorth).toLocaleString()} WLD
                  </span>
                )}
              </div>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                {signedIn
                  ? `현금 지갑: ${Number(wallet?.cashBalance ?? 0).toLocaleString()} WLD · 예금: ${Number(wallet?.depositBalance ?? 0).toLocaleString()} WLD`
                  : '승인된 서버 정보 또는 해당 페이지 원문을 연동'}
              </p>
            </div>

            {/* Item 2: Recent Activity */}
            <div className="p-4 bg-[#0b0f1d] border border-slate-700/20 hover:border-[#8b5cf6]/40 rounded-xl transition-all">
              <div className="text-sm font-bold text-[#f1f5f9] mb-1">최근 활동</div>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                {signedIn ? '실시간 원장 트랜잭션 기록이 안전하게 보호됩니다.' : '승인된 서버 정보 또는 해당 페이지 원문을 연동'}
              </p>
            </div>

            {/* Item 3: Clock & Quest */}
            <div className="p-4 bg-[#0b0f1d] border border-slate-700/20 hover:border-[#8b5cf6]/40 rounded-xl transition-all">
              <div className="text-sm font-bold text-[#f1f5f9] mb-1">시계·퀘스트</div>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                {signedIn ? '일일 금융 퀘스트 및 가상 상장사 주식 모의투자 진행 중' : '승인된 서버 정보 또는 해당 페이지 원문을 연동'}
              </p>
            </div>
          </div>
        </article>

        {/* Right Card: Home Dashboard Key Links */}
        <article className="bg-[#11162b] border border-[#8b5cf6]/20 rounded-2xl p-6 lg:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.35)] flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-[#1f2647] pb-4">
            <h3 className="text-lg font-bold text-white tracking-tight">홈 대시보드 · 주요 항목</h3>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/wallet"
              className="flex items-center justify-between p-4 bg-[#0b0f1d] border border-slate-700/20 hover:border-[#8b5cf6] hover:bg-[#0d1326] text-[#f1f5f9] hover:text-[#c084fc] rounded-xl text-sm font-semibold transition-all group"
            >
              <span>실제 자산 현황</span>
              <span className="text-[#8b5cf6] text-base group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>

            <Link
              href="/quests"
              className="flex items-center justify-between p-4 bg-[#0b0f1d] border border-slate-700/20 hover:border-[#8b5cf6] hover:bg-[#0d1326] text-[#f1f5f9] hover:text-[#c084fc] rounded-xl text-sm font-semibold transition-all group"
            >
              <span>게임 진행 상태</span>
              <span className="text-[#8b5cf6] text-base group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>

            <Link
              href="/bank"
              className="flex items-center justify-between p-4 bg-[#0b0f1d] border border-slate-700/20 hover:border-[#8b5cf6] hover:bg-[#0d1326] text-[#f1f5f9] hover:text-[#c084fc] rounded-xl text-sm font-semibold transition-all group"
            >
              <span>최근 활동</span>
              <span className="text-[#8b5cf6] text-base group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>

            <Link
              href="/status"
              className="flex items-center justify-between p-4 bg-[#0b0f1d] border border-slate-700/20 hover:border-[#8b5cf6] hover:bg-[#0d1326] text-[#f1f5f9] hover:text-[#c084fc] rounded-xl text-sm font-semibold transition-all group"
            >
              <span>시계·퀘스트</span>
              <span className="text-[#8b5cf6] text-base group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
