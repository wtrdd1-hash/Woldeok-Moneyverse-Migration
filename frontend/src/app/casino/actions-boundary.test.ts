import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ACTIONS_SOURCE = readFileSync(resolve(process.cwd(), 'src/app/casino/actions.ts'), 'utf8');

describe('casino server-action module boundary', () => {
  it('exports only async server actions at runtime', () => {
    expect(ACTIONS_SOURCE).not.toMatch(/export\s+(?:const|let|var|class)\s+/);
    expect(ACTIONS_SOURCE).not.toMatch(/export\s*\{/);

    const runtimeFunctionExports = [
      ...ACTIONS_SOURCE.matchAll(/export\s+(async\s+)?function\s+(\w+)/g),
    ];
    expect(runtimeFunctionExports.length).toBeGreaterThan(0);
    for (const [, asyncKeyword, name] of runtimeFunctionExports) {
      expect(asyncKeyword, `${name} must stay async in a use-server file`).toBe('async ');
    }
  });

  it('serializes casino stakes as JSON numbers required by the backend DTO', () => {
    expect(
      ACTIONS_SOURCE.match(/const stake = wholeNumber\(formData\.get\('stake'\)\);/g),
    ).toHaveLength(2);
    expect(ACTIONS_SOURCE).not.toContain("wholeAmount(formData.get('stake'))");
  });

  it('keeps client initial state outside the use-server module', () => {
    expect(ACTIONS_SOURCE).not.toContain('CASINO_IDLE');
  });
});
