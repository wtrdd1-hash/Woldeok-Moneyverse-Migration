import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { BankLiquidityCard } from './bank-liquidity-card';
import { memberBankEvidence } from './member-bank-evidence';

const huge = '900719925474099312345678901234567890';

describe('authenticated member bank evidence', () => {
  it('keeps large WLD amounts as canonical strings without a fabricated 35% fallback', () => {
    expect(memberBankEvidence({ bankBalance: huge, loanDebt: '0', creditLimit: '1000' })).toEqual({
      deposit: huge, outstanding: '0', creditLimit: '1000', debtToLimit: '0.0%', debtToLimitBar: 0,
    });
  });

  it('calculates only the member debt-to-credit-limit ratio, including over-limit debt', () => {
    expect(memberBankEvidence({ bankBalance: '200', loanDebt: '125', creditLimit: '100' })).toMatchObject({
      debtToLimit: '125.0%', debtToLimitBar: 100,
    });
    expect(memberBankEvidence({ bankBalance: '0', loanDebt: '0', creditLimit: '0' })).toMatchObject({
      debtToLimit: null, debtToLimitBar: null,
    });
    expect(memberBankEvidence({ bankBalance: '0', loanDebt: huge, creditLimit: '1' })?.debtToLimit).toBe('>999.9%');
  });

  it('rejects malformed or missing upstream amounts instead of rendering made-up metrics', () => {
    for (const invalid of [null, undefined, 1, '-1', '01', '1.0', '1e3', '9'.repeat(79)]) {
      expect(memberBankEvidence({ bankBalance: invalid, loanDebt: '0', creditLimit: '100' })).toBeNull();
      expect(memberBankEvidence({ bankBalance: '0', loanDebt: invalid, creditLimit: '100' })).toBeNull();
      expect(memberBankEvidence({ bankBalance: '0', loanDebt: '0', creditLimit: invalid })).toBeNull();
    }
  });

  it('renders a member-only source explanation, no invented reserve or guaranteed safety claim', () => {
    const html = renderToStaticMarkup(<BankLiquidityCard bankBalance="1000" loanDebt="0" creditLimit="2000" />);
    expect(html).toContain('내 예금·대출 조회 현황');
    expect(html).toContain('0.0%');
    expect(html).not.toContain('건전 유동성 (최적 안정 구간)');
    expect(html).not.toContain('인출 100% 상시 보장');
    expect(html).not.toContain('Aave식 Kinked');
    expect(html).toContain('증명하지 않습니다');
  });

  it('announces unavailable evidence and the zero-limit case accessibly', () => {
    const invalid = renderToStaticMarkup(<BankLiquidityCard bankBalance="bad" loanDebt="0" creditLimit="100" isEn />);
    expect(invalid).toContain('role="status"');
    expect(invalid).toContain('could not be verified');
    expect(invalid).not.toContain('35.0%');
    const zero = renderToStaticMarkup(<BankLiquidityCard bankBalance="0" loanDebt="0" creditLimit="0" />);
    expect(zero).toContain('계산 불가');
    expect(zero).toContain('신용 한도가 0 WLD');
  });
});