import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('repeatable work completion feedback', () => {
  const source = readFileSync(join(__dirname, 'work-forms.tsx'), 'utf8');

  it('handles each server action result exactly once', () => {
    expect(source).toContain('if (state === handledStateRef.current) return;');
    expect(source).toContain('handledStateRef.current = state;');
  });

  it('does not manufacture an ever-increasing client-only streak', () => {
    expect(source).not.toContain('setCombo');
    expect(source).not.toContain('COMBO STREAK');
    expect(source).not.toContain('연속 완수 피버');
  });
});
