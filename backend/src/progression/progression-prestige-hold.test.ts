import { describe, expect, it } from 'vitest';
import { ProgressionController } from './progression.controller';

const ACTOR = '00000000-0000-4000-8000-000000000001';
const request = { session: { user_id: ACTOR } };

describe('prestige ledger gate', () => {
  it('never reports an unverified prestige status as a success', () => {
    const controller = new ProgressionController(null, null);
    expect(() => controller.prestigeStatus(request as never)).toThrow();
    try { controller.prestigeStatus(request as never); } catch (error) {
      expect((error as { getStatus: () => number }).getStatus()).toBe(503);
    }
  });

  it('refuses a rebirth without touching a repository or ledger', () => {
    const controller = new ProgressionController(null, null);
    expect(() => controller.prestigeRebirth(request as never)).toThrow();
    try { controller.prestigeRebirth(request as never); } catch (error) {
      expect((error as { getStatus: () => number }).getStatus()).toBe(503);
    }
  });
});
