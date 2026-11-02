// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { FirstDayFlow } from './early-events-parts';
import { parseFirstDayFlow } from './early-events';

describe('verified first-day onboarding screen', () => {
  it('renders only a validated step with an accessible local navigation target', () => {
    const payload = parseFirstDayFlow({ steps: [{
      step_code: 'first_tool', step_label: '첫 장비', step_detail: '상점 구매 확인',
      step_href: '/shop', step_metric: 'shop_purchase', step_verified: true,
      step_target: '1', step_progress: '1', step_unit: '개', step_done: true,
    }] });
    expect(payload).not.toBeNull();
    const html = renderToStaticMarkup(<FirstDayFlow steps={payload!.steps} />);
    expect(html).toContain('href="/shop"');
    expect(html).toContain('aria-label="첫 장비 바로 가기"');
    expect(html).toContain('min-h-11');
    expect(html).toContain('완료');
    expect(html).toContain('1 / 1개');
  });
});
