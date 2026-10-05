/**
 * Personal Spaces & Virtual Real Estate City Land System
 * Spec: PERSONAL_SPACES_CITY_PROJECTS_SPEC.ko.md
 */

export interface SpaceTierConfig {
  readonly id: string;
  readonly name: string;
  readonly nameEn: string;
  readonly category: 'residential' | 'commercial' | 'luxury' | 'monument';
  readonly basePrice: string; // in WLD
  readonly maxRooms: number;
  readonly maxExhibits: number;
  readonly baseRentYieldAnnual: number; // e.g. 0.065 (6.5%)
  readonly description: string;
  readonly icon: string;
  readonly color: string;
  readonly badge: string;
}

export interface CityDistrictConfig {
  readonly id: string;
  readonly name: string;
  readonly nameEn: string;
  readonly region: string;
  readonly yieldMultiplier: number;
  readonly landTaxRate: number;
  readonly primeTheme: string;
  readonly description: string;
  readonly icon: string;
  readonly totalParcels: number;
  readonly occupiedParcels: number;
}

export interface UserPersonalSpace {
  readonly instanceId: string;
  readonly spaceId: string;
  readonly districtId: string;
  readonly customName: string;
  readonly roomTier: number; // 0: default, 1..maxRooms
  readonly galleryWingTier: number;
  readonly activeTheme: 'minimal' | 'cyberpunk' | 'luxury_gold' | 'zen_garden';
  readonly exhibits: readonly string[];
  readonly purchasedAt: string;
  readonly lastRentCollectedAt: string;
  readonly accumulatedRentYield: string; // in WLD
}

/**
 * 7대 개인 공간 SKU 정의 (기획서 Section 3.1)
 */
export const PERSONAL_SPACE_SKUS: readonly SpaceTierConfig[] = [
  {
    id: 'SPACE_ROOM_STARTER',
    name: '스타터 룸',
    nameEn: 'Starter Room',
    category: 'residential',
    basePrice: '5000',
    maxRooms: 3,
    maxExhibits: 2,
    baseRentYieldAnnual: 0.05,
    description: '머니버스에 첫 발을 내딛는 거주자를 위한 아늑하고 콤팩트한 1인용 룸.',
    icon: 'Home',
    color: 'emerald',
    badge: '스타터 기본',
  },
  {
    id: 'SPACE_STUDIO',
    name: '크리에이터 스튜디오',
    nameEn: 'Creator Studio',
    category: 'residential',
    basePrice: '25000',
    maxRooms: 5,
    maxExhibits: 4,
    baseRentYieldAnnual: 0.06,
    description: '개인 창작과 실시간 방송, 소규모 포트폴리오 쇼케이스를 위한 스마트 스튜디오.',
    icon: 'Layout',
    color: 'cyan',
    badge: '스마트 거주',
  },
  {
    id: 'SPACE_GALLERY',
    name: '프라이빗 갤러리',
    nameEn: 'Private Gallery',
    category: 'commercial',
    basePrice: '75000',
    maxRooms: 8,
    maxExhibits: 8,
    baseRentYieldAnnual: 0.075,
    description: '희귀 트로피, NFT 및 수집품을 품격 있게 전시할 수 있는 전용 쇼룸.',
    icon: 'Sparkles',
    color: 'amber',
    badge: '전시 특화',
  },
  {
    id: 'SPACE_OFFICE',
    name: '프라이빗 오피스',
    nameEn: 'Private Office',
    category: 'commercial',
    basePrice: '100000',
    maxRooms: 10,
    maxExhibits: 6,
    baseRentYieldAnnual: 0.08,
    description: '금융 분석, 자동 트레이딩 룸 및 비즈니스 미팅을 위한 전문 업무 공간.',
    icon: 'Briefcase',
    color: 'blue',
    badge: '업무/금융',
  },
  {
    id: 'SPACE_PENTHOUSE',
    name: '스카이라인 펜트하우스',
    nameEn: 'Skyline Penthouse',
    category: 'luxury',
    basePrice: '250000',
    maxRooms: 15,
    maxExhibits: 12,
    baseRentYieldAnnual: 0.095,
    description: '도시 전경이 한눈에 내려다보이는 초호화 최상층 복층 펜트하우스.',
    icon: 'Building2',
    color: 'purple',
    badge: '하이엔드 럭셔리',
  },
  {
    id: 'SPACE_HQ',
    name: '기업 본사 HQ 타워',
    nameEn: 'Corporate HQ Tower',
    category: 'commercial',
    basePrice: '1500000',
    maxRooms: 25,
    maxExhibits: 20,
    baseRentYieldAnnual: 0.11,
    description: '머니버스 상위 1% 길드 및 기업을 위한 상징적 메가 스트럭처 랜드마크.',
    icon: 'Landmark',
    color: 'rose',
    badge: '기업 랜드마크',
  },
  {
    id: 'SPACE_LEGACY_HALL',
    name: '불멸의 레거시 홀',
    nameEn: 'Immortal Legacy Hall',
    category: 'monument',
    basePrice: '2000000',
    maxRooms: 30,
    maxExhibits: 30,
    baseRentYieldAnnual: 0.125,
    description: '세계관 명예의 전당에 영구 헌액되는 최고 존엄의 모뉴먼트 궁전.',
    icon: 'Crown',
    color: 'yellow',
    badge: '최고 존엄 헌액',
  },
];

