import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
vi.mock('./actions', () => ({ switchJobAction: vi.fn() }));
vi.mock('./work-forms', () => ({ TakeButton: () => null }));
vi.mock('@/components/locale-provider', () => ({ useLocale: () => ({ locale: 'ko' }) }));
import { CareerTasksBoard } from './career-tasks-board';

describe('work difficulty filter accessibility', () => {
  it('renders an accessible, keyboard-submittable difficulty filter with selected value', () => {
    const { container } = render(<CareerTasksBoard tasks={[]} selectedDifficulty="3" />);
    const select = screen.getByLabelText('업무 난이도') as HTMLSelectElement;
    expect(select.name).toBe('difficulty');
    expect(select.value).toBe('3');
    expect(select.options).toHaveLength(6);
    expect(container.querySelector('form[action="/work"][method="get"]')).not.toBeNull();
    expect(screen.getByRole('button', { name: '적용' })).toBeDefined();
    expect(screen.getByText('검색 조건에 맞는 업무가 없어요.')).toBeDefined();
  });

  it('defaults to the unfiltered task list', () => {
    render(<CareerTasksBoard tasks={[]} selectedDifficulty={null} />);
    expect((screen.getByLabelText('업무 난이도') as HTMLSelectElement).value).toBe('');
  });
});
