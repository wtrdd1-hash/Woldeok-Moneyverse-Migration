import { describe, expect, it } from 'vitest';
import {
  AUTHORITATIVE_QUALIFICATIONS,
  computeMasteryTier,
} from './work.repository';

describe('JOBS_PROFESSION_MASTERY_SPEC - Mastery Tiers & Qualifications', () => {
  describe('computeMasteryTier', () => {
    it('correctly maps levels to 7 authoritative mastery tiers', () => {
      // Tier 1: APPRENTICE (Lv. 1 ~ 4)
      expect(computeMasteryTier(1)).toEqual({
        code: 'APPRENTICE',
        nameKo: '견습',
        nameEn: 'Apprentice',
      });
      expect(computeMasteryTier(4).code).toBe('APPRENTICE');

      // Tier 2: JOURNEYMAN (Lv. 5 ~ 9)
      expect(computeMasteryTier(5)).toEqual({
        code: 'JOURNEYMAN',
        nameKo: '숙련',
        nameEn: 'Journeyman',
      });
      expect(computeMasteryTier(9).code).toBe('JOURNEYMAN');

      // Tier 3: PROFESSIONAL (Lv. 10 ~ 19)
      expect(computeMasteryTier(10)).toEqual({
        code: 'PROFESSIONAL',
        nameKo: '프로',
        nameEn: 'Professional',
      });
      expect(computeMasteryTier(19).code).toBe('PROFESSIONAL');

      // Tier 4: SPECIALIST (Lv. 20 ~ 29)
      expect(computeMasteryTier(20)).toEqual({
        code: 'SPECIALIST',
        nameKo: '전문가',
        nameEn: 'Specialist',
      });
      expect(computeMasteryTier(29).code).toBe('SPECIALIST');

      // Tier 5: EXPERT (Lv. 30 ~ 39)
      expect(computeMasteryTier(30)).toEqual({
        code: 'EXPERT',
        nameKo: '엑스퍼트',
        nameEn: 'Expert',
      });
      expect(computeMasteryTier(39).code).toBe('EXPERT');

      // Tier 6: MASTER (Lv. 40 ~ 49)
      expect(computeMasteryTier(40)).toEqual({
        code: 'MASTER',
        nameKo: '마스터',
        nameEn: 'Master',
      });
      expect(computeMasteryTier(49).code).toBe('MASTER');

      // Tier 7: LEGACY (Lv. 50+)
      expect(computeMasteryTier(50)).toEqual({
        code: 'LEGACY',
        nameKo: '레거시 명예',
        nameEn: 'Legacy Grandmaster',
      });
      expect(computeMasteryTier(100).code).toBe('LEGACY');
    });
  });

  describe('AUTHORITATIVE_QUALIFICATIONS', () => {
    it('defines 5 canonical qualifications matching spec §7 fees and requirements', () => {
      expect(AUTHORITATIVE_QUALIFICATIONS).toHaveLength(5);

      const uniform = AUTHORITATIVE_QUALIFICATIONS.find((q) => q.code === 'UNIFORM_STYLING');
      expect(uniform).toBeDefined();
      expect(uniform?.feeWld).toBe(BigInt(500));
      expect(uniform?.minLevel).toBe(1);

      const basic = AUTHORITATIVE_QUALIFICATIONS.find((q) => q.code === 'BASIC_LICENSE');
      expect(basic).toBeDefined();
      expect(basic?.feeWld).toBe(BigInt(750));
      expect(basic?.minLevel).toBe(3);

      const badge = AUTHORITATIVE_QUALIFICATIONS.find((q) => q.code === 'BADGE_ENGRAVING');
      expect(badge).toBeDefined();
      expect(badge?.feeWld).toBe(BigInt(1500));
      expect(badge?.minLevel).toBe(5);

      const specialist = AUTHORITATIVE_QUALIFICATIONS.find((q) => q.code === 'SPECIALIST_CERTIFICATE');
      expect(specialist).toBeDefined();
      expect(specialist?.feeWld).toBe(BigInt(5000));
      expect(specialist?.minLevel).toBe(10);

      const portfolio = AUTHORITATIVE_QUALIFICATIONS.find((q) => q.code === 'MASTER_PORTFOLIO');
      expect(portfolio).toBeDefined();
      expect(portfolio?.feeWld).toBe(BigInt(25000));
      expect(portfolio?.minLevel).toBe(25);
    });
  });
});