/**
 * 8대 주요 도시 구역 정의 (City Districts)
 */
export const CITY_DISTRICTS: readonly CityDistrictConfig[] = [
  {
    id: 'DISTRICT_GANGNAM',
    name: '강남 테헤란 밸리',
    nameEn: 'Gangnam Teheran Valley',
    region: 'Seoul Core',
    yieldMultiplier: 1.15,
    landTaxRate: 0.002,
    primeTheme: 'cyberpunk',
    description: '최첨단 핀테크와 벤처 기업들이 밀집한 최고 유동성의 테헤란로 핵심 중심가.',
    icon: 'Building',
    totalParcels: 1000,
    occupiedParcels: 892,
  },
  {
    id: 'DISTRICT_YEOUIDO',
    name: '여의도 국제 금융가',
    nameEn: 'Yeouido Financial District',
    region: 'Seoul West',
    yieldMultiplier: 1.12,
    landTaxRate: 0.002,
    primeTheme: 'luxury_gold',
    description: 'WDX 증권거래소와 대형 투자은행이 위치한 대한민국 금융 심장부.',
    icon: 'Landmark',
    totalParcels: 800,
    occupiedParcels: 734,
  },
  {
    id: 'DISTRICT_PANGYO',
    name: '판교 테크노 실리콘',
    nameEn: 'Pangyo Techno Silicon',
    region: 'Gyeonggi South',
    yieldMultiplier: 1.1,
    landTaxRate: 0.0018,
    primeTheme: 'minimal',
    description: 'AI R&D 연구소와 게임 거대 기업들이 포진한 대한민국 테크 1번지.',
    icon: 'Cpu',
    totalParcels: 1200,
    occupiedParcels: 1045,
  },
  {
    id: 'DISTRICT_SEONGSU',
    name: '성수 아뜰리에 쿼터',
    nameEn: 'Seongsu Atelier Quarter',
    region: 'Seoul East',
    yieldMultiplier: 1.05,
    landTaxRate: 0.0015,
    primeTheme: 'minimal',
    description: '트렌디한 팝업 스토어, 프라이빗 갤러리 및 크리에이터 감성이 살아 숨쉬는 거리.',
    icon: 'Sparkles',
    totalParcels: 600,
    occupiedParcels: 512,
  },
  {
    id: 'DISTRICT_HANNAM',
    name: '한남 힐사이드 리저브',
    nameEn: 'Hannam Hillside Reserve',
    region: 'Seoul Center',
    yieldMultiplier: 1.25,
    landTaxRate: 0.0025,
    primeTheme: 'luxury_gold',
    description: '한강을 조망하는 최상위 부유층과 VIP를 위한 프라이빗 하이엔드 단지.',
    icon: 'Crown',
    totalParcels: 300,
    occupiedParcels: 289,
  },
  {
    id: 'DISTRICT_SONGDO',
    name: '송도 센트럴 스마트시티',
    nameEn: 'Songdo Central Smart City',
    region: 'Incheon Free Zone',
    yieldMultiplier: 1.02,
    landTaxRate: 0.0012,
    primeTheme: 'cyberpunk',
    description: '글로벌 무역 및 친환경 스마트 인프라가 완비된 미래형 국제 자유구역.',
    icon: 'Globe',
    totalParcels: 1500,
    occupiedParcels: 980,
  },
  {
    id: 'DISTRICT_MAPO',
    name: '마포 크리에이티브 허브',
    nameEn: 'Mapo Creative Hub',
    region: 'Seoul North-West',
    yieldMultiplier: 0.98,
    landTaxRate: 0.001,
    primeTheme: 'zen_garden',
    description: '인디 아티스트와 스타터 거주자를 위한 활력 넘치는 청년 문화 예술 중심지.',
    icon: 'Music',
    totalParcels: 800,
    occupiedParcels: 640,
  },
  {
    id: 'DISTRICT_BUSAN',
    name: '부산 마린시티 베이',
    nameEn: 'Busan Marine City Bay',
    region: 'Busan Coast',
    yieldMultiplier: 1.08,
    landTaxRate: 0.0015,
    primeTheme: 'luxury_gold',
    description: '푸른 해안선과 광안대교 오션뷰를 품은 최고급 해양 레저 랜드마크.',
    icon: 'Ship',
    totalParcels: 500,
    occupiedParcels: 418,
  },
];

