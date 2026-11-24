import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const APP = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(APP, '..');
const read = (rel: string) => fs.readFileSync(path.join(SRC, rel), 'utf8');

const redesign = read('app/redesign.css');

describe('v12 navy/violet shell', () => {
  // globals.css gives each locale its own --primary under
  // `:root[data-locale="…"]`, which out-ranks a bare `:root`. Without a
  // re-point at equal specificity later in the cascade, the brand colour
  // would silently differ per language.
  it('re-points locale brand overrides to the shared accent token', () => {
    const match = redesign.match(/:root\[data-locale\]\s*\{([\s\S]*?)\n\}/);
    expect(match?.[1]).toBeDefined();
    const body = match![1]!;
    expect(body).toMatch(/--primary:\s*var\(--mv-accent\)/);
    expect(body).toMatch(/--accent:\s*var\(--mv-accent-soft\)/);
    expect(body).toMatch(/--ring:/);
  });

  // Rise/fall colours are a market convention per locale (KO red-up, EN
  // green-up). They carry meaning, not brand, so the re-point must leave them.
  it('keeps per-locale rise/fall colours untouched', () => {
    const match = redesign.match(/:root\[data-locale\]\s*\{([\s\S]*?)\n\}/);
    expect(match![1]).not.toMatch(/--rise|--fall/);
  });

  it('uses a navy ground and a violet accent in both themes', () => {
    const hex = (selector: string, name: string) => {
      const block = redesign.match(new RegExp(selector.replace('.', '\\.') + '\\s*\\{([\\s\\S]*?)\\n\\}'))![1]!;
      return block.match(new RegExp('--' + name + ':\\s*(#[0-9a-fA-F]{6})'))![1]!;
    };
    const rgb = (h: string) => [1, 3, 5].map((i) => Number.parseInt(h.slice(i, i + 2), 16)) as [number, number, number];

    for (const selector of [':root', '.dark']) {
      const [r, g, b] = rgb(hex(selector, 'mv-accent'));
      expect(b, `${selector} accent is violet`).toBeGreaterThan(g);
      expect(r, `${selector} accent is violet`).toBeGreaterThan(g);
    }
    const [r, g, b] = rgb(hex('.dark', 'mv-bg'));
    expect(b, 'dark ground is navy').toBeGreaterThan(r + 15);
    expect(b, 'dark ground is navy').toBeGreaterThan(g + 10);
  });

  it.each([
    'components/site-shell.tsx',
    'components/site-header.tsx',
    'components/mobile-bottom-nav.tsx',
  ])('%s takes its ground from theme tokens, not hard-coded hex', (file) => {
    const source = read(file);
    expect(source).not.toMatch(/bg-\[#[0-9a-fA-F]{6}\]/);
    expect(source).not.toMatch(/dark:bg-\[#/);
  });

  it('site-header uses SVG icons instead of emoji glyphs', () => {
    const source = read('components/site-header.tsx');
    expect(source).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});
