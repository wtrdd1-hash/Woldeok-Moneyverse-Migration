import { Inject, Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne } from '../core/db';
import { PG_POOL } from '../core/pool.provider';

export interface CraftingRecipe {
  id: string;
  name: string;
  category: string;
  rarity: string;
  description: string;
  feeWld: number;
  materials: { itemCode: string; name: string; quantity: number }[];
  outputItem: { itemCode: string; name: string; category: string; rarity: string; description: string };
}

export const CRAFTING_RECIPES: CraftingRecipe[] = [
  {
    id: 'recipe_moonlight_tint',
    name: '달빛 에메랄드 프레임 염색',
    category: 'frame',
    rarity: 'rare',
    description: '은은한 초록빛 달빛 오라가 일렁이는 특수 염색 아바타 프레임을 제작합니다.',
    feeWld: 150,
    materials: [
      { itemCode: 'frame_basic', name: '기본 프로필 프레임', quantity: 1 },
      { itemCode: 'dye_moonlight', name: '달빛 염료', quantity: 2 },
    ],
    outputItem: {
      itemCode: 'frame_moonlight_emerald',
      name: '달빛 에메랄드 프레임',
      category: 'frame',
      rarity: 'rare',
      description: '은은한 초록빛 달빛 오라가 일렁이는 특수 염색 아바타 프레임',
    },
  },
  {
    id: 'recipe_ancient_relic_restore',
    name: '고대 황금 유물 완벽 복원',
    category: 'display',
    rarity: 'epic',
    description: '부서진 유물 파편들을 결합하여 전설적인 커뮤니티 역사 기념물을 복원합니다.',
    feeWld: 300,
    materials: [
      { itemCode: 'relic_fragment_ancient', name: '고대 유물 파편', quantity: 3 },
      { itemCode: 'toolkit_restoration', name: '정밀 복원 도구 키트', quantity: 1 },
    ],
    outputItem: {
      itemCode: 'relic_golden_statue',
      name: '복원된 황금 디스코드 성배',
      category: 'display',
      rarity: 'epic',
      description: '찬란한 금빛을 되찾은 전설적인 커뮤니티 역사 기념물',
    },
  },
  {
    id: 'recipe_master_engraving',
    name: '마스터 칭호 명판 골드 각인',
    category: 'nameplate',
    rarity: 'legendary',
    description: '제작 일련번호가 영구 새겨진 최고급 골드 서명 네임플레이트를 각인합니다.',
    feeWld: 500,
    materials: [
      { itemCode: 'plate_blank_gold', name: '순금 블랭크 명판', quantity: 1 },
      { itemCode: 'tool_laser_engraver', name: '초정밀 레이저 각인기', quantity: 1 },
    ],
    outputItem: {
      itemCode: 'nameplate_master_engraved',
      name: '각인된 마스터 골드 네임플레이트',
      category: 'nameplate',
      rarity: 'legendary',
      description: '제작 일련번호가 영구 새겨진 최고급 골드 서명 네임플레이트',
    },
  },
  {
    id: 'recipe_biz_turbo_boost',
    name: '스마트 물류 35% 터보 부스트',
    category: 'business',
    rarity: 'rare',
    description: '스마트 운송 물류센터에 장착 시 다음 정산 매출이 35% 급증하는 고성능 부스트를 제작합니다.',
    feeWld: 250,
    materials: [
      { itemCode: 'part_servo_motor', name: '고출력 서보 모터', quantity: 2 },
      { itemCode: 'circuit_biz_logic', name: '비즈니스 연산 회로판', quantity: 1 },
    ],
    outputItem: {
      itemCode: 'biz_logistics_turbo_boost',
      name: '스마트 물류 35% 터보 부스트',
      category: 'business',
      rarity: 'rare',
      description: '스마트 운송 물류센터에 장착 시 다음 정산 매출이 35% 급증하는 고성능 부스트',
    },
  },
];

@Injectable()
export class CraftingService {
  constructor(@Inject(PG_POOL) private readonly pool: Queryable | null) {}

  listRecipes(): CraftingRecipe[] {
    return CRAFTING_RECIPES;
  }

  async executeCrafting(actor: string, recipeId: string, key: string): Promise<unknown> {
    if (!this.pool) throw new Error('database pool unavailable');
    const row = await queryOne<{ result: unknown }>(
      this.pool,
      `SELECT public.crafting_execute($1, $2, $3) AS result`,
      [actor, recipeId, key],
    );
    return row?.result ?? null;
  }
}
