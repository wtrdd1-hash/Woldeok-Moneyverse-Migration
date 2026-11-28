import { describe, expect, it } from 'vitest';
import { copyProblems } from '@/lib/copy';
import { COPY } from './copy';

describe('page copy', () => {
  it('is complete in all five locales', () => {
    expect(copyProblems(COPY)).toEqual([]);
  });
});
