import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatRow, StateBox } from './primitives';

/** DESIGN180 shared primitives (plan task 4). */
describe('StatRow', () => {
  it('renders each cell label, value and note', () => {
    render(<StatRow items={[{ label: '사용 가능 잔액', value: '128,450 WLD', note: '원장 기준' }]} />);
    expect(screen.getByText('사용 가능 잔액')).toBeDefined();
    expect(screen.getByText('128,450 WLD')).toBeDefined();
    expect(screen.getByText('원장 기준')).toBeDefined();
  });

  it('says 확인 불가 for a missing value instead of inventing one', () => {
    render(<StatRow items={[{ label: '기준금리', value: null }]} />);
    expect(screen.getByText('확인 불가')).toBeDefined();
    expect(screen.queryByText('0')).toBeNull();
  });

  it('is a labelled list for assistive technology', () => {
    render(<StatRow label="오늘의 요약" items={[{ label: 'a', value: '1' }, { label: 'b', value: '2' }]} />);
    expect(screen.getByRole('list', { name: '오늘의 요약' }).querySelectorAll('li')).toHaveLength(2);
  });
});

describe('StateBox', () => {
  it.each(['empty', 'error', 'expired', 'forbidden', 'unavailable'] as const)('renders the %s state with its title and one action', (kind) => {
    render(<StateBox kind={kind} title="제목" action={<a href="/x">다시 시도</a>}>설명</StateBox>);
    const box = screen.getByRole(kind === 'error' ? 'alert' : 'status');
    expect(box.textContent).toContain('제목');
    expect(box.textContent).toContain('설명');
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });
});
