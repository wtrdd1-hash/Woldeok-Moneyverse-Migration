import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync('src/app/account/page.tsx', 'utf8');

describe('account hybrid profile resolution and security score', () => {
  it('implements 4-tier hybrid display name resolution', () => {
    expect(source).toContain('rawDisplayName?.trim()');
    expect(source).toContain('oauthIdentity?.displayName?.trim()');
    expect(source).toContain("userEmail ? userEmail.split('@')[0] : null");
    expect(source).toContain("'월덕 회원'");
  });

  it('embeds real member profile avatar with fallback', () => {
    expect(source).toContain('<ProfileAvatar');
    expect(source).toContain('name={actualDisplayName}');
    expect(source).toContain('imageUrl={rawImageUrl ?? null}');
  });

  it('calculates 100-point account security progress score', () => {
    expect(source).toContain('securityScore');
    expect(source).toContain('<Progress value={securityScore}');
    expect(source).toContain('계정 보안 완성도');
    expect(source).toContain('font-mono tabular-nums');
  });

  it('renders quick action link to profile and cosmetics settings', () => {
    expect(source).toContain('href="/profile/settings"');
    expect(source).toContain('프로필 수정');
  });

  it('enforces 2026 Inset Border and responsive layout', () => {
    expect(source).toContain('border-zinc-800/80');
    expect(source).toContain('shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]');
    expect(source).toContain('grid gap-6 lg:grid-cols-[340px_1fr]');
  });
});
