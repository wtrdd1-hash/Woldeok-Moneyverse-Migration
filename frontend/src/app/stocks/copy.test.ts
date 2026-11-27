import { describe, expect, it } from 'vitest';
import { copyProblems } from '@/lib/copy';
import { COPY } from './copy';

describe('page copy', () => {
  it('has every locale filled and no Korean outside the Korean column', () => {
    expect(copyProblems(COPY)).toEqual([]);
  });
});
