import type { Metadata } from 'next';
import Link from 'next/link';
import { currentViewer } from '@/lib/viewer';
import { apiOrNull } from '@/lib/api';

export const metadata: Metadata = {
  title: '홈 대시보드 · W Moneyverse',
  description: '게임형 금융 · 가상경제 서비스 대시보드',
};

interface WalletSummary {
  readonly cashBalance?: string | number;
  readonly depositBalance?: string | number;
  readonly netWorth?: string | number;
}

interface MarketSummary {
  readonly indexValue?: number;
  readonly changeRate?: number;
  readonly activeTraders?: number;
}

export default async function HomePage() {
  const viewer = await currentViewer();
  const signedIn = viewer?.signedIn ?? false;
  const wallet = signedIn ? await apiOrNull<WalletSummary>('/api/v1/wallet/summary') : null;
  const market = await apiOrNull<MarketSummary>('/api/v1/stocks/market-summary');

  const wIndex = market?.indexValue ?? 1254.8;
  const changeRate = market?.changeRate ?? 1.42;
  const isPositive = changeRate >= 0;

  return (
    <div className="flex flex-col gap-5 w-full max-w-[1240px] mx-auto animate-fade-in">
      {/* 1. GH-01 / GH-08: 슬림형 게임 경제 히어로 배너 (높이 압축 & 정보 밀도 극대화) */}
      <section
        aria-labelledby="home-hero-title"
        className="relative flex flex-col md:flex-row items-start md:items-center justify-between bg-gradient-to-r from-[#0d1224] via-[#11172f] to-[#0c1020] border border-[#8b5cf6]/25 rounded-2xl p-5 lg:p-6 overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
      >
        <div className="relative z-10 flex flex-col gap-2 max-w-[620px]">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#a78bfa] uppercase">
            <span>✦</span>
            <span>WOLDEOK MONEYVERSE • GUILD DASHBOARD</span>
            <span className="hidden sm:inline-block px-2 py-0.5 bg-[#1e1b4b] border border-[#7c3aed]/30 text-[#c084fc] rounded-full text-[11px] font-mono">
              서버 10분 = 현실 1일
            </span>
          </div>

          <h2 id="home-hero-title" className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
            홈 대시보드
          </h2>

          <p className="text-xs lg:text-sm text-[#94a3b8] leading-relaxed">
            원장 기반 가상경제 플랫폼 · 실제 권한 및 실시간 세션에 연동됩니다.
          </p>
        </div>

        {/* 배너 우측 콤팩트 서버 상태 칩 */}
        <div className="relative z-10 mt-3 md:mt-0 flex items-center gap-3">
          <div className="p-3 bg-[#0a0e1c]/80 border border-[#8b5cf6]/30 rounded-xl flex flex-col gap-1 min-w-[180px]">
            <div className="flex items-center justify-between text-[11px] text-[#a78bfa] font-semibold">
              <span>서버 게임 시간</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-xs font-mono font-bold text-white">
              10181일차 · 1455주 3일
            </div>
          </div>
        </div>

        {/* 배경 SVG 글로우 장식 */}
        <div className="absolute right-0 top-0 w-72 h-full opacity-20 pointer-events-none bg-radial from-[#8b5cf6] to-transparent" />
      </section>

      {/* 2. GH-07 / GH-02 / GH-06: 4영역 벤토 그리드 (Bento Grid Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        
        {/* 영역 A (GH-04): 내 자산 현황 카드 (로그인/게스트 엄격 분기) */}
        <article className="lg:col-span-2 bg-[#11162b] border border-[#8b5cf6]/20 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#1f2647] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white">내 자산 현황</span>
                <span className="text-[11px] px-2 py-0.5 bg-violet-950/80 text-violet-300 border border-violet-700/30 rounded font-mono">
                  LEDGER
                </span>
              </div>
              {signedIn ? (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  인증 회원
                </span>
              ) : (
                <span className="text-xs text-slate-400 font-medium">게스트 체험 모드</span>
              )}
            </div>

            {signedIn ? (
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 bg-[#0b0f1d] border border-slate-800/80 rounded-xl">
                  <span className="text-[11px] font-medium text-slate-400 block mb-1">지갑 현금</span>
                  <span className="text-sm lg:text-base font-bold font-mono text-white tabular-nums">
                    {Number(wallet?.cashBalance ?? 0).toLocaleString()} <span className="text-xs text-amber-400">WLD</span>
                  </span>
                </div>
                <div className="p-3 bg-[#0b0f1d] border border-slate-800/80 rounded-xl">
                  <span className="text-[11px] font-medium text-slate-400 block mb-1">은행 예치금</span>
                  <span className="text-sm lg:text-base font-bold font-mono text-white tabular-nums">
                    {Number(wallet?.depositBalance ?? 0).toLocaleString()} <span className="text-xs text-amber-400">WLD</span>
                  </span>
                </div>
                <div className="p-3 bg-[#0b0f1d] border border-slate-800/80 rounded-xl">
                  <span className="text-[11px] font-medium text-slate-400 block mb-1">총 순자산</span>
                  <span className="text-sm lg:text-base font-bold font-mono text-emerald-400 tabular-nums">
                    {Number(wallet?.netWorth ?? 0).toLocaleString()} <span className="text-xs text-emerald-300">WLD</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#0b0f1d] border border-slate-800/60 rounded-xl mb-4 flex flex-col gap-2">
                <p className="text-xs text-slate-300 leading-relaxed">
                  로그인하시면 실제 원장 계좌 잔액 확인, 가상 주식 거래 및 예적금 기능을 이용하실 수 있습니다.
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Link
                    href="/login"
                    className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    로그인 / 시작하기
                  </Link>
                  <span className="text-[11px] text-slate-400">소셜 계정 즉시 연동</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#1f2647]/50 text-xs text-slate-400">
            <span>트랜잭션 암호화 원장 동기화 완료</span>
            <Link href="/wallet" className="text-violet-400 hover:text-violet-300 font-semibold inline-flex items-center gap-1">
              상세 지갑 열기 &rarr;
            </Link>
          </div>
        </article>

        {/* 영역 B (GH-07): 실시간 가상경제 지표 (W-INDEX 50) */}
        <article className="bg-[#11162b] border border-[#8b5cf6]/20 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#1f2647] pb-3 mb-4">
              <span className="text-base font-bold text-white">가상 주식 시장</span>
              <span className="text-[11px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">
                W-INDEX 50
              </span>
            </div>

            <div className="p-3 bg-[#0b0f1d] border border-slate-800/80 rounded-xl mb-3 flex flex-col gap-1">
              <span className="text-[11px] text-slate-400 font-medium">대표 경제 지수</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono text-white tabular-nums">
                  {wIndex.toFixed(1)}
                </span>
                <span className={`text-xs font-bold font-mono ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPositive ? `+${changeRate}%` : `${changeRate}%`}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal">
              현실 10분 주기마다 시장 틱이 갱신되며, 국채 및 가상 기업 배당이 정산됩니다.
            </p>
          </div>

          <div className="pt-2 border-t border-[#1f2647]/50 text-xs">
            <Link href="/stocks" className="text-violet-400 hover:text-violet-300 font-semibold inline-flex items-center gap-1">
              거래소 호가창 바로가기 &rarr;
            </Link>
          </div>
        </article>

        {/* 영역 C (GH-03 / GH-05): 실시간 시스템 공지 및 라이브 피드 */}
        <article className="bg-[#11162b] border border-[#8b5cf6]/20 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#1f2647] pb-3 mb-3">
              <span className="text-base font-bold text-white">공지사항</span>
              <span className="text-[11px] text-slate-400">안정화 완료</span>
            </div>

            <div className="flex flex-col gap-2 mb-3">
              <div className="p-2.5 bg-[#0b0f1d] border border-slate-800/70 rounded-lg">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-violet-300 font-semibold">[시스템]</span>
                  <span className="text-slate-400 font-mono">11-24</span>
                </div>
                <p className="text-xs text-slate-200 line-clamp-1">
                  v10 게임 테마 벤토 그리드 및 금융 원장 정상 연동
                </p>
              </div>

              <div className="p-2.5 bg-[#0b0f1d] border border-slate-800/70 rounded-lg">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-emerald-400 font-semibold">[서버]</span>
                  <span className="text-slate-400 font-mono">11-24</span>
                </div>
                <p className="text-xs text-slate-200 line-clamp-1">
                  테스트 서버 및 프로덕션 동기화 완료
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#1f2647]/50 text-xs">
            <Link href="/announcements" className="text-violet-400 hover:text-violet-300 font-semibold inline-flex items-center gap-1">
              전체 공지 목록 &rarr;
            </Link>
          </div>
        </article>

      </div>

      {/* 3. 퀵 서비스 내비게이션 그리드 (GH-03) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/bank"
          className="flex items-center justify-between p-3.5 bg-[#11162b] hover:bg-[#151c36] border border-[#8b5cf6]/20 hover:border-[#8b5cf6]/50 rounded-xl transition-all group"
        >
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors">은행 예적금</span>
            <span className="text-[11px] text-slate-400">금리 연 4.5%~6.0%</span>
          </div>
          <span className="text-violet-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
        </Link>

        <Link
          href="/stocks"
          className="flex items-center justify-between p-3.5 bg-[#11162b] hover:bg-[#151c36] border border-[#8b5cf6]/20 hover:border-[#8b5cf6]/50 rounded-xl transition-all group"
        >
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors">주식 거래소</span>
            <span className="text-[11px] text-slate-400">실시간 모의투자</span>
          </div>
          <span className="text-violet-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
        </Link>

        <Link
          href="/casino"
          className="flex items-center justify-between p-3.5 bg-[#11162b] hover:bg-[#151c36] border border-[#8b5cf6]/20 hover:border-[#8b5cf6]/50 rounded-xl transition-all group"
        >
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors">카지노 · 아케이드</span>
            <span className="text-[11px] text-slate-400">하이로우 & 슬롯</span>
          </div>
          <span className="text-violet-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
        </Link>

        <Link
          href="/quests"
          className="flex items-center justify-between p-3.5 bg-[#11162b] hover:bg-[#151c36] border border-[#8b5cf6]/20 hover:border-[#8b5cf6]/50 rounded-xl transition-all group"
        >
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors">퀘스트 · 활동</span>
            <span className="text-[11px] text-slate-400">일일 금융 보상</span>
          </div>
          <span className="text-violet-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
