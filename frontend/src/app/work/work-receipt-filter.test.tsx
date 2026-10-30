import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { WorkReceiptRewardFilter } from './work-receipt-filter';
afterEach(cleanup);
describe('work reward receipt search form', () => {
  it('offers a labelled GET filter and explains latest-20 scope', () => {
    const { container } = render(
      <WorkReceiptRewardFilter
        selected="9007199254740993"
        invalid={false}
        unavailable={false}
        verifiedEmpty={true}
        isEn={false}
      />,
    );
    const input = screen.getByRole('textbox', { name: '최소 수령 WLD' }) as HTMLInputElement;
    expect(input.name).toBe('receiptMinReward');
    expect(input.value).toBe('9007199254740993');
    expect(container.querySelector('form[action="/work"][method="get"]')).not.toBeNull();
    expect(screen.getByText(/최근 보상 영수증 20건/)).toBeDefined();
    expect(screen.getByRole('status')).toBeDefined();
  });
  it('does not turn an unavailable result into a verified empty message', () => {
    render(
      <WorkReceiptRewardFilter invalid={false} unavailable={true} verifiedEmpty={false} isEn />,
    );
    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.queryByRole('status')).toBeNull();
  });
});
