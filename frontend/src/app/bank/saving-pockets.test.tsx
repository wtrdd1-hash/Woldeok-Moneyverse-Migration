import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { SavingPocketsCard } from './saving-pockets-card';
import type { SavingPocket } from './types';

vi.mock('@/components/locale-provider', () => ({
  useLocale: () => ({ locale: 'ko', setLocale: () => {} }),
}));

describe('SavingPocketsCard', () => {
  it('renders empty state when no active pockets exist', () => {
    render(
      <SavingPocketsCard
        pockets={[]}
        cashBalance="50000"
        bankBalance="100000"
      />
    );

    expect(screen.getByText(/아직 개설된 저축 포켓이 없어요/i)).toBeDefined();
    expect(screen.getByText(/새 포켓 개설/i)).toBeDefined();
  });

  it('renders active pockets with correct progress and balance', () => {
    const mockPockets: SavingPocket[] = [
      {
        pocket_id: '11111111-1111-1111-1111-111111111111',
        name: '비상금 통장',
        balance: '5000',
        target_amount: '10000',
        target_date: '2026-12-31',
        theme_color: 'emerald',
        icon_code: 'piggy-bank',
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    render(
      <SavingPocketsCard
        pockets={mockPockets}
        cashBalance="50000"
        bankBalance="100000"
      />
    );

    expect(screen.getByText('비상금 통장')).toBeDefined();
    expect(screen.getByText(/50% 달성/i)).toBeDefined();
    expect(screen.getByText('5,000')).toBeDefined();
  });
});
