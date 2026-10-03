import { describe, it, expect } from 'vitest';
import {
  PERSONAL_SPACE_SKUS,
  CITY_DISTRICTS,
  calculateRoomExpansionCost,
  calculateGalleryWingCost,
  getSpaceConfig,
  getDistrictConfig,
  calculateEstimatedYield,
  getDefaultSpaces,
  UserPersonalSpace,
} from './personal-spaces';

describe('personal-spaces library unit tests', () => {
  it('should define all 7 personal space SKUs per specification', () => {
    expect(PERSONAL_SPACE_SKUS.length).toBe(7);
    const skuIds = PERSONAL_SPACE_SKUS.map((s) => s.id);
    expect(skuIds).toContain('SPACE_ROOM_STARTER');
    expect(skuIds).toContain('SPACE_STUDIO');
    expect(skuIds).toContain('SPACE_GALLERY');
    expect(skuIds).toContain('SPACE_OFFICE');
    expect(skuIds).toContain('SPACE_PENTHOUSE');
    expect(skuIds).toContain('SPACE_HQ');
    expect(skuIds).toContain('SPACE_LEGACY_HALL');
  });

  it('should define all 8 city districts', () => {
    expect(CITY_DISTRICTS.length).toBe(8);
    const districtIds = CITY_DISTRICTS.map((d) => d.id);
    expect(districtIds).toContain('DISTRICT_GANGNAM');
    expect(districtIds).toContain('DISTRICT_YEOUIDO');
    expect(districtIds).toContain('DISTRICT_PANGYO');
    expect(districtIds).toContain('DISTRICT_SEONGSU');
    expect(districtIds).toContain('DISTRICT_HANNAM');
    expect(districtIds).toContain('DISTRICT_SONGDO');
    expect(districtIds).toContain('DISTRICT_MAPO');
    expect(districtIds).toContain('DISTRICT_BUSAN');
  });

  it('should calculate room expansion costs according to formula 8000 * 1.35^n', () => {
    expect(calculateRoomExpansionCost(0)).toBe('8000');
    expect(calculateRoomExpansionCost(1)).toBe('10800');
    expect(calculateRoomExpansionCost(2)).toBe('14580');
  });

  it('should calculate gallery wing costs according to formula 75000 * 1.45^n', () => {
    expect(calculateGalleryWingCost(0)).toBe('75000');
    expect(calculateGalleryWingCost(1)).toBe('108750');
  });

  it('should retrieve space and district configs with fallback safety', () => {
    const starter = getSpaceConfig('SPACE_ROOM_STARTER');
    expect(starter.name).toBe('스타터 룸');
    expect(starter.basePrice).toBe('5000');

    const gangnam = getDistrictConfig('DISTRICT_GANGNAM');
    expect(gangnam.name).toBe('강남 테헤란 밸리');
    expect(gangnam.yieldMultiplier).toBe(1.15);

    // Fallback on unknown id
    const fallbackSpace = getSpaceConfig('UNKNOWN_ID');
    expect(fallbackSpace.id).toBe('SPACE_ROOM_STARTER');

    const fallbackDistrict = getDistrictConfig('UNKNOWN_DISTRICT');
    expect(fallbackDistrict.id).toBe('DISTRICT_GANGNAM');
  });

  it('should calculate estimated rent yield accurately over elapsed time', () => {
    const defaultSpace = getDefaultSpaces()[0]!;
    const now = new Date(defaultSpace.lastRentCollectedAt).getTime() + 86400000; // 1 day later

    const yieldAmount = calculateEstimatedYield(defaultSpace, now);
    expect(BigInt(yieldAmount) >= 120n).toBe(true);
  });
});
