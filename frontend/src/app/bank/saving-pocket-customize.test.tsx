import React from 'react';
import { describe, it, expect, vi } from 'vitest';
vi.mock('./actions', () => ({ customizePocketAction: vi.fn() }));
import { fireEvent, render, screen } from '@testing-library/react';
import { SavingPocketCustomizeDialog } from './saving-pocket-customize-dialog';
import type { SavingPocket } from './types';

const mockPocket: SavingPocket = {
  pocket_id: 'pocket-1111-2222-3333-4444',
  name: '비상금 통장',
  target_amount: '50000',
  target_date: '2026-12-31',
  balance: '25000',
  theme_color: 'sky',
  icon_code: 'piggy-bank',
  is_archived: false,
  created_at: '2026-09-20T00:00:00Z',
  updated_at: '2026-09-26T00:00:00Z',
};

describe('SavingPocketCustomizeDialog Component Tests', () => {
  it('retains one UUIDv4 for an unchanged intent and rotates it when the selected fee changes', () => {
    const { rerender } = render(
      <SavingPocketCustomizeDialog pocket={mockPocket} cashBalance="100000" open={true} onOpenChange={() => {}} />,
    );
    const readKey = () => (document.querySelector('input[name="idempotencyKey"]') as HTMLInputElement | null)?.value;
    const first = readKey();
    expect(first).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    rerender(<SavingPocketCustomizeDialog pocket={mockPocket} cashBalance="100000" open={true} onOpenChange={() => {}} />);
    expect(readKey()).toBe(first);
    fireEvent.click(screen.getByTitle('에메랄드 그린'));
    const second = readKey();
    expect(second).not.toBe(first);
    rerender(<SavingPocketCustomizeDialog pocket={mockPocket} cashBalance="100000" open={true} onOpenChange={() => {}} />);
    expect(readKey()).toBe(second);
    rerender(<SavingPocketCustomizeDialog pocket={mockPocket} cashBalance="100000" open={false} onOpenChange={() => {}} />);
    rerender(<SavingPocketCustomizeDialog pocket={mockPocket} cashBalance="100000" open={true} onOpenChange={() => {}} />);
    const reopened = readKey();
    expect(reopened).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(reopened).not.toBe(second);
  });

  it('renders preview card and fee details correctly', () => {
    render(
      <SavingPocketCustomizeDialog
        pocket={mockPocket}
        cashBalance="100000"
        open={true}
        onOpenChange={() => {}}
      />,
    );

    expect(screen.getByText(/'비상금 통장' 테마 커스텀/i)).toBeDefined();
    expect(screen.getByText(/실시간 적용 미리보기/i)).toBeDefined();
    expect(screen.getAllByText(/테마 색상/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/아이콘 팩/i).length).toBeGreaterThan(0);
  });
});
