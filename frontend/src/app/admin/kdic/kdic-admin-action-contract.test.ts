import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const controller = readFileSync(new URL('./kdic-control-tower.tsx', import.meta.url), 'utf8');
const actions = readFileSync(new URL('./actions.ts', import.meta.url), 'utf8');

describe('KDIC privileged frontend transport', () => {
  it('keeps internal admin API and CSRF tokens on the server', () => {
    expect(actions).toContain("'use server'");
    expect(actions).toContain("from '@/lib/mutate'");
    expect(actions).toContain('mutate<');
    expect(controller).not.toMatch(/fetch\(['"]\/api\/v1\/admin\/kdic\//);
  });

  it('routes all three money-moving operations through server actions', () => {
    expect(actions).toContain("'/api/v1/admin/kdic/assess-premiums'");
    expect(actions).toContain("'/api/v1/admin/kdic/liquidity-loan'");
    expect(actions).toContain("'/api/v1/admin/kdic/payout'");
    expect(controller).toContain('assessKdicPremiums(');
    expect(controller).toContain('injectKdicLiquidity(');
    expect(controller).toContain('executeKdicPayout(');
  });
});
