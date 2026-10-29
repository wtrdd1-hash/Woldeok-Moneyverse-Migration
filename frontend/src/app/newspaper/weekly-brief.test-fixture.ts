import type { WeeklyBriefData } from './weekly-world-brief';

// Synthetic values are only used in isolated component tests, never in the application.
export const SYNTHETIC_TEST_BRIEF: WeeklyBriefData = {
  weekNumber: 39,
  period: '2026년 9월 4주차',
  oneLiner: '가상 주식 거래량 24% 급증과 함께 도시 공공 프로젝트 기여로 42만 WLD가 영구 소각되어 M0 유동성이 매우 건전하게 유지되고 있습니다.',
  m0Supply: 12450000,
  weeklySinkAmount: 421500,
  inflationRate: 1.4,
  topTradedStocks: [
    { rank: 1, symbol: 'CHIPS', name: '가상 반도체 홀딩스', volume: 48200, changeRate: '+4.8%' },
    { rank: 2, symbol: 'SPACE', name: '스페이스 오빗 탐사선', volume: 31500, changeRate: '+12.5%' },
    { rank: 3, symbol: 'BIO', name: '바이오 넥스트랩', volume: 24100, changeRate: '-1.8%' },
  ],
  weeklyLeaders: [
    { category: '주간 최다 소각 기여', name: '월덕파운더', value: '150,000 WLD 소각', badge: '도시 건립자' },
    { category: '주간 주식 수익률 1위', name: '알파헌터', value: '+34.8% 순익', badge: '트레이딩 마스터' },
    { category: '주간 직업 업무 성실왕', name: '메트로배달부', value: '182건 업무 완료', badge: '시민의 발' },
  ],
  learningInsight: {
    title: '이번 주 금융 한 줄: 매몰비용의 오류(Sunk Cost Fallacy)와 분산 투자',
    takeaway: '이미 지출된 비용에 집착하여 손실 중인 단일 종목에 무리하게 추가 매수를 거듭하기보다, 정기적인 포트폴리오 리밸런싱과 가상 은행 세이빙 포켓 분산 예치를 통해 리스크를 체계적으로 헤지하는 것이 자산 보존의 핵심입니다.',
    actionTip: '보유 주식 중 목표가에 도달했거나 비중이 과도한 종목을 일부 실현하고 은행 고금리 적금 포켓으로 안전 자산을 확보하세요.',
  },
};
