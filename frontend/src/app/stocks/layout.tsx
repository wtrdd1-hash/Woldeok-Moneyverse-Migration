import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { StocksSubNav } from './stocks-sub-nav';
import { LiveBadge } from './live';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function StocksLayout({ children }: { readonly children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 sm:space-y-6 px-3 sm:px-6 py-2 sm:py-4 pb-28 zero-overflow-shield">
      {/* 1. 주식 거래소 통합 헤더 (단일화하여 중복 및 겹침 원천 차단) */}
      <div className="space-y-1.5 pt-2">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
            가상 주식 거래소
          </h1>
          <LiveBadge />
        </div>
        <p className="text-xs sm:text-sm text-slate-400 font-medium">
          10대 가상 상장사 실시간 10단 호가창 · 1초 체결 모의투자 시뮬레이터
        </p>
      </div>

      {/* 2. 토스 증권 스타일 세그먼트 서브 내비게이션 바 */}
      <StocksSubNav />

      {/* 3. 서브페이지 본문 */}
      <div className="w-full min-w-0">
        {children}
      </div>
    </div>
  );
}
