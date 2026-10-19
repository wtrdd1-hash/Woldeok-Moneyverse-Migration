import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const app = (p: string) => readFileSync(join(__dirname, p), 'utf8');

describe('v921 first qualified experience before signup', () => {
  const source = app('page.tsx');

  it('puts existing public tools and a four-language guest entry above the financial cockpit', () => {
    expect(source).toContain("import { GuestQuickstart } from '@/components/guest-quickstart'");
    expect(source).toContain('<GuestQuickstart locale={locale} />');
    expect(source.indexOf('<GuestQuickstart locale={locale} />'))
      .toBeLessThan(source.indexOf('aria-labelledby="hero-balance-heading"'));
  });

  it('does not describe static demo financial values as real-time account observations', () => {
    expect(source).not.toContain('100% 무손실 원장 보호');
    expect(source).not.toContain('179,460,000 KRW');
    expect(source).not.toContain('₩179,460,000 KRW');
    expect(source).not.toContain('+4.8% 24h');
    expect(source).toContain('자산 구성 예시');
  });

  it('does not promise unverified WLD signup rewards in the sticky conversion bar', () => {
    const bar = readFileSync(join(__dirname, '../components/tools-guest-conversion-bar.tsx'), 'utf8');
    expect(bar).not.toContain('신규 10,000 WLD 무료');
    expect(bar).toContain('계정 저장 가능 여부');
  });
});
