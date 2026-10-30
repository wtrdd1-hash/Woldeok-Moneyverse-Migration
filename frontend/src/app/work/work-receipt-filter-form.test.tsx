import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { WorkReceiptCeilingForm } from './work-receipt-filter-form';
afterEach(cleanup);
describe('work reward receipt ceiling form', () => {
  it('has a visible keyboard-accessible label and GET form with selected filters', () => {
    const { container } = render(<WorkReceiptCeilingForm isEn={false}
      selected="9007199254740993" maxDurationSeconds="300" maxReward="500"
      availableOnly />);
    const input = screen.getByRole('textbox', { name: '영수증 최대 보상 (WLD)' }) as HTMLInputElement;
    expect(input.value).toBe('9007199254740993');
    expect(input.inputMode).toBe('numeric');
    expect(input.maxLength).toBe(18);
    expect(container.querySelector('form[action="/work"][method="get"]')).not.toBeNull();
    expect(container.querySelector('input[name="availableOnly"]')?.getAttribute('value')).toBe('1');
    expect(screen.getByRole('button', { name: '영수증 검색' })).toBeDefined();
  });
});
