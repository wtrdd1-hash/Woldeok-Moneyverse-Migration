import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const tower = readFileSync(new URL('./fx-control-tower.tsx', import.meta.url), 'utf8');
const page = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8');
const actionsUrl = new URL('./actions.ts', import.meta.url);

describe('FX administrator browser boundary', () => {
  it('never fetches privileged FX API paths directly from the browser', () => {
    expect(tower).not.toMatch(/fetch\s*\(\s*['"` ]\/api\/v1\/admin\/fx\//);
    expect(tower).toContain("from './actions'");
  });

  it('unwraps the FX status API envelope in a server-only action', () => {
    const actions = readFileSync(actionsUrl, 'utf8');
    expect(actions).toContain("'use server'");
    expect(actions).toContain('requireAdminConsole');
    expect(actions).toContain("'/api/v1/admin/fx/status'");
    expect(actions).toContain('payload.data');
    expect(page).not.toContain("api<FxStatusData>");
  });

  it('uses CSRF-protected server mutations for all four FX writes', () => {
    const actions = readFileSync(actionsUrl, 'utf8');
    for (const path of ['intervene', 'swaps/drawdown', 'forward/settle', 'halt']) {
      expect(actions).toContain(`'/api/v1/admin/fx/${path}'`);
    }
    expect(actions).toContain('mutate<');
    expect(tower).not.toContain('result.success');
  });
});
