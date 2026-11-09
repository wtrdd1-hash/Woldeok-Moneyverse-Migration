// @vitest-environment node
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('blog routes survive production Next build redirect configuration',()=>{
  it('does not send editorial articles or the blog sitemap to tools',()=>{
    const nextConfig=readFileSync(path.join(process.cwd(),'next.config.ts'),'utf8');
    expect(nextConfig).not.toMatch(/source:\s*['"]\/blog['"],\s*destination:\s*['"]\/tools/);
    expect(nextConfig).not.toMatch(/source:\s*['"]\/blog\/:path\*['"],\s*destination:/);
    expect(nextConfig).not.toMatch(/source:\s*['"]\/sitemap-blog\.xml['"],\s*destination:/);
  });
});
