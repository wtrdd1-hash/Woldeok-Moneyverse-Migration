import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TossStyleSocialFeed } from './toss-style-social-feed';

describe('TossStyleSocialFeed', () => {
  it('renders header and initial feed posts with return rate badges', () => {
    render(<TossStyleSocialFeed />);
    expect(screen.getByText('주주 라운지 & 실전 매매 소셜 피드')).toBeDefined();
    expect(screen.getByText('+48.5%')).toBeDefined();
    expect(screen.getByText('-12.4%')).toBeDefined();
    expect(screen.getAllByText('주주인증').length).toBeGreaterThan(0);
  });

  it('filters posts by stock symbol when clicked', () => {
    render(<TossStyleSocialFeed />);
    const chipsFilterBtn = screen.getByRole('button', { name: 'CHIPS' });
    fireEvent.click(chipsFilterBtn);

    // CHIPS post should still exist
    expect(screen.getByText('+48.5%')).toBeDefined();
    // WDG post should be filtered out
    expect(screen.queryByText('-12.4%')).toBeNull();
  });

  it('increments reaction count when clicking reaction buttons', () => {
    render(<TossStyleSocialFeed />);
    const flameButtons = screen.getAllByText(/응원해요/);
    const firstFlame = flameButtons[0]!;
    const initialText = firstFlame.textContent || '';
    fireEvent.click(firstFlame);

    // Should toggle active state
    expect(firstFlame.textContent).not.toBe(initialText);
  });
});
