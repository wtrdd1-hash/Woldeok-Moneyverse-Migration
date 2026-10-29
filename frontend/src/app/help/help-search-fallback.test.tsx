import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { HelpSearch } from './help-search';

describe('verified help language fallback accessibility', () => {
  it('offers a labeled opt-in checkbox without auto-selecting it', () => {
    render(<HelpSearch initialLocale="ko" />);
    const checkbox = screen.getByRole('checkbox', { name: /영어 도움말도 검색하기/ }) as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    expect(checkbox.name).toBe('fallbackToOtherLocale');
    expect(screen.getByRole('button', { name: '검색' })).toBeTruthy();
  });
  it('updates the fallback language description when the member changes the search locale', () => {
    render(<HelpSearch initialLocale="ko" />);
    fireEvent.change(screen.getByLabelText('Language / 언어'), { target: { value: 'en' } });
    expect(screen.getByText(/If no verified results are found, search Korean articles too/)).toBeTruthy();
  });
});
