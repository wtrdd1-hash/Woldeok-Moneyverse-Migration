import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CentralBankPanel } from './central-bank-panel';
import { NationalMintPanel } from './national-mint-panel';

describe('v1415 admin sovereign finance truth', () => {
  it('central bank explains unavailable verified monetary aggregates rather than showing invented ones', () => {
    render(<CentralBankPanel />);
    expect(screen.getByText(/독립 원장 검증 전/)).toBeDefined();
    expect(screen.queryByText(/548,750,000/)).toBeNull();
    expect(screen.queryByText(/987,750,000/)).toBeNull();
    expect(screen.queryByRole('button', { name: /공식 인수 및 국고 방출 승인/ })).toBeNull();
  });
  it('mint bureau does not pretend demo batches are approved monetary issuance', () => {
    render(<NationalMintPanel />);
    expect(screen.getByText(/정식 발행 증명서를 검증/)).toBeDefined();
    expect(screen.queryByText(/550,000,000/)).toBeNull();
    expect(screen.queryByText(/MINT-202610-001/)).toBeNull();
    expect(screen.queryByRole('button', { name: /M0 주조 신청/ })).toBeNull();
  });
});
