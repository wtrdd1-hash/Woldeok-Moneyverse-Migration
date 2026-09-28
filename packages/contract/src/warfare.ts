/**
 * Discord Guild Territory Warfare (디스코드 길드 영지 공성전) Contract & Domain Logic
 */

export type TerritoryId =
  | 'GANGNAM_TOWER'
  | 'YEOUIDO_VAULT'
  | 'WALL_STREET_PLAZA'
  | 'PANGYO_VALLEY'
  | 'SILICON_BEACH';

export type SiegeStatus = 'PEACE' | 'SIEGE_DECLARED' | 'BATTLE_ACTIVE';

export interface TerritoryZone {
  readonly id: TerritoryId;
  readonly name: string;
  readonly location: string;
  readonly description: string;
  readonly dailyTaxYieldWld: number;
  readonly defaultDefensePower: number;
  readonly occupyingGuildId: string | null;
  readonly occupyingGuildName: string;
  readonly defenseShieldLevel: number;
  readonly currentShieldHp: number;
  readonly maxShieldHp: number;
  readonly status: SiegeStatus;
}

export const INITIAL_TERRITORIES: readonly TerritoryZone[] = [
  {
    id: 'GANGNAM_TOWER',
    name: '강남 테헤란 파이낸스타워',
    location: '서울 강남구 테헤란로 152',
    description: '가상 부동산 거래 수수료의 20%가 일일 길드 금고로 적립되는 최상위 금융 거점',
    dailyTaxYieldWld: 500000,
    defaultDefensePower: 8500,
    occupyingGuildId: 'guild-alpha',
    occupyingGuildName: '월덕 퀀트 길드',
    defenseShieldLevel: 4,
    currentShieldHp: 180000,
    maxShieldHp: 200000,
    status: 'PEACE',
  },
  {
    id: 'YEOUIDO_VAULT',
    name: '여의도 증권 볼트',
    location: '서울 영등포구 여의대로 108',
    description: '가상 주식 거래세 및 파생상품 청산 수수료의 15%가 분배되는 핵심 거래소 거점',
    dailyTaxYieldWld: 420000,
    defaultDefensePower: 7800,
    occupyingGuildId: 'guild-beta',
    occupyingGuildName: '불개미 트레이더 연합',
    defenseShieldLevel: 3,
    currentShieldHp: 135000,
    maxShieldHp: 150000,
    status: 'PEACE',
  },
  {
    id: 'PANGYO_VALLEY',
    name: '판교 테크 하이브',
    location: '경기 성남시 분당구 판교역로 166',
    description: '스타트업 엔젤투자 지분 배당금 및 기술 라이선스 12%가 누적되는 벤처 중심지',
    dailyTaxYieldWld: 350000,
    defaultDefensePower: 6500,
    occupyingGuildId: 'guild-gamma',
    occupyingGuildName: '알고리즘 마스터즈',
    defenseShieldLevel: 2,
    currentShieldHp: 90000,
    maxShieldHp: 100000,
    status: 'PEACE',
  },
  {
    id: 'WALL_STREET_PLAZA',
    name: '월스트리트 글로벌 플라자',
    location: '뉴욕 맨해튼 브로드스트리트 11',
    description: '글로벌 외환 송금 및 다중 통화 스왑 수수료의 25%가 유입되는 초국적 영지',
    dailyTaxYieldWld: 650000,
    defaultDefensePower: 9200,
    occupyingGuildId: null,
    occupyingGuildName: '중립 수호군',
    defenseShieldLevel: 5,
    currentShieldHp: 250000,
    maxShieldHp: 250000,
    status: 'SIEGE_DECLARED',
  },
  {
    id: 'SILICON_BEACH',
    name: '실리콘 비치 크리에이티브 베이',
    location: '캘리포니아 산타모니카 오션애비뉴',
    description: 'P2P 마켓플레이스 경매 낙찰 수수료의 10%가 일일 패시브로 보상되는 문화 거점',
    dailyTaxYieldWld: 280000,
    defaultDefensePower: 5400,
    occupyingGuildId: 'guild-delta',
    occupyingGuildName: '메타버스 아키텍츠',
    defenseShieldLevel: 2,
    currentShieldHp: 75000,
    maxShieldHp: 100000,
    status: 'PEACE',
  },
];

/**
 * 공성전 공격 시 실질 타격 대미지 및 실드 감소량 산출
 */
export function calculateSiegeDamage(
  attackPower: number,
  defensePower: number,
  shieldLevel: number,
): { damage: number; isCritical: boolean; remainingDamage: number } {
  const safeAtk = Math.max(1, attackPower);
  const safeDef = Math.max(1, defensePower);
  const safeShield = Math.max(1, Math.min(5, shieldLevel));

  const baseRatio = safeAtk / (safeAtk + safeDef * (1 + (safeShield - 1) * 0.25));
  const isCritical = Math.random() < 0.15; // 15% 치명타
  const critMultiplier = isCritical ? 1.5 : 1.0;

  const rawDamage = Math.round(safeAtk * baseRatio * critMultiplier);
  const damage = Math.max(100, rawDamage);

  return {
    damage,
    isCritical,
    remainingDamage: Math.max(0, damage - safeDef),
  };
}

/**
 * 점령 길드원별 기여도에 따른 일일 세금 배당액 산출
 */
export function calculateGuildTaxDividend(
  totalDailyTaxWld: number,
  memberContributionPoints: number,
  totalGuildContributionPoints: number,
): number {
  if (totalGuildContributionPoints <= 0 || memberContributionPoints <= 0) return 0;
  const safeTax = Math.max(0, totalDailyTaxWld);
  const shareRatio = Math.min(1.0, memberContributionPoints / totalGuildContributionPoints);
  return Math.floor(safeTax * shareRatio);
}

/**
 * 실드 수리 및 강화에 소요되는 WLD 비용 산출
 */
export function calculateShieldRepairCost(
  currentHp: number,
  maxHp: number,
  shieldLevel: number,
): number {
  const missingHp = Math.max(0, maxHp - currentHp);
  if (missingHp === 0) return 0;
  const costPerHp = 0.5 * Math.pow(1.2, shieldLevel - 1);
  return Math.ceil(missingHp * costPerHp);
}
