import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SeasonCostForm } from './season-cost-form';

describe('member season event affordability controls', () => {
  it('has an accessible read-only GET filter and explicit reset', () => {
    const { container } = render(<SeasonCostForm maxCost="1000" />);
    const select = screen.getByLabelText('이벤트 1회 참가비 상한') as HTMLSelectElement;
    expect(select.value).toBe('1000');
    expect(select.name).toBe('maxCost');
    expect(container.querySelector('form')?.getAttribute('method')).toBe('get');
    expect(screen.getByRole('link', { name: '초기화' }).getAttribute('href')).toBe('/seasons');
    expect(screen.queryByText('결제')).toBeNull();
  });
  it('retains an arbitrary canonical cost cap in the form', () => {
    render(<SeasonCostForm maxCost="9007199254740993" />);
    expect((screen.getByLabelText('이벤트 1회 참가비 상한') as HTMLSelectElement).value).toBe('9007199254740993');
  });
});
