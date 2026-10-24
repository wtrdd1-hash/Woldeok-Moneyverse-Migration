import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const dashboard = readFileSync('src/app/admin/api-health/api-health-dashboard.tsx', 'utf8');
const page = readFileSync('src/app/admin/api-health/page.tsx', 'utf8');

describe('admin health display evidence', () => {
  it('uses the same-origin admin read bridge and no unsupported direct browser API calls', () => {
    expect(dashboard).toContain("fetch('/api/admin/api-health'");
    expect(dashboard).not.toContain("fetch('/api/v1/admin/");
  });

  it('never invents domain success, latencies, or backup verification', () => {
    expect(dashboard).not.toMatch(/\?\?\s*(?:8|14|99\.9|100\.0)/);
    expect(dashboard).not.toContain('100% 정상 가동');
    expect(dashboard).not.toContain('Zero Error Rate');
    expect(dashboard).not.toContain('즉시 백업 실행');
    expect(page).not.toContain('300+ REST API');
  });

  it('renders refresh failures as unavailable and exposes a live status region', () => {
    expect(dashboard).toContain('aria-live="polite"');
    expect(dashboard).toContain('setData(null)');
  });
});
