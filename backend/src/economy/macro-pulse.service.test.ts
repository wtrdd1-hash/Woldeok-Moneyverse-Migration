import { describe, expect, it } from 'vitest';
import { MacroPulseService } from './macro-pulse.service';

describe('macro pulse public provenance contract', () => {
  it('marks generated macro values as educational simulations rather than live market quotes', () => {
    const pulse = new MacroPulseService().getMacroPulse();
    expect(pulse).toMatchObject({
      dataMode: 'SIMULATED_EDUCATIONAL',
      source: 'INTERNAL_DETERMINISTIC_SCENARIO',
    });
    expect(pulse.domestic.length).toBeGreaterThan(0);
    expect(pulse.global.length).toBeGreaterThan(0);
  });
});
