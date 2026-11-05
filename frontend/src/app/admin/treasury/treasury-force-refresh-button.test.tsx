import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { TreasuryForceRefreshButton } from './treasury-force-refresh-button';

const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

vi.mock('sonner', () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('TreasuryForceRefreshButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with accessible name and minimum 44px mobile touch target class', () => {
    render(<TreasuryForceRefreshButton />);
    const button = screen.getByRole('button', { name: /국고 원장 강제 새로고침/ });
    expect(button).toBeDefined();
    expect(button.className).toContain('min-h-[44px]');
  });

  it('triggers router refresh on click', () => {
    render(<TreasuryForceRefreshButton />);
    const button = screen.getByRole('button', { name: /국고 원장 강제 새로고침/ });
    fireEvent.click(button);
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });
});
