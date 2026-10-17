import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

const navigation = vi.hoisted(() => ({
  refresh: vi.fn(),
  replace: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => navigation,
}));

import { LocaleProvider, useLocale } from './locale-provider';

function LocaleActions() {
  const { setLocale, resetLocaleToAuto } = useLocale();
  return (
    <>
      <button onClick={() => setLocale('en')}>Choose English</button>
      <button onClick={resetLocaleToAuto}>Choose automatic</button>
    </>
  );
}

beforeEach(() => {
  navigation.refresh.mockClear();
  navigation.replace.mockClear();
  window.history.replaceState({}, '', '/');
  document.cookie = 'wdmv_locale=; Path=/; Max-Age=0';
});

afterEach(() => {
  cleanup();
  window.history.replaceState({}, '', '/');
  document.cookie = 'wdmv_locale=; Path=/; Max-Age=0';
});

describe('manual/automatic language choices on prefixed routes', () => {
  it('navigates to the chosen locale path rather than refreshing the old prefix', () => {
    window.history.replaceState({}, '', '/ja/stocks?sort=recent');
    render(<LocaleProvider initialLocale="ja"><LocaleActions /></LocaleProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Choose English' }));
    expect(document.documentElement.lang).toBe('en');
    expect(navigation.replace).toHaveBeenCalledWith('/en/stocks?sort=recent');
    expect(navigation.refresh).not.toHaveBeenCalled();
  });

  it('exits the language prefix when resetting to IP automatic mode', () => {
    window.history.replaceState({}, '', '/ja/stocks');
    document.cookie = 'wdmv_locale=ja; Path=/';
    render(<LocaleProvider initialLocale="ja"><LocaleActions /></LocaleProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Choose automatic' }));
    expect(document.cookie).not.toContain('wdmv_locale=');
    expect(navigation.replace).toHaveBeenCalledWith('/stocks');
  });

  it('navigates to the equivalent physical localized page on a manual change', () => {
    window.history.replaceState({}, '', '/ja/blog/some-article');
    render(<LocaleProvider initialLocale="ja"><LocaleActions /></LocaleProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Choose English' }));
    expect(navigation.replace).toHaveBeenCalledWith('/en/blog/some-article');
  });

  it('does not leave an explicit language query trapping auto mode', () => {
    window.history.replaceState({}, '', '/stocks?lang=ja&sort=recent');
    document.cookie = 'wdmv_locale=ja; Path=/';
    render(<LocaleProvider initialLocale="ja"><LocaleActions /></LocaleProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Choose automatic' }));
    expect(navigation.replace).toHaveBeenCalledWith('/stocks?sort=recent');
  });

  it('preserves an unprefixed route when the user manually selects a language', () => {
    window.history.replaceState({}, '', '/wallet');
    render(<LocaleProvider initialLocale="ja"><LocaleActions /></LocaleProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Choose English' }));
    expect(navigation.replace).not.toHaveBeenCalled();
    expect(navigation.refresh).toHaveBeenCalledOnce();
  });
});
