import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { LocaleProvider } from './locale-provider';
import { LanguageSwitcher } from './language-switcher';

afterEach(() => {
  cleanup();
  document.documentElement.lang = 'ko';
});

describe('LanguageSwitcher', () => {
  it('shows both languages and applies an explicit choice', async () => {
    render(
      <LocaleProvider>
        <LanguageSwitcher />
      </LocaleProvider>,
    );

    fireEvent.keyDown(screen.getByLabelText('언어 변경'), { key: 'ArrowDown' });
    expect(await screen.findByText('한국어')).toBeTruthy();
    expect(await screen.findByText('English')).toBeTruthy();

    fireEvent.click(screen.getByText('English'));
    expect(document.documentElement.lang).toBe('en');
    expect(screen.getByLabelText('Change language')).toBeTruthy();
  });
});
