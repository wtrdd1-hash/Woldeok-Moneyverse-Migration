import { vi } from 'vitest';
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { LocaleProvider } from './locale-provider';
import { CurrencyProvider } from './currency-context';
import { LanguageSwitcher } from './language-switcher';

afterEach(() => {
  cleanup();
  document.documentElement.lang = 'ko';
  document.cookie = 'wdmv_locale=ko; Path=/;';
});

describe('LanguageSwitcher', () => {
  it('shows all 4 languages and applies an explicit choice', async () => {
    render(
      <LocaleProvider initialLocale="ko">
        <CurrencyProvider>
          <LanguageSwitcher />
        </CurrencyProvider>
      </LocaleProvider>,
    );

    const trigger = screen.getByRole('button', { name: /language|언어/i });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(await screen.findByText('한국어 (Korean)')).toBeTruthy();
    expect(await screen.findByText('English (US)')).toBeTruthy();
    expect(await screen.findByText('日本語 (Japanese)')).toBeTruthy();
    expect(await screen.findByText('简体中文 (Chinese)')).toBeTruthy();

    fireEvent.click(screen.getByText('English (US)'));
    expect(document.documentElement.lang).toBe('en');
    expect(screen.getByRole('button', { name: /change language/i })).toBeTruthy();
  });

  it('renders correctly in compact mode for mobile screens', () => {
    render(
      <LocaleProvider initialLocale="ko">
        <CurrencyProvider>
          <LanguageSwitcher compact />
        </CurrencyProvider>
      </LocaleProvider>,
    );

    const trigger = screen.getByRole('button', { name: /language|언어/i });
    expect(trigger).toBeTruthy();
    expect(trigger.textContent).toContain('KO');
  });
});
