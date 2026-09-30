import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { AdMonetizationCard } from './ad-monetization-card';

describe('AdMonetizationCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders ad monetization title, presets, and calculation summary', () => {
    render(<AdMonetizationCard totalHits24h={5000} />);

    expect(screen.getByText('Google AdSense 광고 수익화 & 트래픽 관제 타워')).toBeDefined();
    expect(screen.getByText('월 100만 원 필요 월간 PV')).toBeDefined();
    expect(screen.getByText('광고 안전 가드레일 (Fail-Closed Enforcement) 격리 현황')).toBeDefined();
    expect(screen.getByText('100% 완전 격리 중')).toBeDefined();
  });

  it('updates required PV when RPM is changed via preset', () => {
    render(<AdMonetizationCard totalHits24h={5000} />);

    // $12.00 고단가 프리셋 클릭
    const highPreset = screen.getByText('$12.00');
    fireEvent.click(highPreset);

    // RPM이 높아졌으므로 필요 월간 PV가 줄어드는지 확인
    expect(screen.getByText('월 100만 원 필요 월간 PV')).toBeDefined();
  });
});
