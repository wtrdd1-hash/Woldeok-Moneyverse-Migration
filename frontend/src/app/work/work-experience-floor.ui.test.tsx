import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CareerTasksBoard } from './career-tasks-board';

vi.mock('./actions', () => ({ switchJobAction: vi.fn() }));
vi.mock('./work-forms', () => ({ TakeButton: () => null }));
vi.mock('@/components/locale-provider', () => ({ useLocale: () => ({ locale: 'ko' }) }));
afterEach(cleanup);

describe('member work minimum preview EXP accessible UI', () => {
  it('renders a labelled GET selector with explicit presets and reset', () => {
    const { container } = render(<CareerTasksBoard tasks={[]} selectedMinExperience="50" />);
    const select = screen.getByLabelText('최소 예상 경험치(EXP)') as HTMLSelectElement;
    expect(select.name).toBe('minExperience');
    expect(select.value).toBe('50');
    expect(Array.from(select.options).map((option) => option.value)).toEqual(['', '10', '25', '50', '100', '250', '500']);
    expect(container.querySelector('form[action="/work"][method="get"]')).not.toBeNull();
    expect(screen.getByRole('link', { name: '서버 필터 초기화' }).getAttribute('href')).toBe('/work');
    expect(screen.getByText('선택한 조건에 맞는 업무가 없어요.')).toBeDefined();
  });
});
