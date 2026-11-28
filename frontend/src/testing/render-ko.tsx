import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';
import { LocaleProvider } from '@/components/locale-provider';

/**
 * Renders inside a Korean LocaleProvider. The application default became English (I18N-02,
 * 2026-11-26); tests that assert Korean product copy declare the Korean locale explicitly
 * instead of relying on the default.
 */
export function renderKo(ui: ReactElement, options?: RenderOptions): RenderResult {
  return render(ui, { wrapper: ({ children }) => <LocaleProvider initialLocale="ko">{children}</LocaleProvider>, ...options });
}
