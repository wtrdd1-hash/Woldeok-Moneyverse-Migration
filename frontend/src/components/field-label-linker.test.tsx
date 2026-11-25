import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { linkFieldLabels } from './field-label-linker';

/**
 * Live audit 2026-11-25 (axe "label", 19 calculator pages): inputs sat next to
 * a <label data-slot="label"> in the same field group but were never tied to
 * it, so a screen reader announced an unnamed number box.
 */
describe('linkFieldLabels', () => {
  it('names an unlabeled input after the label in its field group', () => {
    const { container } = render(
      <main>
        <div className="space-y-1.5">
          <label data-slot="label">초기 예치 원금</label>
          <div><span>₩</span><input type="number" /></div>
        </div>
      </main>,
    );
    linkFieldLabels(container);
    const input = container.querySelector('input')!;
    const id = input.getAttribute('aria-labelledby')!;
    expect(container.ownerDocument.getElementById(id)!.textContent).toBe('초기 예치 원금');
  });
  it('leaves an input that already has a name alone', () => {
    const { container } = render(<main><div><label data-slot="label">A</label><input aria-label="B" /></div></main>);
    linkFieldLabels(container);
    expect(container.querySelector('input')!.hasAttribute('aria-labelledby')).toBe(false);
  });
  it('does not guess when a group holds several labels and inputs', () => {
    const { container } = render(<main><div><label data-slot="label">A</label><label data-slot="label">B</label><input /><input /></div></main>);
    linkFieldLabels(container);
    expect(container.querySelectorAll('[aria-labelledby]').length).toBe(0);
  });
});
