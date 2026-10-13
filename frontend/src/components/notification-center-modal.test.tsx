import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NotificationCenterModal } from './notification-center-modal';

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

afterEach(() => vi.restoreAllMocks());

describe('notification center safety and mobile accessibility', () => {
  it('does not offer a fake reward claim and provides a touch-size trigger', () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true, json: async () => ({ unreadCount: 0 }),
    } as Response);
    render(<NotificationCenterModal />);
    expect(screen.getByText(/보상 일괄 수령은 정산 기능/)).toBeDefined();
    expect(screen.queryByRole('button', { name: /원클릭 모두 수령/ })).toBeNull();
    expect(screen.getByRole('button', { name: /알림 센터 열기/ }).className).toContain('min-h-11');
  });
});
