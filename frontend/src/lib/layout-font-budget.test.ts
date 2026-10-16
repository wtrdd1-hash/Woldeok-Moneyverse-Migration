import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const layoutSource = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');

/** CJK font shards should be demand-loaded, not all injected as preload links. */
describe('global font preload budget', () => {
  it.each([['Nanum_Myeongjo', 'myeongjo'], ['Noto_Sans_KR', 'notoKr']])(
    'does not eagerly preload every CJK shard for %s', (font, variable) => {
      const start = layoutSource.indexOf(`const ${variable} = ${font}({`);
      expect(start, `Missing ${font} declaration`).toBeGreaterThanOrEqual(0);
      const declarationSource = layoutSource.slice(start, layoutSource.indexOf('});', start) + 3);
      expect(declarationSource).toMatch(/preload:\s*false/);
    },
  );
});
