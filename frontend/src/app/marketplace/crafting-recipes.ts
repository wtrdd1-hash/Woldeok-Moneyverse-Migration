/**
 * Woldeok Moneyverse - Player Marketplace & Crafting System Spec (v2026.09.12.16 P0)
 * Reference: docs/planning/PLAYER_MARKETPLACE_CRAFTING_SPEC.ko.md
 */

export interface CraftingMaterial {
  readonly code: string;
  readonly name: string;
  readonly requiredQuantity: number;
}

export interface CraftingRecipe {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly kind: 'tinting' | 'restoration' | 'engraving' | 'boost';
  readonly feeWld: string;
  readonly materials: readonly CraftingMaterial[];
  readonly resultItem: {
    readonly code: string;
    readonly name: string;
    readonly category: string;
    readonly rarity: 'common' | 'rare' | 'epic' | 'legendary';
    readonly description: string;
    readonly effectKind: string;
  };
}

export interface MarketListing {
  readonly id: string;
  readonly sellerId: string;
  readonly sellerName: string;
  readonly isOwn?: boolean;
  readonly itemCode: string;
  readonly itemName: string;
  readonly category: string;
  readonly rarity: 'common' | 'rare' | 'epic' | 'legendary';
  readonly quantity: number;
  readonly priceWld: string;
  readonly listedAt: string;
  readonly serialNumber: number | null;
  readonly status: 'active' | 'settled' | 'cancelled';
  readonly description: string;
}

/**
 * P0 기획서 수수료 공식
 * 5.1 등록수수료: listing_fee = max(25 WLD, ceil(list_price * 0.001)) (HARD_SINK)
 */
export function calculateListingFee(priceWld: string | number | bigint): string {
  try {
    const raw = typeof priceWld === 'bigint' ? priceWld : BigInt(Math.max(0, Math.floor(Number(priceWld) || 0)));
    if (raw <= 0n) return '25';
    // ceil(raw * 0.001) = (raw + 999n) / 1000n
    const fee = (raw + 999n) / 1000n;
    return (fee < 25n ? 25n : fee).toString();
  } catch {
    return '25';
  }
}

/**
 * P0 기획서 수수료 공식
 * 5.2 판매수수료: sale_fee = ceil(sale_price * 0.01) (1% HARD_SINK)
 */
export function calculateSaleFee(priceWld: string | number | bigint): string {
  try {
    const raw = typeof priceWld === 'bigint' ? priceWld : BigInt(Math.max(0, Math.floor(Number(priceWld) || 0)));
    if (raw <= 0n) return '0';
    // ceil(raw * 0.01) = (raw + 99n) / 100n
    const fee = (raw + 99n) / 100n;
    return fee.toString();
  } catch {
    return '0';
  }
}

/**
 * 판매자 순수령액: seller_net = sale_price - sale_fee
 */
export function calculateSellerNet(priceWld: string | number | bigint): string {
  try {
    const raw = typeof priceWld === 'bigint' ? priceWld : BigInt(Math.max(0, Math.floor(Number(priceWld) || 0)));
    const fee = BigInt(calculateSaleFee(raw));
    const net = raw - fee;
    return (net > 0n ? net : 0n).toString();
  } catch {
    return '0';
  }
}

/**
 * P0 공식 제작 레시피 4종
 * 기획서 9.1 절: 색상변경(변형), 수집품 복원, 각인, 사업체 부스트 키트
 */
