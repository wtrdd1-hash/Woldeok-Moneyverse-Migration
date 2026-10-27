// @vitest-environment node
import fs from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { publishBlogPost } from './blog-data';
import type { BlogPost } from './blog.types';

describe('blog publication helper cannot bypass editorial review', () => {
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

  it('refuses unreviewed production publication before reading or writing disk', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const read = vi.spyOn(fs, 'readFileSync');
    const write = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    vi.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);
    expect(() => publishBlogPost({ slug: 'unreviewed' } as BlogPost)).toThrow('EDITORIAL_REVIEW_REQUIRED');
    expect(read).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
  });
});
