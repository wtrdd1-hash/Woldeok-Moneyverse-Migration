import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HelpCategoryCounts } from './help-category-counts';

describe('verified help category availability', () => {
  it('shows server-verified counts for the selected page language including zero', () => {
    render(<HelpCategoryCounts locale="ko" counts={{ account: '3', wallet: '0', shop: '1', community: '0', support: '0' }} />);
    expect(screen.getByText('계정: 3')).toBeDefined();
    expect(screen.getByText('지갑: 0')).toBeDefined();
    expect(screen.getByText(/한국어/)).toBeDefined();
  });
  it('never presents unavailable counts as verified zero', () => {
    const { container } = render(<HelpCategoryCounts locale="en" counts={null} />);
    expect(container.textContent).toContain('unavailable');
    expect(container.textContent).not.toContain('Account: 0');
  });
});
