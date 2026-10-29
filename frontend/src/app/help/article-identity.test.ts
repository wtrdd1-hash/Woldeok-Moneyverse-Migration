import { describe, expect, it } from 'vitest';
import { requireHelpPublicationIdentity } from './article-identity';

const valid = {
  published_revision_id: '11111111-2222-4333-8444-555555555555',
  article_version: '9007199254740993',
  content_digest: 'a'.repeat(64),
};

describe('published help edition identity', () => {
  it('preserves the exact integer-string version and digest', () => {
    expect(requireHelpPublicationIdentity(valid)).toEqual(valid);
  });
  it.each([
    {},
    { ...valid, published_revision_id: 'not-a-uuid' },
    { ...valid, article_version: 1 },
    { ...valid, article_version: '0' },
    { ...valid, article_version: '01' },
    { ...valid, content_digest: 'a'.repeat(63) },
    { ...valid, content_digest: 'F'.repeat(64) },
  ])('fails closed when edition proof is missing or malformed', (value) => {
    expect(() => requireHelpPublicationIdentity(value)).toThrow('publication identity unavailable');
  });
});
