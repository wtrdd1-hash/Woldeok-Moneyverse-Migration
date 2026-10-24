import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { StocksSubNav } from './stocks-sub-nav';
import { LiveBadge } from './live';
import { getServerLocale } from '@/lib/locale-server';
import { localeLabel } from '@/lib/locale';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function StocksLayout({ children }: { readonly children: ReactNode }) {
  const locale = await getServerLocale();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 sm:space-y-6 px-3 sm:px-6 py-2 sm:py-4 pb-28 zero-overflow-shield">
      {/* 1. 주식 거래소 통합 헤더 (5개 언어 완벽 지원) */}
      <div className="space-y-1.5 pt-2">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
            {localeLabel(
              locale,
              '가상 주식 거래소',
              'Virtual Stock Exchange',
              '仮想株式取引所',
              '虚拟股票交易所',
              'Sàn giao dịch Cổ phiếu ảo'
            )}
          </h1>
          <LiveBadge />
        </div>
        <p className="text-xs sm:text-sm text-slate-400 font-medium">
          {localeLabel(
            locale,
            '10대 가상 상장사 실시간 10단 호가창 · 1초 체결 모의투자 시뮬레이터',
            'Real-time Level 2 orderbook matching simulation with instant execution across virtual equities.',
            '仮想上場企業10社のリアルタイム板情報・1秒約定の模擬投資シミュレーター。',
            '10家虚拟上市公司实时十档盘口与秒级撮合模拟交易平台。',
            'Mô phỏng khớp lệnh thời gian thực và sổ lệnh cấp 2 của 10 công ty niêm yết ảo.'
          )}
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
