import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('repeatable work completion feedback', () => {
  const source = readFileSync(join(__dirname, 'work-forms.tsx'), 'utf8');

  it('creates a fresh server-action state for every modal cycle', () => {
    expect(source).toContain('const [cycle, setCycle] = useState(0);');
    expect(source).toContain('setCycle((value) => value + 1);');
    expect(source).toContain('<TaskCompletionPanel key={cycle} task={task} onClose={close} />');
  });

  it('does not manufacture client-only completion signals', () => {
    expect(source).not.toContain('setCombo');
    expect(source).not.toContain('COMBO STREAK');
    expect(source).not.toContain('연속 완수 피버');
    expect(source).not.toContain('블록체인·원장 검증');
    expect(source).not.toContain('네트워크 핑 손실');
  });
});
