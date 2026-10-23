import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CalculatorConversionBanner } from './calculator-conversion-banner';

afterEach(cleanup);

describe('CalculatorConversionBanner', () => {
  it('offers real virtual market navigation without promising a bonus or no-loss outcome', () => {
    render(<CalculatorConversionBanner targetSymbol="CHIPS" />);
    expect(screen.getByRole('link', { name: /CHIPS 가상 종목 보기/ }).getAttribute('href')).toBe('/stocks/CHIPS');
    expect(screen.getByRole('link', { name: /회원가입/ }).getAttribute('href')).toBe('/register');
    expect(screen.queryByText(/즉시 지급|100% 안전한 무손실|지원금 받기/)).toBeNull();
  });
});
