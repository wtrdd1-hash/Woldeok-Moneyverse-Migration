import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { calculateRetirementEligibility } from '@/lib/retirement-estimate';
import RetirementCalculatorPage from './page';
import RetirementCalculatorLayout, { metadata } from './layout';

vi.mock('@/components/locale-provider', () => ({ useLocale: () => ({ locale: 'ko' }) }));
vi.mock('@/components/public-advertisement', () => ({
  InArticleAdvertisement: () => null, MultiplexAdvertisement: () => null,
}));
vi.mock('@/components/calculator-save-action', () => ({ CalculatorSaveAction: () => null }));
vi.mock('@/components/social-share-bar', () => ({ SocialShareBar: () => null }));

afterEach(() => cleanup());

describe('Retirement eligibility: minimum one year', () => {
  it('returns zero statutory severance at 0 and 11 months', () => {
    expect(calculateRetirementEligibility(0, 0, 3000000, 0).estimatedSeverance).toBe(0);
    expect(calculateRetirementEligibility(0, 11, 3000000, 0)).toMatchObject({ eligible: false, estimatedSeverance: 0 });
  });
  it('uses actual completed months after 12 months rather than forcing one year', () => {
    expect(calculateRetirementEligibility(1, 0, 3000000, 0)).toMatchObject({ eligible: true, estimatedSeverance: 3000000 });
    expect(calculateRetirementEligibility(1, 1, 3000000, 0).estimatedSeverance).toBe(3250000);
  });
  it('prorates annual bonus and sanitizes negative or invalid salary', () => {
    expect(calculateRetirementEligibility(1, 0, 3000000, 12000000).estimatedSeverance).toBe(4000000);
    expect(calculateRetirementEligibility(1, 0, -3000000, Number.NaN).estimatedSeverance).toBe(0);
  });
  it('normalizes fractional or nonfinite tenure without producing NaN', () => {
    const result = calculateRetirementEligibility(Number.NaN, 11.9, Infinity, 0);
    expect(result.eligible).toBe(false);
    expect(result.estimatedSeverance).toBe(0);
  });
});

describe('Retirement calculator UI and SEO', () => {
  it('accepts 0 years and 11 months, shows zero estimate and eligibility warning', () => {
    render(<RetirementCalculatorPage />);
    const years = screen.getByLabelText('근속연수 (년 / 개월)');
    fireEvent.change(years, { target: { value: '0' } });
    const months = screen.getByLabelText('근속 개월 수');
    fireEvent.change(months, { target: { value: '11' } });
    expect(screen.getByRole('status', { name: '퇴직급여 지급 자격 안내' }).textContent).toContain('1년 미만');
    expect(screen.getByText('세전 퇴직금').parentElement?.textContent).toContain('0 원');
  });
  it('keeps mobile input targets at least 44px and keyboard reachable', () => {
    render(<RetirementCalculatorPage />);
    expect(screen.getByLabelText('근속연수 (년 / 개월)').className).toContain('min-h-11');
    expect(screen.getByLabelText('근속 개월 수').className).toContain('min-h-11');
  });
  it('has severance-specific canonical SEO rather than unrelated NPS/FIRE promises', () => {
    expect(metadata.title).toContain('퇴직금');
    expect(metadata.description).toContain('근속');
    const { container } = render(<RetirementCalculatorLayout><div>Page</div></RetirementCalculatorLayout>);
    expect(container.textContent).not.toContain('aggregateRating');
    expect(container.querySelectorAll('script[type="application/ld+json"]')[2]?.textContent).not.toContain('aggregateRating');
  });
  it('does not emit fabricated rating metadata or promise a virtual WLD grant', () => {
    const { container } = render(<RetirementCalculatorPage />);
    expect(container.querySelector('script[type="application/ld+json"]')?.textContent).not.toContain('aggregateRating');
    expect(container.textContent).not.toContain('10,000 WLD 지급 예약됨');
    expect(container.textContent).not.toContain('무료 10,000 WLD');
  });
});
