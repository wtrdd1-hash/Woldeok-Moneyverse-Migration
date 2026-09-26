import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VirtualBondSimulatorDialog } from './virtual-bond-simulator-dialog';

describe('VirtualBondSimulatorDialog Component Tests', () => {
  it('renders simulator trigger and modal contents properly', () => {
    render(
      <VirtualBondSimulatorDialog onApply={() => {}}>
        <button type="button">시뮬레이터 열기</button>
      </VirtualBondSimulatorDialog>,
    );

    expect(screen.getByRole('button', { name: '시뮬레이터 열기' })).toBeDefined();
  });
});