export const P0_CRAFTING_RECIPES: readonly CraftingRecipe[] = [
  {
    id: 'recipe_moonlight_tint',
    name: '달빛 에메랄드 프레임 염색',
    description: '기본 테두리에 달빛 형광 안료를 배합하여 에메랄드 광채의 한정판 프로필 프레임을 제작합니다.',
    kind: 'tinting',
    feeWld: '150',
    materials: [
      { code: 'frame_basic', name: '기본 프로필 프레임', requiredQuantity: 1 },
      { code: 'dye_moonlight', name: '달빛 형광 안료', requiredQuantity: 2 },
    ],
    resultItem: {
      code: 'frame_moonlight_emerald',
      name: '달빛 에메랄드 프레임',
      category: 'frame',
      rarity: 'rare',
      description: '은은한 초록빛 달빛 오라가 일렁이는 특수 염색 아바타 프레임',
      effectKind: 'decoration',
    },
  },
  {
    id: 'recipe_ancient_relic_restore',
    name: '고대 황금 유물 완벽 복원',
    description: '마모된 고대 유물 파편을 세공 키트와 정밀 가공하여 박물관 등급의 전시 수집품으로 복원합니다.',
    kind: 'restoration',
    feeWld: '300',
    materials: [
      { code: 'relic_fragment_ancient', name: '고대 유물 파편', requiredQuantity: 3 },
      { code: 'toolkit_restoration', name: '정밀 복원 세공 도구', requiredQuantity: 1 },
    ],
    resultItem: {
      code: 'relic_golden_statue',
      name: '복원된 황금 디스코드 성배',
      category: 'display',
      rarity: 'epic',
      description: '찬란한 금빛을 되찾은 전설적인 커뮤니티 역사 기념물',
      effectKind: 'display',
    },
  },
  {
    id: 'recipe_master_engraving',
    name: '마스터 칭호 명판 골드 각인',
    description: '순금 플레이트에 모험가의 칭호와 고유 일련번호를 영구 각인하여 고유 네임플레이트를 완성합니다.',
    kind: 'engraving',
    feeWld: '500',
    materials: [
      { code: 'plate_blank_gold', name: '순금 빈 네임플레이트', requiredQuantity: 1 },
      { code: 'tool_laser_engraver', name: '정밀 레이저 각인침', requiredQuantity: 1 },
    ],
    resultItem: {
      code: 'nameplate_master_engraved',
      name: '각인된 마스터 골드 네임플레이트',
      category: 'nameplate',
      rarity: 'legendary',
      description: '제작 일련번호가 영구 새겨진 최고급 골드 서명 네임플레이트',
      effectKind: 'decoration',
    },
  },
  {
    id: 'recipe_biz_turbo_boost',
    name: '스마트 물류 터보 부스트 모듈',
    description: '가상 사업체의 일일 매출을 24시간 동안 35% 증폭시키는 전문 산업용 부스트 장치를 조립합니다.',
    kind: 'boost',
    feeWld: '250',
    materials: [
      { code: 'part_servo_motor', name: '고효율 서보 모터', requiredQuantity: 2 },
      { code: 'circuit_biz_logic', name: '경영 최적화 집적회로', requiredQuantity: 1 },
    ],
    resultItem: {
      code: 'biz_logistics_turbo_boost',
      name: '스마트 물류 35% 터보 부스트',
      category: 'business',
      rarity: 'rare',
      description: '스마트 운송 물류센터에 장착 시 다음 정산 매출이 35% 급증하는 고성능 부스트',
      effectKind: 'convenience',
    },
  },
];

/**
 * P0 초기 마켓 매물 샘플 (시스템 에스크로 및 선배 유저 등록 물품)
 */
export const INITIAL_MARKET_LISTINGS: readonly MarketListing[] = [
  {
    id: 'list_001',
    sellerId: 'user_star_crafter',
    sellerName: '은하수대장장이',
    itemCode: 'frame_moonlight_emerald',
    itemName: '달빛 에메랄드 프레임',
    category: 'frame',
    rarity: 'rare',
    quantity: 1,
    priceWld: '480',
    listedAt: '2026-09-20T21:15:00Z',
    serialNumber: 12,
    status: 'active',
    description: '달빛 공방에서 직접 염색한 #12번 한정 프레임입니다. 깔끔하고 예뻐요!',
  },
  {
    id: 'list_002',
    sellerId: 'user_relic_hunter',
    sellerName: '고고학자루디',
    itemCode: 'relic_golden_statue',
    itemName: '복원된 황금 디스코드 성배',
    category: 'display',
    rarity: 'epic',
    quantity: 1,
    priceWld: '1200',
    listedAt: '2026-09-20T19:40:00Z',
    serialNumber: 3,
    status: 'active',
    description: '박물관급 정밀 복원 완료. 수집가 보관함 필수품입니다.',
  },
  {
    id: 'list_003',
    sellerId: 'user_biz_tycoon',
    sellerName: '월덕상단주',
    itemCode: 'biz_logistics_turbo_boost',
    itemName: '스마트 물류 35% 터보 부스트',
    category: 'business',
    rarity: 'rare',
    quantity: 3,
    priceWld: '650',
    listedAt: '2026-09-20T22:30:00Z',
    serialNumber: null,
    status: 'active',
    description: '물류센터 운영자 필수 부스트! 내일 정산 전 미리 장착하세요.',
  },
  {
    id: 'list_004',
    sellerId: 'user_collector_7',
    sellerName: '별빛수집가',
    itemCode: 'dye_moonlight',
    itemName: '달빛 형광 안료',
    category: 'material',
    rarity: 'common',
    quantity: 5,
    priceWld: '85',
    listedAt: '2026-09-20T23:10:00Z',
    serialNumber: null,
    status: 'active',
    description: '프레임 염색용 고급 원료 안료입니다. 묶음 판매 가능.',
  },
];
