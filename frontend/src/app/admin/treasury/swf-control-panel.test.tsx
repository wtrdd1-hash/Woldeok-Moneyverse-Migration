import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SwfControlPanel } from './swf-control-panel';

describe('SWF release hold user flow', () => {
  it('explains the hold and disables all three finance mutations', () => {
    render(<SwfControlPanel initialPortfolios={[]} initialEvents={[]} />);
    expect(screen.getByRole('status').textContent).toContain('일시 중단');
    for (const label of [/정책 설정 저장/, /주식 자금 즉시 회수/, /즉시 복리 성장 트리거/]) {
      expect(screen.getByRole('button', { name: label }).hasAttribute('disabled')).toBe(true);
    }
  });
});
