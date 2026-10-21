import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AdminApiDomainGrid } from './admin-api-domain-grid';
import type { DomainHealthData } from './api-health-dashboard';

const cases = [
  ['OPERATIONAL', 'emerald'],
  ['DEGRADED', 'amber'],
  ['MAINTENANCE', 'blue'],
  ['UNKNOWN', 'muted'],
] as const;

describe('admin domain health status evidence', () => {
  it.each(cases)('announces %s with truthful non-green status semantics', (status, token) => {
    const domain: DomainHealthData = {
      id: status, name: status, nameEn: status, endpointCount: 1,
      status, latencyMs: null, successRate: null, sampleEndpoints: [],
    };
    render(<AdminApiDomainGrid domains={[domain]} isEn />);
    const badge = screen.getByLabelText(`Domain status: ${status}`);
    expect(badge.className).toContain(token);
    if (status !== 'OPERATIONAL') expect(badge.className).not.toContain('emerald');
    expect(screen.getAllByText('Not measured')).toHaveLength(2);
  });
  it('provides a Korean status announcement to assistive technology', () => {
    const domain: DomainHealthData = {
      id: 'unknown', name: '알 수 없음', nameEn: 'Unknown',
      endpointCount: 1, status: 'UNKNOWN', latencyMs: null,
      successRate: null, sampleEndpoints: [],
    };
    render(<AdminApiDomainGrid domains={[domain]} isEn={false} />);
    expect(screen.getByLabelText('도메인 상태: UNKNOWN')).toBeTruthy();
  });
});
