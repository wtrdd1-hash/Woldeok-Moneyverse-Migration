import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const layoutSource = readFileSync(resolve(here, 'layout.tsx'), 'utf8');
const bootstrapVendor = resolve(here, '../styles/vendor/bootstrap-5.3.8.min.css');

describe('global style isolation', () => {
  it('keeps the downloaded Bootstrap asset without globally importing it', () => {
    expect(existsSync(bootstrapVendor)).toBe(true);
    expect(layoutSource).not.toMatch(/import\s+['"][^'"]*bootstrap[^'"]*\.css['"]/i);
  });

  it('loads product styles in their intended order', () => {
    const globalIndex = layoutSource.indexOf("import './globals.css'");
    const cosmeticsIndex = layoutSource.indexOf("import './cosmetics.css'");
    expect(globalIndex).toBeGreaterThan(-1);
    expect(cosmeticsIndex).toBeGreaterThan(globalIndex);
  });
});
