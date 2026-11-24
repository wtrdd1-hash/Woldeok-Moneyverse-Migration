import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageHeader } from './page-header';

/**
 * DESIGN180 page head (plan task 3): one h1, the lead directly under it, page
 * actions on the right of the title block, no eyebrow line, and a 25px gap
 * before the content (DESIGN180 `.page-head`).
 */
describe('PageHeader (DESIGN180)', () => {
  it('renders one h1 with the lead in the title block and actions beside it', () => {
    render(
      <PageHeader eyebrow="Moneyverse" title="지갑" action={<button type="button">송금</button>}>
        원장에 기록된 잔액과 거래입니다.
      </PageHeader>,
    );
    const h1 = screen.getAllByRole('heading', { level: 1 });
    expect(h1).toHaveLength(1);
    const titleBlock = h1[0]!.parentElement!;
    expect(titleBlock.textContent).toContain('원장에 기록된 잔액과 거래입니다.');
    const action = screen.getByRole('button', { name: '송금' });
    expect(titleBlock.contains(action)).toBe(false);
    expect(titleBlock.parentElement!.contains(action)).toBe(true);
  });

  it('never draws the eyebrow text', () => {
    render(<PageHeader eyebrow="Moneyverse" title="은행" />);
    expect(screen.queryByText('Moneyverse')).toBeNull();
  });

  it('uses the DESIGN180 head spacing', () => {
    const { container } = render(<PageHeader title="은행" />);
    expect(container.querySelector('header')!.className).toContain('mb-6');
  });
});
