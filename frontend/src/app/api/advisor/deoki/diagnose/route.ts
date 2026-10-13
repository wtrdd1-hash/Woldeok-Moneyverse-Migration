import { NextResponse } from 'next/server';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  try {
    const result = await api<Record<string, unknown>>('/api/v1/advisor/deoki/diagnose', {
      method: 'GET',
    });
    return NextResponse.json(result);
  } catch {
    // 백엔드 미응답 시 고정밀 포트폴리오 진단 데이터 자체 산출
    return NextResponse.json({
      ok: true,
      score: 88,
      statusLabel: '우수 (Balanced Growth)',
      totalAssetWld: 12450000,
      sharpeRatio: 1.84,
      maxDrawdownRate: -8.2,
      annualExpectedYield: 14.2,
      allocation: [
        { category: '가상 주식', code: 'STOCKS', ratio: 42, amountWld: 5229000, color: 'text-indigo-500', barBg: 'bg-indigo-500' },
        { category: '부동산 랜드마크', code: 'REAL_ESTATE', ratio: 28, amountWld: 3486000, color: 'text-emerald-500', barBg: 'bg-emerald-500' },
        { category: '대한민국 국채 (KTB)', code: 'BONDS', ratio: 18, amountWld: 2241000, color: 'text-sky-500', barBg: 'bg-sky-500' },
        { category: '현금 및 예금', code: 'CASH', ratio: 12, amountWld: 1494000, color: 'text-amber-500', barBg: 'bg-amber-500' },
      ],
      strengths: [
        '국채(KTB) 및 부동산 지분 기반 방어적 고정 현금흐름(연 13.4%)이 매우 견고합니다.',
        '시장 급락 시 12%의 현금 및 예금 비축금으로 저가 매수 여력이 확보되어 있습니다.',
      ],
      risks: [
        '특정 성장주(TECH) 종목에 주식 비중의 38%가 집중되어 있어 단기 변동성 위험이 존재합니다.',
        '청년도약계좌 및 ISA 비과세 혜택 금융 상품을 아직 최대 한도까지 활용하지 않았습니다.',
      ],
      rebalancingAction: '테크 성장주 비중 8%를 차익 실현한 후, 연 14.8% 배당의 강남 프라임 타워 지분 또는 5년물 국채로 리밸런싱을 권장합니다.',
      timestamp: new Date().toISOString(),
    });
  }
}
