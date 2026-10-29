// @vitest-environment node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
const source = readFileSync(fileURLToPath(new URL('./p2p-transfer-modal.tsx', import.meta.url)), 'utf8');
describe('P2P recipient privacy and usable exact-ID transfer', () => {
  it('uses explicit UUID entry instead of nickname enumeration', () => {
    expect(source).not.toContain('/api/transfers/search');
    expect(source).not.toContain('searchResults.map');
    expect(source).toContain('recipientUserId');
    expect(source).toContain('UUID');
    expect(source).not.toContain('Math.random().toString(36)');
    expect(source).not.toContain('Ledger transaction ID verified.');
  });
});
