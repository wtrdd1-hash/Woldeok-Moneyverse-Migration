import { describe, expect, it } from 'vitest';
import { metadata, dynamic } from './page';

describe('member business holdings privacy and discoverability', () => {
  it('keeps authenticated member business pages dynamic and non-indexable', () => {
    expect(dynamic).toBe('force-dynamic');
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });
});
