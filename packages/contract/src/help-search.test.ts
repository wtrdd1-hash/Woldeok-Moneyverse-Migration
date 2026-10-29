import { describe, expect, it } from 'vitest';
import { normalizeVerifiedHelpQuery } from './help-search';

describe('verified help search input normalization', () => {
  it('trims and collapses Unicode whitespace without rewriting content', () => {
    expect(normalizeVerifiedHelpQuery('  로그인\u00a0\t 도움말  ')).toBe('로그인 도움말');
    expect(normalizeVerifiedHelpQuery('  Foo  BAR  ')).toBe('Foo BAR');
  });
  it('keeps a whitespace-only query as approved-category browse', () => {
    expect(normalizeVerifiedHelpQuery(' \n\t ')).toBe('');
  });
  it('rejects non-string and oversized raw Unicode input before collapsing', () => {
    expect(normalizeVerifiedHelpQuery(' '.repeat(101))).toBeNull();
    expect(normalizeVerifiedHelpQuery('😀'.repeat(101))).toBeNull();
    expect(normalizeVerifiedHelpQuery({})).toBeNull();
  });
});
