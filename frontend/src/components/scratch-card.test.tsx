import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScratchCardModal } from './scratch-card-modal';

vi.mock('@/components/locale-provider', () => ({
  useLocale: () => ({ locale: 'ko' }),
}));

describe('ScratchCardModal Interactive Invariants', () => {
  it('renders scratchcard when open and displays reward details upon claim', () => {
    const handleClose = vi.fn();
    const handleClaim = vi.fn();

    const { rerender } = render(
      <ScratchCardModal
        isOpen={true}
        onClose={handleClose}
        onClaim={handleClaim}
        reward={{
          symbol: 'WDG',
          name: '월덕게임즈',
          shares: '5.0',
          estimatedWld: '7,250 WLD',
        }}
      />
    );

    expect(screen.getByText('럭키 주식 스크래치 복권')).toBeDefined();
    expect(screen.getByText('월덕게임즈')).toBeDefined();
    expect(screen.getByText('+5.0주')).toBeDefined();

    // Auto Scratch
    const autoButton = screen.getByRole('button', { name: /한 번에 모두 긁기/i });
    fireEvent.click(autoButton);

    expect(handleClaim).toHaveBeenCalledWith({
      symbol: 'WDG',
      name: '월덕게임즈',
      shares: '5.0',
      estimatedWld: '7,250 WLD',
    });

    // Close button appears
    const claimCloseButton = screen.getByRole('button', { name: /주식 수령 및 닫기/i });
    fireEvent.click(claimCloseButton);
    expect(handleClose).toHaveBeenCalled();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ScratchCardModal isOpen={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });
});
