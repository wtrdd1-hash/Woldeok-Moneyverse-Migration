import { describe, expect, it } from 'vitest';
import { ApiHealthController } from './api-health.controller';

describe('admin API health measurement provenance', () => {
  it('does not claim per-domain synthetic latency and uptime are measured', async () => {
    const result = await new ApiHealthController(null).getApiHealthStatus();
    expect(result.domainMetricsMeasured).toBe(false);
    expect(result.domainMetricsSource).toBe('CONFIGURED_ENDPOINT_INVENTORY');
    expect(result.domains.length).toBeGreaterThan(0);
  });
});
