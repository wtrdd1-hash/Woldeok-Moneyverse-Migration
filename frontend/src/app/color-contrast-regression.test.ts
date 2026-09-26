import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const APP = path.dirname(fileURLToPath(import.meta.url));
const redesign = fs.readFileSync(path.join(APP, 'redesign.css'), 'utf8');

function block(selector: string) {
  const escaped = selector.replace(/[.*+?^{}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(escaped + '\\s*\\{([\\s\\S]*?)\\n\\}');
  const match = redesign.match(pattern);
  if (!match?.[1]) throw new Error('Missing CSS block: ' + selector);
  return match[1];
}

function token(css: string, name: string) {
  const match = css.match(new RegExp('--' + name + ':\\s*(#[0-9a-fA-F]{6})'));
  if (!match?.[1]) throw new Error('Missing hex token: --' + name);
  return match[1];
}

function luminance(hex: string) {
  const values = [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16) / 255);
  const linear = values.map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!;
}

function contrast(first: string, second: string) {
  const [light, dark] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (light! + 0.05) / (dark! + 0.05);
}

function expectNormalTextAA(foreground: string, background: string) {
  expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
}

describe('frontend rebuild contrast contract', () => {
  it.each([
    [':root', 'light'],
    ['.dark', 'dark'],
  ])('%s keeps normal text at WCAG AA contrast', (selector) => {
    const css = block(selector);
    const background = token(css, 'mv-bg');
    const card = token(css, 'mv-surface-raised');

    for (const foregroundName of ['mv-ink', 'mv-ink-2', 'mv-ink-3', 'mv-accent']) {
      const foreground = token(css, foregroundName);
      expectNormalTextAA(foreground, background);
      expectNormalTextAA(foreground, card);
    }
  });

  it('does not hard-code a light header/footer that breaks dark theme text', () => {
    expect(redesign).toContain(
      'background: color-mix(in srgb, var(--mv-surface) 96%, transparent) !important;',
    );
    expect(redesign).toContain('background: var(--mv-surface-strong) !important;');
    expect(redesign).not.toContain('background: rgb(251 250 247 / 0.96) !important;');
    expect(redesign).not.toContain('background: #e9e5db !important;');
  });

  it('keeps the home status panel on semantic theme colors', () => {
    const source = fs.readFileSync(path.join(APP, 'page.tsx'), 'utf8');
    expect(source).not.toContain('text-white');
    expect(source).not.toContain('bg-white/[0.06]');
    expect(source).toContain('text-muted-foreground');
  });

  it('does not use known low-contrast light-theme shop label shades', () => {
    const source = fs.readFileSync(path.join(APP, 'shop/shop-store-view.tsx'), 'utf8');
    expect(source).not.toMatch(/text-(red|amber|purple|blue|emerald|zinc)-400/);
  });
});
