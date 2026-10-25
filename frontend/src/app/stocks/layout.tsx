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
            '10대 가상 상장사 시세·차트 · 주문 잔량이 아닌 수동 입력용 가격 참조표',
            'Virtual stock quotes and charts with reference prices for manual order entry; no live order-book depth.',
            '仮想株式の相場・チャートと注文入力用の参考価格。実際の注文板ではありません。',
            '10家虚拟上市公司报价与图表，参考价格仅供手动输入，并非真实挂单。',
            'Báo giá và biểu đồ cổ phiếu ảo; mức giá tham khảo không phải sổ lệnh thực tế.'
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
