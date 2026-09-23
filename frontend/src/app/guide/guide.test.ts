import { describe, expect, it } from 'vitest';
import { PUBLIC_NAV } from '@/lib/navigation';
import {
  BEGINNER_TIPS,
  ECONOMY_PILLARS,
  CURRENT_IMPLEMENTED_FEATURES,
  FIRST_DAY_ORDER,
  GROWTH_STAGES,
  GUIDE_FAQS,
  GUIDE_STEPS,
  QUICK_START_STEPS,
  guideDestinations,
} from './guide';

/** Every path the application serves, as `frontend/src/app` lays it out. */
const ROUTES = new Set([
  '/',
  '/guide',
  '/login',
  '/announcements',
  '/gallery',
  '/status',
  '/bank',
  '/shop',
  '/shop/catalog',
  '/terms',
  '/privacy',
  '/wallet',
  '/wallet/activity',
  '/work',
  '/quests',
  '/progression',
  '/profile',
  '/board',
  '/seasons',
  '/stocks',
  '/businesses',
  '/casino',
  '/marketplace',
  '/chat',
  '/newspaper',
  '/account',
]);

describe('the getting-started guide', () => {
  it('points only at paths this build serves', () => {
    for (const destination of guideDestinations()) {
      expect(ROUTES.has(destination), `${destination} is not a route`).toBe(true);
    }
  });

  it('sends a member to the work screen, which is where WLD is actually paid', () => {
    expect(guideDestinations()).toContain('/work');
  });

  it('does not advertise unlimited profession work when the server enforces per-task daily limits', () => {
    const work = GUIDE_STEPS.find((step) => step.id === 'work');
    expect(work).toBeDefined();
    expect((work?.points ?? []).join(' ')).toContain('서버 일일 배정 한도');
    expect((work?.pointsEn ?? []).join(' ')).toContain('server-enforced daily assignment limit');
    expect((work?.points ?? []).join(' ')).not.toContain('일일 횟수 제한 없이');
    expect((work?.pointsEn ?? []).join(' ')).not.toContain('without a daily count cap');
  });

  it('gives every step something to read', () => {
    for (const step of GUIDE_STEPS) {
      expect(step.title.length, step.id).toBeGreaterThan(0);
      expect(step.body.length, step.id).toBeGreaterThan(0);
      for (const paragraph of step.body) expect(paragraph.trim()).not.toBe('');
    }
  });

  it('keeps every step id distinct, because they are React keys', () => {
    const ids = GUIDE_STEPS.map((step) => step.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('opens with signing in and consenting', () => {
    expect(GUIDE_STEPS[0]?.id).toBe('sign-in');
  });

  it('ends by checking the receipt rather than by taking more work', () => {
    expect(GUIDE_STEPS.at(-1)?.id).toBe('receipt');
  });

  it('offers a short version as well as the long one', () => {
    expect(FIRST_DAY_ORDER.length).toBeGreaterThan(0);
  });

  it('offers a quick start and practical newcomer guardrails', () => {
    expect(QUICK_START_STEPS).toHaveLength(4);
    expect(BEGINNER_TIPS).toHaveLength(3);
    for (const tip of BEGINNER_TIPS) {
      expect(tip.title.trim()).not.toBe('');
      expect(tip.body.trim()).not.toBe('');
    }
  });

  it('answers product-specific questions before a visitor signs in', () => {
    expect(GUIDE_FAQS.length).toBeGreaterThanOrEqual(4);
    for (const faq of GUIDE_FAQS) {
      expect(faq.question.trim()).not.toBe('');
      expect(faq.answer.trim()).not.toBe('');
    }
  });

  it('documents current implemented feature groups with valid routes', () => {
    expect(CURRENT_IMPLEMENTED_FEATURES.length).toBeGreaterThanOrEqual(5);
    for (const group of CURRENT_IMPLEMENTED_FEATURES) {
      expect(ROUTES.has(group.link.href)).toBe(true);
      expect(group.itemsKo.length).toBe(group.itemsEn.length);
      expect(group.summaryKo.trim()).not.toBe('');
      expect(group.summaryEn.trim()).not.toBe('');
    }

    const markets = CURRENT_IMPLEMENTED_FEATURES.find((group) => group.id === 'markets');
    const advertised = [...(markets?.itemsKo ?? []), ...(markets?.itemsEn ?? [])].join(' ');
    expect(advertised).not.toContain('경매');
    expect(advertised).not.toContain('직거래');
    expect(advertised).not.toContain('감정');
    expect(advertised.toLowerCase()).not.toContain('auction');
    expect(advertised.toLowerCase()).not.toContain('direct trade');
    expect(advertised.toLowerCase()).not.toContain('appraisal');
  });

  it('defines the 5 core virtual economy pillars with valid routes', () => {
    expect(ECONOMY_PILLARS).toHaveLength(5);
    for (const pillar of ECONOMY_PILLARS) {
      expect(ROUTES.has(pillar.link.href)).toBe(true);
      expect(pillar.titleKo.length).toBeGreaterThan(0);
      expect(pillar.titleEn.length).toBeGreaterThan(0);
    }
  });

  it('defines 3 sequential player growth stages', () => {
    expect(GROWTH_STAGES).toHaveLength(3);
    for (const stage of GROWTH_STAGES) {
      expect(stage.step).toBeGreaterThan(0);
      expect(stage.actionsKo.length).toBeGreaterThan(0);
      expect(stage.actionsEn.length).toBeGreaterThan(0);
    }
  });

  it('is in the navigation a signed-out visitor sees', () => {
    expect(PUBLIC_NAV.map((entry) => entry.href)).toContain('/guide');
  });
});
