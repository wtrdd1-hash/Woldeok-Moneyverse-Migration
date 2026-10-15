import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

it('forces React 19 development test implementation even on a production-configured host', () => {
  const { scripts } = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as { scripts: Record<string, string> };
  expect(scripts.test).toContain('NODE_ENV=test');
});
