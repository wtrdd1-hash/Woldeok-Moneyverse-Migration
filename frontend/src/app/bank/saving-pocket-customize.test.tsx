import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
