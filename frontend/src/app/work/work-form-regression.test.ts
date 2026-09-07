import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('repeatable work completion feedback', () => {
  const source = readFileSync(join(__dirname, 'work-forms.tsx'), 'utf8');
  const actionSource = readFileSync(join(__dirname, 'actions.ts'), 'utf8');

  it('creates a fresh modal cycle and one stable idempotency key per opening', () => {
    expect(source).toContain('const [cycle, setCycle] = useState(0);');
    expect(source).toContain("const [requestKey, setRequestKey] = useState('');");
    expect(source).toContain('setRequestKey(crypto.randomUUID());');
    expect(source).toContain('name="idempotencyKey" value={requestKey}');
    expect(source).toContain('requestKey={requestKey}');
  });

  it('bounds a slow request and lets the same key be retried instead of spinning forever', () => {
    expect(actionSource).toContain("const key = id(formData, 'idempotencyKey');");
    expect(actionSource).toContain('timeoutMs: 8_000');
    expect(actionSource).not.toContain('const key = idempotencyKey();');
    expect(source).toContain('const [state, action, pending] = useActionState');
    expect(source).toContain('setSlow(true)');
    expect(source).toContain('disabled={pending}');
  });

  it('does not manufacture client-only completion signals', () => {
    expect(source).not.toContain('setCombo');
    expect(source).not.toContain('COMBO STREAK');
    expect(source).not.toContain('연속 완수 피버');
    expect(source).not.toContain('블록체인·원장 검증');
    expect(source).not.toContain('네트워크 핑 손실');
  });
});
