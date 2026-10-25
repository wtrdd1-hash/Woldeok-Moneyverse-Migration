import { describe, expect, it } from 'vitest';
import { appGatewayPath } from '@/lib/app-gateway';

describe('Android public lottery rounds contract', () => {
  it('maps only the bounded GET resource into the internal API namespace', () => {
    expect(appGatewayPath(['lottery', 'rounds'])).toBe('/api/v1/lottery/rounds');
  });
});
