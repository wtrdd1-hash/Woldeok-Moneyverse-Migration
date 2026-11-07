import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { ipBlockGate } from './ip-block.middleware';

describe('ipBlockGate database failure isolation', () => {
  it('continues once even if the optional failure observer throws', async () => {
    const pool = { query: vi.fn().mockRejectedValue(new Error('database unavailable')) };
    const next = vi.fn();
    const gate = ipBlockGate({
      pool,
      trustForwardedFor: false,
      onFailure: () => { throw new Error('telemetry unavailable'); },
    });
    gate({ method: 'GET', originalUrl: '/api/v1/wallet', headers: {}, socket: { remoteAddress: '203.0.113.20' } } as unknown as Request, {} as Response, next);
    await vi.waitFor(() => expect(next).toHaveBeenCalledTimes(1));
  });
});
