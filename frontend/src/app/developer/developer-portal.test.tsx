import React from 'react';
import { cleanup, render, fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DeveloperPortalView } from './developer-portal-view';
import { appApiContract } from '@/lib/app-gateway';

afterEach(cleanup);

describe('DeveloperPortalView', () => {
  const mockContract = appApiContract('https://easy-scraping.com');

  it('renders API center header and version badges', () => {
    const { container } = render(<DeveloperPortalView contract={mockContract} />);
    const text = container.textContent ?? '';

    expect(text).toContain('개발자 포털 & API 센터');
    expect(text).toContain('OpenAPI 3.0');
    expect(text).toContain('REST API v1');
  });

  it('filters endpoints by category', () => {
    const { container } = render(<DeveloperPortalView contract={mockContract} />);

    const buttons = Array.from(container.querySelectorAll('button'));
    const newspaperTab = buttons.find((b) => b.textContent?.includes('신문/펄스'));
    expect(newspaperTab).toBeDefined();

    if (newspaperTab) {
      fireEvent.click(newspaperTab);
    }

    const text = container.textContent ?? '';
    expect(text).toContain('/app-api/v1/newspaper/pulse');
    expect(text).toContain('/app-api/v1/newspaper/poll');
  });

  it('switches between code snippet tabs (cURL, TypeScript, Python, Live Sandbox)', () => {
    const { container } = render(<DeveloperPortalView contract={mockContract} />);

    const buttons = Array.from(container.querySelectorAll('button'));
    const tsTab = buttons.find((b) => b.textContent?.includes('TypeScript'));
    expect(tsTab).toBeDefined();
    if (tsTab) {
      fireEvent.click(tsTab);
    }
    expect(container.textContent).toContain('import axios from');

    const pyTab = buttons.find((b) => b.textContent?.includes('Python'));
    expect(pyTab).toBeDefined();
    if (pyTab) {
      fireEvent.click(pyTab);
    }
    expect(container.textContent).toContain('import requests');

    const tryTab = buttons.find((b) => b.textContent?.includes('실시간 샌드박스'));
    expect(tryTab).toBeDefined();
    if (tryTab) {
      fireEvent.click(tryTab);
    }
    expect(container.textContent).toContain('실시간 API 호출');
  });

  it('updates selected endpoint and renders sample schema', () => {
    const { container } = render(<DeveloperPortalView contract={mockContract} />);

    const buttons = Array.from(container.querySelectorAll('button'));
    const pollButton = buttons.find((b) => b.textContent?.includes('주간 독자 여론조사'));
    expect(pollButton).toBeDefined();

    if (pollButton) {
      fireEvent.click(pollButton);
    }

    const text = container.textContent ?? '';
    expect(text).toContain('/app-api/v1/newspaper/poll');
    expect(text).toContain('이번 주 머니버스 가상 증시 전망은 어디로 향할까요');
  });
});
