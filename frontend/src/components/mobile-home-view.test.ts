import React from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MobileHomeView } from './mobile-home-view';

vi.mock('@/components/locale-provider', () => ({
  useLocale: () => ({ locale: 'ko', setLocale: () => {} }),
}));

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

describe('MobileHomeView', () => {
  it('renders the overhauled fintech super-app dashboard', () => {
    render(React.createElement(MobileHomeView, { notices: [] }));
    expect(screen.getByText(/WOLDEOK MONEYVERSE/i)).toBeTruthy();
    expect(screen.getByText(/돈 보내기/i)).toBeTruthy();
    expect(screen.getAllByText(/직업 업무/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/가상 주식 시장 주요 종목/i)).toBeTruthy();
  });
});
