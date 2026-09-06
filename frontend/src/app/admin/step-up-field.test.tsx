import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StepUpField } from './step-up-field';

describe('StepUpField', () => {
  it('does not render an authenticator prompt for operator changes', () => {
    const { container } = render(<StepUpField id="feature" undo="restore the previous value" />);
    expect(container.innerHTML).toBe('');
  });
});
