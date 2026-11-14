// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { SpringMigrationBanner } from './spring-migration-banner';

describe('SpringMigrationBanner', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders cutover notice and link to spring health', () => {
    render(<SpringMigrationBanner />);
    expect(screen.getByText(/SPRING BOOT 3.3 CUTOVER/i)).toBeTruthy();
    expect(screen.getByText(/엔터프라이즈 Java Spring Boot 3.3 고성능 엔진 전환 가동 중/i)).toBeTruthy();
    const link = screen.getByRole('link', { name: /Spring 상태 점검 →/i });
    expect(link.getAttribute('href')).toBe('/health/spring');
  });

  it('hides banner when dismiss button is clicked', () => {
    render(<SpringMigrationBanner />);
    const closeBtn = screen.getByRole('button', { name: /배너 닫기/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByText(/SPRING BOOT 3.3 CUTOVER/i)).toBeNull();
    expect(sessionStorage.getItem('moneyverse_spring_banner_dismissed')).toBe('true');
  });
});
