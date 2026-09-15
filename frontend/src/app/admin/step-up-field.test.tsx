import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StepUpField } from './step-up-field';

describe('StepUpField', () => {
  it('renders a fresh authenticator code field for high-risk operator changes', () => {
    const { container } = render(<StepUpField id="feature" undo="restore the previous value" />);
    expect(container.querySelector('input[name="code"]')).not.toBeNull();
    expect(container.textContent).toContain('되돌리기');
  });
});
