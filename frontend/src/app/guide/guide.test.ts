import { describe, expect, it } from 'vitest';
import { PUBLIC_NAV } from '@/lib/navigation';
import { FIRST_DAY_ORDER, GUIDE_FAQS, GUIDE_STEPS, guideDestinations } from './guide';

/**
 * A guide is only worth having if every door it points at opens.
 *
 * These assertions are about agreement with the rest of the application
 * rather than about the prose: a step that sends a member to a path this
 * build does not serve is the one failure mode that makes the page actively
 * harmful, and it is invisible on the screen because a Next `Link` to a
 * missing route looks exactly like a working one until it is clicked.
 */

/** Every path the application serves, as `frontend/src/app` lays it out. */
const ROUTES = new Set([
  '/',
  '/guide',
  '/login',
  '/announcements',
  '/gallery',
  '/status',
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

  /**
   * The order is the order the product enforces: a member cannot be paid
   * before they have consented, and cannot take work before they have signed
   * in. A guide that opened on 첫 작업 would be describing a screen the
   * reader cannot reach yet.
   */
  it('opens with signing in and consenting', () => {
    expect(GUIDE_STEPS[0]?.id).toBe('sign-in');
  });

  it('ends by checking the receipt rather than by taking more work', () => {
    expect(GUIDE_STEPS.at(-1)?.id).toBe('receipt');
  });

  it('offers a short version as well as the long one', () => {
    expect(FIRST_DAY_ORDER.length).toBeGreaterThan(0);
  });

  it('answers product-specific questions before a visitor signs in', () => {
    expect(GUIDE_FAQS.length).toBeGreaterThanOrEqual(4);
    for (const faq of GUIDE_FAQS) {
      expect(faq.question.trim()).not.toBe('');
      expect(faq.answer.trim()).not.toBe('');
    }
  });

  // Public, and reachable without hovering: it is the answer to "what is this
  // site" for somebody who has not signed in.
  it('is in the navigation a signed-out visitor sees', () => {
    expect(PUBLIC_NAV.map((entry) => entry.href)).toContain('/guide');
  });
});
