export interface VirtualLandParcel {
  readonly id: string;
  readonly name: string;
  readonly location: string;
  readonly initialPriceWld: number;
  readonly currentValuationWld: number;
  readonly ownerName: string | null;
  readonly ownerId: string | null;
  readonly buildingType: 'FINANCIAL_TOWER' | 'MINING_HUB' | 'CASINO_ARCADE' | 'BILLBOARD' | 'NONE';
  readonly buildingLevel: number;
  readonly dailyPassiveYieldRate: number; // 0.15 = 15%
  readonly dailyEstimatedWld: number;
  readonly weeklyPropertyTaxRate: number; // 0.005 = 0.5%
  readonly badge: string;
  readonly description: string;
}

export const PREMIER_LAND_PARCELS: readonly VirtualLandParcel[] = [
  {
    id: 'LAND-GANGNAM-01',
    name: '강남 테헤란로 1번가',
    location: '서울특별시 강남구 역삼동',
    initialPriceWld: 50000000,
    currentValuationWld: 78500000,
    ownerName: '테헤란건물주',
    ownerId: 'usr-land-001',
    buildingType: 'FINANCIAL_TOWER',
    buildingLevel: 5,
    dailyPassiveYieldRate: 0.15,
    dailyEstimatedWld: 2850000,
    weeklyPropertyTaxRate: 0.005,
    badge: '최고가 랜드마크',
    description: '가상 핀테크 스타트업과 대형 증권사들이 밀집한 머니버스 최고 번화가 필지입니다.',
  },
  {
    id: 'LAND-YEOUIDO-02',
    name: '여의도 국제금융로 타운',
    location: '서울특별시 영등포구 여의도동',
    initialPriceWld: 40000000,
    currentValuationWld: 62000000,
    ownerName: '여의도고래',
    ownerId: 'usr-land-002',
    buildingType: 'FINANCIAL_TOWER',
    buildingLevel: 4,
    dailyPassiveYieldRate: 0.15,
    dailyEstimatedWld: 2150000,
    weeklyPropertyTaxRate: 0.005,
    badge: '증권거래소 직결',
    description: '월덕 증권거래소와 중앙은행 본점이 위치하여 일일 방문 거래 수수료 배분이 극대화됩니다.',
  },
  {
    id: 'LAND-WALLST-03',
    name: '뉴욕 월스트리트 11번지',
    location: '미국 뉴욕 맨해튼 파이낸셜 디스트릭트',
    initialPriceWld: 60000000,
    currentValuationWld: 95000000,
    ownerName: '월가헤지펀드',
    ownerId: 'usr-land-003',
    buildingType: 'MINING_HUB',
    buildingLevel: 5,
    dailyPassiveYieldRate: 0.15,
    dailyEstimatedWld: 3500000,
    weeklyPropertyTaxRate: 0.005,
    badge: '글로벌 자본 메카',
    description: '글로벌 퀀트 알고리즘 트레이더들이 거주하며 24시간 거래 트래픽 수수료를 창출합니다.',
  },
  {
    id: 'LAND-SILICON-04',
    name: '실리콘밸리 샌드힐로드 100',
    location: '미국 캘리포니아 멘로파크',
    initialPriceWld: 45000000,
    currentValuationWld: 71000000,
    ownerName: '엔젤투자클럽',
    ownerId: 'usr-land-004',
    buildingType: 'MINING_HUB',
    buildingLevel: 3,
    dailyPassiveYieldRate: 0.15,
    dailyEstimatedWld: 1950000,
    weeklyPropertyTaxRate: 0.005,
    badge: 'VC 엔젤 허브',
    description: '신규 창업 스타트업 법인 설립과 엔젤 라운드 IPO가 집중되는 벤처 캐피털 영지입니다.',
  },
  {
    id: 'LAND-PANGYO-05',
    name: '판교 테크노밸리 메인 스퀘어',
    location: '경기도 성남시 분당구 삼평동',
    initialPriceWld: 35000000,
    currentValuationWld: 54000000,
    ownerName: '시니어코더',
    ownerId: 'usr-land-005',
    buildingType: 'CASINO_ARCADE',
    buildingLevel: 4,
    dailyPassiveYieldRate: 0.15,
    dailyEstimatedWld: 1650000,
    weeklyPropertyTaxRate: 0.005,
    badge: 'IT 직업 특화',
    description: '프로그래머와 엔지니어 직업군의 일일 업무 출근 시 발생하는 급여 환급 수수료를 징수합니다.',
  },
  {
    id: 'LAND-MARINA-06',
    name: '싱가포르 마리나베이 파이낸셜',
    location: '싱가포르 마리나베이 샌즈 비즈니스 지구',
    initialPriceWld: 38000000,
    currentValuationWld: 58000000,
    ownerName: '글로벌노마드',
    ownerId: 'usr-land-006',
    buildingType: 'CASINO_ARCADE',
    buildingLevel: 3,
    dailyPassiveYieldRate: 0.15,
    dailyEstimatedWld: 1800000,
    weeklyPropertyTaxRate: 0.005,
    badge: '아시아 무역 허브',
    description: 'P2P 마켓플레이스 경매와 국제 무역 거래세 환급 수수료가 자동으로 유입되는 요충지입니다.',
  },
  {
    id: 'LAND-SHINJUKU-07',
    name: '도쿄 신주쿠 가부키초 메인타워',
    location: '일본 도쿄도 신주쿠구',
    initialPriceWld: 30000000,
    currentValuationWld: 46000000,
    ownerName: '아케이드마스터',
    ownerId: 'usr-land-007',
    buildingType: 'BILLBOARD',
    buildingLevel: 5,
    dailyPassiveYieldRate: 0.15,
    dailyEstimatedWld: 1450000,
    weeklyPropertyTaxRate: 0.005,
    badge: '옥외 광고판 잭팟',
    description: '광고판 스폰서십 및 커뮤니티 미니게임 이용 수수료가 집중되는 엔터테인먼트 필지입니다.',
  },
  {
    id: 'LAND-CANARY-08',
    name: '런던 카나리 워프 뱅크스퀘어',
    location: '영국 런던 템스강 금융 지구',
    initialPriceWld: 42000000,
    currentValuationWld: 65000000,
    ownerName: '로열뱅커',
    ownerId: 'usr-land-008',
    buildingType: 'FINANCIAL_TOWER',
    buildingLevel: 4,
    dailyPassiveYieldRate: 0.15,
    dailyEstimatedWld: 2300000,
    weeklyPropertyTaxRate: 0.005,
    badge: '유럽 중앙은행 연동',
    description: '가상 국채 발행 및 복리 예적금 수수료의 15%가 일일 패시브 이자로 지급됩니다.',
  },
  {
    id: 'LAND-DUBAI-09',
    name: '두바이 인터내셔널 파이낸셜 센터',
    location: '아랍에미리트 두바이 DIFC 지구',
    initialPriceWld: 48000000,
    currentValuationWld: 75000000,
    ownerName: '만수르',
    ownerId: 'usr-land-009',
    buildingType: 'BILLBOARD',
    buildingLevel: 4,
    dailyPassiveYieldRate: 0.15,
    dailyEstimatedWld: 2600000,
    weeklyPropertyTaxRate: 0.005,
    badge: '오일머니 프리미엄',
    description: '디스코드 클럽 영지 쟁탈전 및 VIP 전용 경매장 낙찰 수수료가 귀속되는 최고급 부촌입니다.',
  },
  {
    id: 'LAND-METASPACE-10',
    name: '월덕 메타버스 센트럴 힐스 00',
    location: '월덕 가상 메타버스 0번지 중심 구역',
    initialPriceWld: 100000000,
    currentValuationWld: 160000000,
    ownerName: '중앙은행',
    ownerId: 'usr-system-treasury',
    buildingType: 'FINANCIAL_TOWER',
    buildingLevel: 10,
    dailyPassiveYieldRate: 0.15,
    dailyEstimatedWld: 6500000,
    weeklyPropertyTaxRate: 0.005,
    badge: '중앙은행 국고 랜드',
    description: '머니버스 전역에서 발생하는 공공 거래세의 10%가 국고 비축 금고로 적립되는 메인 허브입니다.',
  },
];

export function calculateRealEstateTax(priceWld: number): {
  readonly acquisitionTaxWld: number; // 3.0%
  readonly weeklyPropertyTaxWld: number; // 0.5%
} {
  return {
    acquisitionTaxWld: Math.floor(priceWld * 0.03),
    weeklyPropertyTaxWld: Math.floor(priceWld * 0.005),
  };
}