export const SPACE_THEMES: Record<
  UserPersonalSpace['activeTheme'],
  { readonly name: string; readonly description: string; readonly bgClass: string; readonly borderClass: string }
> = {
  minimal: {
    name: '모던 미니멀 화이트',
    description: '군더더기 없는 정갈한 선과 자연광이 돋보이는 모던 감성.',
    bgClass: 'from-slate-900 via-slate-950 to-zinc-900',
    borderClass: 'border-slate-700/50',
  },
  cyberpunk: {
    name: '사이버네틱 네온',
    description: '청록과 자줏빛 네온 사인이 교차하는 미래도시 나이트뷰.',
    bgClass: 'from-purple-950 via-indigo-950 to-black',
    borderClass: 'border-cyan-500/50',
  },
  luxury_gold: {
    name: '골든 엠파이어 럭셔리',
    description: '황금빛 대리석과 샹들리에의 압도적 품격을 자랑하는 VIP 테마.',
    bgClass: 'from-amber-950 via-stone-950 to-black',
    borderClass: 'border-amber-500/50',
  },
  zen_garden: {
    name: '젠 가든 오아시스',
    description: '동양적 고즈넉함과 실내 수공간이 어우러진 힐링 라운지.',
    bgClass: 'from-emerald-950 via-zinc-950 to-black',
    borderClass: 'border-emerald-500/50',
  },
};

/**
 * 방 확장 비용 공식: 8,000 * 1.35^인덱스 (기획서 명세)
 */
export function calculateRoomExpansionCost(currentTier: number): string {
  const base = 8000;
  const cost = Math.round(base * Math.pow(1.35, currentTier));
  return cost.toString();
}

/**
 * 갤러리 윙 확장 비용 공식: 75,000 * 1.45^인덱스 (기획서 명세)
 */
export function calculateGalleryWingCost(currentTier: number): string {
  const base = 75000;
  const cost = Math.round(base * Math.pow(1.45, currentTier));
  return cost.toString();
}

/**
 * 공간 및 구역 ID 조회 헬퍼
 */
export function getSpaceConfig(spaceId: string): SpaceTierConfig {
  const found = PERSONAL_SPACE_SKUS.find((s) => s.id === spaceId);
  return found || PERSONAL_SPACE_SKUS[0]!;
}

export function getDistrictConfig(districtId: string): CityDistrictConfig {
  const found = CITY_DISTRICTS.find((d) => d.id === districtId);
  return found || CITY_DISTRICTS[0]!;
}

/**
 * 시간 경과에 따른 가상 임대료 수익 계산 (초당 계산 시뮬레이션)
 */
export function calculateEstimatedYield(space: UserPersonalSpace, nowMs: number = Date.now()): string {
  const cfg = getSpaceConfig(space.spaceId);
  const district = getDistrictConfig(space.districtId);

  const basePrice = BigInt(cfg.basePrice);
  const expansionBoost = 1 + space.roomTier * 0.15 + space.galleryWingTier * 0.25;
  const effectiveYieldRate = cfg.baseRentYieldAnnual * district.yieldMultiplier * expansionBoost;

  const lastCollected = new Date(space.lastRentCollectedAt).getTime();
  const elapsedSec = Math.max(0, Math.floor((nowMs - lastCollected) / 1000));

  // 연간 초 수: 365 * 86400 = 31,536,000
  const annualSec = 31536000;
  const earned = (Number(basePrice) * effectiveYieldRate * elapsedSec) / annualSec;

  const currentAccumulated = BigInt(space.accumulatedRentYield || '0');
  const total = currentAccumulated + BigInt(Math.floor(earned));

  return total.toString();
}

const STORAGE_KEY = 'wdmv_user_personal_spaces_v1';

/**
 * 로컬 저장소에서 사용자 보유 공간 목록 로드 (초기 데이터 없으면 스타터 룸 1개 자동 지급)
 */
export function loadUserSpaces(): readonly UserPersonalSpace[] {
  if (typeof window === 'undefined') return getDefaultSpaces();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getDefaultSpaces();
      saveUserSpaces(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return getDefaultSpaces();
  } catch {
    return getDefaultSpaces();
  }
}

export function saveUserSpaces(spaces: readonly UserPersonalSpace[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(spaces));
  } catch {
    // LocalStorage write failure ignored safely
  }
}

export function getDefaultSpaces(): readonly UserPersonalSpace[] {
  return [
    {
      instanceId: 'space-starter-01',
      spaceId: 'SPACE_ROOM_STARTER',
      districtId: 'DISTRICT_GANGNAM',
      customName: '테헤란로 나의 첫 베이스캠프',
      roomTier: 0,
      galleryWingTier: 0,
      activeTheme: 'minimal',
      exhibits: ['트로피: 머니버스 웰컴 배지', '기념품: 첫 주식 매수 증서'],
      purchasedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      lastRentCollectedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      accumulatedRentYield: '120',
    },
  ];
}
