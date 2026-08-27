import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

// Without this each render stacks onto the previous one's DOM, and a query
// finds an element an earlier test left behind rather than the one under test.
afterEach(cleanup);
import { Amount, PostingStrip } from './posting-strip';

describe('Amount', () => {
  it('groups thousands', () => {
    render(<Amount value="1234567" />);
    expect(screen.getByText('1,234,567')).toBeDefined();
  });

  // The reason formatting works on the string: an amount can carry 38 digits,
  // and Number() would round it without saying so.
  it('keeps every digit of an amount far beyond a safe integer', () => {
    const huge = '9' + '0'.repeat(37);
    render(<Amount value={huge} />);
    const rendered = screen.getByText(/^90(,000){12}$/);
    expect(rendered.textContent?.replace(/,/g, '')).toBe(huge);
  });

  it('renders a negative amount with a true minus sign', () => {
    render(<Amount value="-4200" />);
    expect(screen.getByText('−4,200')).toBeDefined();
  });

  it('leaves a short amount ungrouped', () => {
    render(<Amount value="42" />);
    expect(screen.getByText('42')).toBeDefined();
  });

  // Colour is never the only signal: a direction glyph carries it too, so the
  // information survives colour blindness and a screen reader.
  it('marks a rise with a glyph as well as a colour', () => {
    render(<Amount value="10" direction="rise" />);
    expect(screen.getByLabelText('상승')).toBeDefined();
  });

  it('marks a fall with a glyph as well as a colour', () => {
    render(<Amount value="10" direction="fall" />);
    expect(screen.getByLabelText('하락')).toBeDefined();
  });

  it('shows no direction glyph when there is no direction', () => {
    render(<Amount value="10" />);
    expect(screen.queryByLabelText('상승')).toBeNull();
    expect(screen.queryByLabelText('하락')).toBeNull();
  });
});

describe('PostingStrip', () => {
  it('shows both sides of the entry and the amount between them', () => {
    render(<PostingStrip debit="내 지갑" credit="상점" amount="1500" label="소비" />);
    expect(screen.getByText('내 지갑')).toBeDefined();
    expect(screen.getByText('상점')).toBeDefined();
    expect(screen.getByText('1,500')).toBeDefined();
    expect(screen.getByText('소비')).toBeDefined();
  });

  it('renders without a label or a timestamp', () => {
    render(<PostingStrip debit="a" credit="b" amount="1" />);
    expect(screen.getByText('1')).toBeDefined();
  });
})
