import { describe, expect, it } from 'vitest';
import { parseFirstDayFlow } from './early-events';

const row = (overrides: Record<string, unknown> = {}) => ({
  step_code: 'job_sampler', step_label: '직업 체험', step_detail: '실제 작업 보상 기준',
  step_href: '/work', step_metric: 'job_sampler', step_verified: true,
  step_target: '4', step_progress: '2', step_unit: '종', step_done: false,
  ...overrides,
});

describe('owner first-day flow source evidence', () => {
  it('accepts the owner-scoped SQL contract and exact bigint progress', () => {
    expect(parseFirstDayFlow({ steps: [row({ step_progress: '9007199254740993', step_target: '9007199254740994' })] })?.steps[0]?.step_progress)
      .toBe('9007199254740993');
    expect(parseFirstDayFlow({ steps: [] })).toEqual({ steps: [] });
  });
  it.each([
    null, {}, { steps: null }, { steps: 'none' }, { steps: [null] },
    { steps: [row({ step_href: 'javascript:alert(1)' })] },
    { steps: [row({ step_href: '//evil.example' })] },
    { steps: [row({ step_href: '/admin' })] },
    { steps: [row({ step_progress: '1.5' })] },
    { steps: [row({ step_progress: '2e3' })] },
    { steps: [row({ step_target: '-1' })] },
    { steps: [row({ step_done: true })] },
    { steps: [row({ step_verified: false })] },
    { steps: [row({ step_metric: 'unverified', step_verified: false, step_target: '0', step_progress: '0', step_done: true })] },
    { steps: [row(), row()] },
    { steps: [row({ step_label: '' })] },
    { steps: [row({ step_progress: 2 })] },
    { steps: [row({ step_progress: '9223372036854775808' })] },
  ])('rejects malformed or fabricated completion evidence %#', (payload) => {
    expect(parseFirstDayFlow(payload)).toBeNull();
  });
  it('accepts read-only tutorial steps without fabricating completion', () => {
    expect(parseFirstDayFlow({ steps: [row({
      step_code: 'economy_tutorial', step_href: '/guide', step_metric: 'unverified',
      step_verified: false, step_target: '0', step_progress: '0', step_unit: '', step_done: false,
    })] })?.steps).toHaveLength(1);
  });
});
