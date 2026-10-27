import { describe, expect, it } from 'vitest';
import { publicationIsVerified } from './help-article-live';

describe('verified help client navigation identity fence', () => {
  it('never carries a previously verified article state to a new publication identity', () => {
    const previouslyVerified = { identity: 'ko:a1:revision1', status: 'current' } as const;
    expect(publicationIsVerified(previouslyVerified, 'ko:a1:revision1')).toBe(true);
    expect(publicationIsVerified(previouslyVerified, 'ko:a2:revision1')).toBe(false);
    expect(publicationIsVerified(previouslyVerified, 'en:a1:revision1')).toBe(false);
    expect(publicationIsVerified({ identity: 'ko:a2:revision1', status: 'checking' }, 'ko:a2:revision1')).toBe(false);
  });
});
