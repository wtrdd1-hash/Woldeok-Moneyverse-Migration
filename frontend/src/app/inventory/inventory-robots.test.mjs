import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8');
test('member inventory route explicitly opts out of indexing and following', () => {
  const block = source.match(/export const metadata: Metadata = \{([\s\S]*?)\n\};/);
  assert.ok(block, 'inventory page metadata exists');
  assert.match(block[1], /robots:\s*\{\s*index:\s*false,\s*follow:\s*false\s*\}/);
});
