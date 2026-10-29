// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HelpSearch } from './help-search';

vi.mock('./actions', () => ({ searchVerifiedHelp: vi.fn() }));

describe('verified help result-count form', () => {
  it('labels the result count in English when English help is selected', () => {
    render(<HelpSearch initialLocale="en" />);
    expect(screen.getByRole('combobox', { name: 'Results to show' })).toBeTruthy();
  });
  it('offers an accessible 10/20/50 result count with 20 as the default', () => {
    render(<HelpSearch initialLocale="ko" />);
    const select = screen.getByRole('combobox', { name: '표시할 결과 수' }) as HTMLSelectElement;
    expect(select.value).toBe('20');
    expect(Array.from(select.options).map(option => option.value)).toEqual(['10', '20', '50']);
    expect(select.name).toBe('limit');
  });
});
