import { describe, expect, it } from 'vitest';
import { metadata } from './layout';

describe('private inventory search indexing', () => {
  it('prevents indexing and following links on personal inventory', () => {
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });
});
