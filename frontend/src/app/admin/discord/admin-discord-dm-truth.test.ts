import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
const page = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8');
const button = readFileSync(new URL('./admin-discord-dm-test-button.tsx', import.meta.url), 'utf8');

describe('admin Discord DM test configuration and accessibility', () => {
  it('never assumes a missing server configuration is active or substitutes a recipient ID', () => {
    expect(page).not.toContain("|| '886478189520637992'");
    expect(page).not.toContain('configured ?? true');
    expect(page).toContain('configured={isConfigured}');
    expect(page).toContain('봇 토큰 설정됨');
  });
  it('blocks test delivery without confirmed configuration and labels simulated events', () => {
    expect(button).toContain('disabled={loading || !configured}');
    expect(button).toContain('모의');
    expect(button).toContain('min-h-11');
    expect(button).toContain('aria-pressed={isSelected}');
  });
});
