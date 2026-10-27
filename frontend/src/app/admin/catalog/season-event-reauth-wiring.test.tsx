import type * as ReactModule from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof ReactModule>();
  return {
    ...actual,
    useActionState: () => [
      { status: 'error', errorCode: 'reauthentication_required', message: '본인 확인이 필요합니다.' },
      () => {},
      false,
    ],
  };
});

vi.mock('../actions', () => ({
  createSeasonEvent: vi.fn(), setSeasonEventActive: vi.fn(), setStockActive: vi.fn(),
  setBusinessActive: vi.fn(), applyCorporateAction: vi.fn(), createStock: vi.fn(),
  deleteStock: vi.fn(), setStockPrice: vi.fn(), setUserRestriction: vi.fn(),
  payoutToUser: vi.fn(), reverseUserTransaction: vi.fn(), sendAdminDirectMessage: vi.fn(),
}));
vi.mock('../security-actions', () => ({ forceLogout: vi.fn() }));

import { NewSeasonEventForm, ToggleActive } from '../admin-forms';

describe('season event mutation recovery wiring', () => {
  it('shows recent-auth recovery after a rejected season event creation', () => {
    render(<NewSeasonEventForm />);
    expect(screen.getByRole('link', { name: /계정 보안에서 본인 확인/ }).getAttribute('href'))
      .toBe('/account/security');
    expect(screen.getByRole('button', { name: '이벤트 등록' })).toBeTruthy();
  });

  it('offers the same recovery for season status changes but not unrelated business toggles', () => {
    const { rerender } = render(<ToggleActive id="event-id" active kind="season" />);
    expect(screen.getByRole('link', { name: /계정 보안에서 본인 확인/ })).toBeTruthy();
    rerender(<ToggleActive id="business-id" active kind="business" />);
    expect(screen.queryByRole('link', { name: /계정 보안에서 본인 확인/ })).toBeNull();
  });
});
