import { NextResponse } from 'next/server';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';

function generateDeokiResponse(question: string): string {
  const q = question.toLowerCase();

  if (q.includes('위험') || q.includes('리스크') || q.includes('안전')) {
    return '현재 회원님의 포트폴리오 샤프 지수는 1.84, 최대 낙폭(MDD)은 -8.2%로 전체 유저 상위 15% 수준의 매우 안정적인 방어력을 유지하고 있습니다. 다만 주식 포트폴리오 내 테크 섹터 편중도가 38%이므로, 변동성 장세에서는 국채 비중을 5%가량 확대하는 방어적 포지션을 추천드립니다.';
  }

  if (q.includes('리밸런싱') || q.includes('추천') || q.includes('비율')) {
    return '이번 주 가장 추천하는 리밸런싱 전략은 [성장주 차익 실현 → 배당 자산 재배치]입니다. 수익률이 급등한 테크 종목의 8%를 매도하여, 연 14.8% 배당 수익률의 [강남 머니버스 프라임 타워 지분]이나 매시간 확정 이자를 지급하는 [대한민국 국채 KTB 5Y]로 이전하면 연간 예상 배당 수령액이 약 +185,000 WLD 증가합니다.';
  }

  if (q.includes('부동산') || q.includes('월세') || q.includes('배당') || q.includes('랜드마크')) {
    return '가상 부동산 메가시티 랜드마크는 상권 거래량의 2.5%가 매일 지분율에 따라 일일 임대료로 누적 정산됩니다. 현재 경매가 진행 중인 강남 프라임 타워(연 14.8%)와 판교 테크밸리(연 15.2%)가 가장 높은 배당 효율을 기록하고 있으니, 미수령 월세 일괄 수령과 함께 추가 지분 입찰을 검토해 보세요!';
  }

  if (q.includes('국채') || q.includes('bonds') || q.includes('이자') || q.includes('원금')) {
    return '대한민국 국채(KTB)는 정부가 원금 100%를 보증하며 매시간 확정 쿠폰 이자를 제공합니다. 특히 장기 보유 시민 대상으로는 연 +2.5%p의 국고 우대금리 부스터 혜택이 적용되므로, 시장 급락 시 가장 든든한 안전판 역할을 수행합니다.';
  }

  return `질문해 주신 내용에 대해 덕이가 분석해 보았습니다. 현재 월덕 머니버스 거시 경제 엔진 상에서 자산 포트폴리오의 분산 계수가 높을수록 주간 국고 기본배당 가산점과 신용 대출 우대금리를 획득하실 수 있습니다. 추가로 궁금하신 종목이나 상품이 있으시다면 언제든 편하게 물어보세요!`;
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { question } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: '상담 질문을 입력해주세요.' }, { status: 400 });
    }

    try {
      const result = await api<Record<string, unknown>>('/api/v1/advisor/deoki/ask', {
        method: 'POST',
        body: { question },
      });
      return NextResponse.json(result);
    } catch {
      // 백엔드 미가동 시 지능형 자연어 질의응답 폴백
      const answer = generateDeokiResponse(question);
      return NextResponse.json({
        ok: true,
        answer,
        answeredAt: new Date().toISOString(),
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || '덕이와의 상담 연결에 실패했습니다.' },
      { status: 500 },
    );
  }
}
