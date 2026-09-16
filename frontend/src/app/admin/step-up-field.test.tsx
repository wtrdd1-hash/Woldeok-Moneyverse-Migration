import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StepUpField } from './step-up-field';

describe('StepUpField', () => {
  it('keeps recovery guidance without a retired authenticator code field', () => {
    const { container } = render(<StepUpField id="feature" undo="restore the previous value" />);
    expect(container.querySelector('input[name="code"]')).toBeNull();
    expect(container.textContent).toContain('되돌리기');
  });
});
