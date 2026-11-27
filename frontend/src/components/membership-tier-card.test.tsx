import { afterEach, describe, expect, it } from 'vitest';
import { cleanup } from '@testing-library/react';
import { renderKo } from '@/testing/render-ko';
import { MembershipTierCard } from './membership-tier-card';

afterEach(cleanup);

// W03 Unslop pass (polish mode): the card used hue gradients, coloured glows, a pulsing badge, a
// shouting pill and mono prices outside the design tokens. Structure and copy stay; the styling
// comes from the shared tokens so it follows whichever palette the owner settles on.
describe('MembershipTierCard styling', () => {
  for (const active of [false, true]) {
    it(`uses the shared tokens without decoration (${active ? 'member' : 'free'})`, () => {
      const { container } = renderKo(<MembershipTierCard userBalance="20000" isPlusMember={active} />);
      const html = container.innerHTML;
      expect(html).not.toMatch(/bg-gradient-to|animate-pulse|shadow-amber|font-mono|font-black|slate-\d/);
      expect(html).toMatch(/tabular-nums/);
    });
  }
});
