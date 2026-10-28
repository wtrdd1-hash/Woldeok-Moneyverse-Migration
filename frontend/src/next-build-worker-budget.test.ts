import { describe, expect, it } from 'vitest';
import config from '../next.config';

describe('small host build reliability', () => {
  it('caps Next.js prerender workers to avoid SIGABRT on the 8 GiB Debian host', () => {
    expect(config.experimental?.cpus).toBe(2);
  });
});
