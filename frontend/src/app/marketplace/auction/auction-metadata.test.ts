import { describe, expect, it } from 'vitest';
import { metadata } from './layout';

describe('auction preview SEO', () => {
  it('prevents indexing the preview and authenticated live auction state', () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
