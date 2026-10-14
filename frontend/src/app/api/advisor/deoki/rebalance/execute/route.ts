import { NextResponse } from 'next/server';
import { isLoggedInMember } from '@/lib/session';

export const dynamic = 'force-dynamic';

export interface RebalanceTradeItem {
  readonly asset: string;
  readonly code: string;
  readonly action: 'BUY' | 'SELL' | 'HOLD';
  readonly amountWld: number;
  readonly quantity: number;
  readonly unitPriceWld: number;
  readonly feeWld: number;
  readonly status: 'SIMULATED_FILLED' | 'ALLOCATED';
}

export interface RebalanceExecutionReceipt {
  readonly executionId: string;
  readonly executedAt: string;
  readonly isSimulated: boolean;
  readonly totalRebalancedWld: number;
  readonly feeDiscountWld: number;
  readonly netCashBalanceWld: number;
  readonly prIndexBefore: number;
  readonly prIndexAfter: number;
  readonly trades: readonly RebalanceTradeItem[];
  readonly adviceSummary: string;
}

export async function POST(req: Request) {
  try {
    const _isLoggedIn = await isLoggedInMember();
    const body = (await req.json().catch(() => ({}))) as {
      targetStocksRatio?: number;
      targetBondsRatio?: number;
      targetCashRatio?: number;
    };

    // 타겟 비중 기본값 (주식 55%, 국채 20%, 현금 25%)
    const targetStocks = body.targetStocksRatio ?? 55;
    const targetBonds = body.targetBondsRatio ?? 20;
    const targetCash = body.targetCashRatio ?? 25;

    const executionId = `sim-reb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    // R05 해결: 백엔드 실제 시장 주문 체결이 아닌 시뮬레이션임을 명확히 규정 (SIMULATED_FILLED)
    const trades: RebalanceTradeItem[] = [
      {
        asset: '월덕 테크 우량주 (CHIPS)',
        code: 'CHIPS',
        action: 'SELL',
        amountWld: 1200000,
        quantity: 120,
        unitPriceWld: 10000,
        feeWld: 1200,
        status: 'SIMULATED_FILLED',
      },
      {
        asset: '국가공인 국채 (KTB 5년물)',
        code: 'KTB-05Y',
        action: 'BUY',
        amountWld: 850000,
        quantity: 85,
        unitPriceWld: 10000,
        feeWld: 850,
        status: 'SIMULATED_FILLED',
      },
      {
        asset: '현금/비상금 예치 (CASH)',
        code: 'WLD-CASH',
        action: 'HOLD',
        amountWld: 350000,
        quantity: 350000,
        unitPriceWld: 1,
        feeWld: 0,
        status: 'ALLOCATED',
      },
    ];

    const totalRebalancedWld = trades.reduce((sum, t) => sum + (t.action !== 'HOLD' ? t.amountWld : 0), 0);
    const feeDiscountWld = 1025; // 어드바이저 50% 우대 수수료 할인

    const receipt: RebalanceExecutionReceipt = {
      executionId,
      executedAt: now,
      isSimulated: true, // R05: 항상 시뮬레이션 명시
      totalRebalancedWld,
      feeDiscountWld,
      netCashBalanceWld: 350000,
      prIndexBefore: 40,
      prIndexAfter: 88,
      trades,
      adviceSummary: `목표 비중(주식 ${targetStocks}%, 국채 ${targetBonds}%, 현금 ${targetCash}%)에 맞춰 모의 분할 매매 시뮬레이션이 완료되었습니다. 포트폴리오 안전 지수(PR-Index)가 40점에서 88점으로 상향 예상됩니다.`,
    };

    return NextResponse.json({
      success: true,
      isDemo: true, // R05: 항상 투명하게 데모/시뮬레이션 모드로 반환
      isSimulated: true,
      receipt,
      message: '덕이 AI 포트폴리오 리밸런싱 모의 시뮬레이션 결과가 정상 발급되었습니다.',
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '리밸런싱 주문 처리 중 오류가 발생했습니다.';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
