import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
const cfg = readFileSync('../frontend/next.config.ts', 'utf8');
describe('known broken legacy public paths', () => {
  it.each(['/auth/register', '/business', '/attendance', '/career-guide', '/guide/getting-started', '/pet'])(
    'redirects %s to a valid public route', path => {
      expect(cfg).toContain("source: '" + path + "'");
    },
  );
});
