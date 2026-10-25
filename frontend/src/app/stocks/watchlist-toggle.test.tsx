import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

vi.mock('@/components/locale-provider', () => ({ useLocale: () => ({ locale: 'ko' }) }));
vi.mock('@/components/action-form', () => ({
  SubmitButton: ({ children, className }: { children: React.ReactNode; className: string }) => <button type="submit" className={className}>{children}</button>,
  ActionAlert: ({ state }: { state: { message: string } }) => <div role="status" aria-live="polite">{state.message}</div>,
}));
vi.mock('./actions', () => ({
  setWatchlist: async () => ({ status: 'error', message: '관심종목을 변경할 수 없어요.' }),
}));

import { WatchlistToggle } from './watchlist-toggle';

describe('watchlist toggle member feedback', () => {
  it('announces failed mutations and retains a 44px touch target', async () => {
    render(<WatchlistToggle stockId="c3a6f5c5-3a90-44b1-bb70-b4e82452e09b" watching />);
    const button = screen.getByRole('button', { name: /관심종목/ });
    expect(button.className).toContain('min-h-11');
    fireEvent.submit(button.closest('form')!);
    expect((await screen.findByRole('status')).textContent).toContain('관심종목을 변경할 수 없어요.');
  });
});
