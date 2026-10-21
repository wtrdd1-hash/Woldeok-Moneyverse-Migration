import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiHealthDashboard, type ApiHealthResponse } from './api-health-dashboard';

afterEach(() => vi.unstubAllGlobals());

describe('administrator API health evidence', () => {
  it('does not present unmeasured values as success', () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    render(<ApiHealthDashboard initialData={null} isEn />);
    expect(screen.queryByText('100.0%')).toBeNull();
    expect(screen.queryByText('8ms')).toBeNull();
    expect(screen.getAllByText('Not measured').length).toBeGreaterThan(0);
  });

  it('clears stale data and announces refresh failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    const initialData = {
      status: 'UNKNOWN', serverTime: new Date().toISOString(), uptimeSeconds: 1,
      totalDomains: 0, totalEndpoints: 0, averageLatencyMs: 12,
      globalSuccessRate: 77, domains: [],
    } as ApiHealthResponse;
    render(<ApiHealthDashboard initialData={initialData} isEn />);
    expect(screen.getByText('77.0%')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined();
      expect(screen.queryByText('77.0%')).toBeNull();
    });
  });
});
