/**
 * WDX Virtual Stock Corporate Action & Market Disclosure Dataset (Section 5.6)
 */

export interface CorporateDisclosure {
  readonly id: string;
  readonly symbol: string;
  readonly companyName: string;
  readonly sector: '기술' | '금융' | '유통' | '물류' | '에너지' | '바이오' | '엔터' | '지수';
  readonly disclosureType: '실적공시' | '신제품/기술' | '투자/제휴' | '리스크/사고' | '배당/소각';
  readonly impactDirection: 'up' | 'down';
  readonly expectedImpactPct: string;
  readonly title: string;
  readonly summary: string;
  readonly detailedBody: string;
  readonly publishedAt: string;
  readonly verifiedOfficial: boolean;
}

export const STOCK_SECTOR_MAP: Readonly<Record<string, '기술' | '금융' | '유통' | '물류' | '에너지' | '바이오' | '엔터' | '지수'>> = {
  WDG: '엔터',
  CHIMU314: '기술',
  WDM: '유통',
  WDB: '금융',
  WDT: '기술',
  MYUY: '바이오',
  CHIPS: '기술',
  DUCK: '금융',
  WFIN: '금융',
  SPACE: '물류',
  'WDX-TEC': '기술',
  'WDX-FIN': '금융',
  'WDX-RET': '유통',
  'WDX-LOG': '물류',
  'WDX-ENE': '에너지',
  'WDX-BIO': '바이오',
  'WDX-ENT': '엔터',
  'WDX-IND': '지수',
};

export const CORPORATE_DISCLOSURES: readonly CorporateDisclosure[] = [
  {
    id: 'disc-wdg-001',
    symbol: 'WDG',
    companyName: '월덕게임즈',
    sector: '엔터',
    disclosureType: '신제품/기술',
    impactDirection: 'up',
    expectedImpactPct: '+5.4% ~ +8.2%',
    title: '[공시] 글로벌 메타버스 신작 MMORPG 동시접속자 50만 돌파',
    summary: '북미·아시아 전역에서 자체 퍼블리싱 신작이 흥행하며 인앱 결제 및 아이템 거래량이 급증했습니다.',
    detailedBody: '월덕게임즈 이사회는 금일 분기 결산 브리핑을 통해 신규 출시된 가상 경제 연동형 게임의 일일 활성 사용자 수(DAU)가 120만 명을 기록했다고 공시했습니다. 이에 따라 플랫폼 수수료 매출이 전분기 대비 34% 증가할 것으로 전망됩니다.',
    publishedAt: '2026-10-03T09:00:00.000Z',
    verifiedOfficial: true,
  },
  {
    id: 'disc-wdt-002',
    symbol: 'WDT',
    companyName: '월덱테크',
    sector: '기술',
    disclosureType: '신제품/기술',
    impactDirection: 'up',
    expectedImpactPct: '+4.0% ~ +6.5%',
    title: '[공시] 차세대 AI 가상 금융 분석 엔진 V3 글로벌 라이선스 계약',
    summary: '월덱테크가 개발한 초저지연 금융 원장 알고리즘이 3개 대형 거래소 컨소시엄에 공식 채택되었습니다.',
    detailedBody: '본 계약은 3개년 다년도 라이선스 공급 계약으로, 연간 고정 로열티 및 API 호출 트래픽 기반 인센티브를 포함하고 있어 안정적인 현금 흐름 창출에 기여할 것으로 기대됩니다.',
    publishedAt: '2026-10-03T10:30:00.000Z',
    verifiedOfficial: true,
  },
  {
    id: 'disc-wdb-003',
    symbol: 'WDB',
    companyName: '덕뱅크홀딩스',
    sector: '금융',
    disclosureType: '배당/소각',
    impactDirection: 'up',
    expectedImpactPct: '+2.8% ~ +4.5%',
    title: '[공시] 주주가치 제고를 위한 50,000 WLD 자사주 소각 결정',
    summary: '이사회 결의를 통해 유통 주식수의 1.5%에 해당하는 자사주를 장내 매입 후 영구 소각하기로 결정했습니다.',
    detailedBody: '덕뱅크홀딩스는 건전한 자기자본비율(BIS 14.8%)을 바탕으로 주주환원 정책을 강화하기로 하였습니다. 소각 예정 일자는 이번 주말 정산 시간대로 예정되어 있습니다.',
    publishedAt: '2026-10-03T11:15:00.000Z',
    verifiedOfficial: true,
  },
  {
    id: 'disc-myuy-004',
    symbol: 'MYUY',
    companyName: '미래바이오랩',
    sector: '바이오',
    disclosureType: '신제품/기술',
    impactDirection: 'up',
    expectedImpactPct: '+7.2% ~ +11.0%',
    title: '[공시] 세포 치료제 후보물질 글로벌 임상 2상 유효성 지표 충족',
    summary: '임상 2상 중간 데이터 분석 결과 1차 유효성 평가변수를 통계적으로 유의미하게 달성했습니다.',
    detailedBody: '독립적 데이터 모니터링 위원회(IDMC)로부터 임상 3상 조기 진입 권고를 수령하였으며, 글로벌 제약사와의 공동 개발 및 기술수출(L/O) 협상이 진행 중입니다.',
    publishedAt: '2026-10-03T11:45:00.000Z',
    verifiedOfficial: true,
  },
  {
    id: 'disc-wdm-005',
    symbol: 'WDM',
    companyName: '메이플마켓',
    sector: '유통',
    disclosureType: '리스크/사고',
    impactDirection: 'down',
    expectedImpactPct: '-2.5% ~ -4.8%',
    title: '[공시] 물류 자동화 센터 일시적 전산 지연에 따른 배송 지연 안내',
    summary: '중부 거점 풀필먼트 센터의 시스템 업그레이드 중 일시적 전산 병목이 발생하여 일일 배송량이 감소했습니다.',
    detailedBody: '현재 비상 복구 매뉴얼에 따라 수동 검수 라인을 가동 중이며, 24시간 내 정상화될 예정입니다. 단기 물류 비용 증가 요인이 발생할 수 있습니다.',
    publishedAt: '2026-10-03T12:00:00.000Z',
    verifiedOfficial: true,
  },
  {
    id: 'disc-space-006',
    symbol: 'SPACE',
    companyName: '블루루트로지스틱스',
    sector: '물류',
    disclosureType: '투자/제휴',
    impactDirection: 'up',
    expectedImpactPct: '+3.5% ~ +5.0%',
    title: '[공시] 초고속 항공 화물 전용 허브 터미널 준공 완료',
    summary: '월덕 국제공항 물류 전용 부지 내 신규 스마트 화물 터미널이 완공되어 상업 가동을 개시했습니다.',
    detailedBody: '신규 터미널 가동으로 일일 처리 화물 용량이 기존 대비 160% 증가하며, 환적 시간은 평균 40분 단축되어 운영 수익성이 개선될 전망입니다.',
    publishedAt: '2026-10-03T12:30:00.000Z',
    verifiedOfficial: true,
  },
];
