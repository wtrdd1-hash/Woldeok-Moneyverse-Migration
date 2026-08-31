import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

// Without this each render stacks onto the previous one's DOM, and a query
// finds an element an earlier test left behind rather than the one under test.
afterEach(cleanup);
import { ClosedNotice, PlayOutcome } from './casino-parts';

describe('ClosedNotice', () => {
  // A shut game and a paused one must not read the same. One is waiting for a
  // legal review and will not open today whatever the member does; the other
  // is an operator state meant to be lifted, where "come back later" is true.
  // The switch is one switch for the whole casino, so the sentence names the
  // casino. It named the coin game while the coin was the only game, and a
  // member sent away from the dice by a notice about a coin would reasonably
  // go looking for the dice somewhere else.
  it('tells a member the games are shut rather than busy', () => {
    render(<ClosedNotice closure="disabled" />);
    expect(screen.getByText('카지노는 지금 열려 있지 않아요.')).toBeDefined();
  });

  it('tells a member a pause is temporary', () => {
    render(<ClosedNotice closure="paused" />);
    expect(screen.getByText('카지노를 잠시 멈춰 두었어요.')).toBeDefined();
  });

  it('names safe mode as its own state', () => {
    render(<ClosedNotice closure="safe_mode" />);
    expect(screen.getByText('카지노가 안전 모드예요.')).toBeDefined();
  });
});

describe('PlayOutcome', () => {
  // Colour is never the only signal: the badge says the outcome in words and
  // the direction glyph carries it again for a screen reader.
  it('marks a win in words as well as in colour', () => {
    const { container } = render(<PlayOutcome netAmount="5000" />);
    expect(screen.getByText('적중')).toBeDefined();
    expect(screen.getByLabelText('상승')).toBeDefined();
    expect(container.textContent).toContain('5,000');
  });

  it('marks a loss in words as well as in colour', () => {
    const { container } = render(<PlayOutcome netAmount="-5000" />);
    expect(screen.getByText('빗나감')).toBeDefined();
    expect(screen.getByLabelText('하락')).toBeDefined();
    // A true minus sign, U+2212, as every other amount in this product uses.
    expect(container.textContent).toContain('−5,000');
  });

  it('does not report a zero net as a win', () => {
    render(<PlayOutcome netAmount="0" />);
    expect(screen.getByText('무승부')).toBeDefined();
    expect(screen.queryByText('적중')).toBeNull();
  });

  // The reason the sign is read off the string rather than through Number():
  // a net amount is a bigint and rounding one would change what happened.
  it('keeps every digit of a loss far beyond a safe integer', () => {
    const huge = '9' + '0'.repeat(37);
    const { container } = render(<PlayOutcome netAmount={`-${huge}`} />);
    expect(container.textContent?.replace(/[^0-9]/g, '')).toBe(huge);
  });
});
