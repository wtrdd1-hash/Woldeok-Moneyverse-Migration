import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CareerTasksBoard } from './career-tasks-board';

vi.mock('./actions', () => ({ switchJobAction: vi.fn() }));
vi.mock('./work-forms', () => ({ TakeButton: () => null }));
vi.mock('@/components/locale-provider', () => ({ useLocale: () => ({ locale: 'ko' }) }));
afterEach(cleanup);

describe('member work duration filter UI', () => {
  it('renders a labelled GET selector with stable presets and explicit reset', () => {
    const { container } = render(
      <CareerTasksBoard tasks={[]} selectedMaxDuration="300" selectedMaxReward="500" />,
    );
    const select = screen.getByLabelText('최대 업무 수행시간') as HTMLSelectElement;
    expect(select.name).toBe('maxDurationSeconds');
    expect(select.value).toBe('300');
    expect(Array.from(select.options).map((option) => option.value)).toEqual([
      '',
      '60',
      '120',
      '180',
      '300',
      '600',
      '900',
    ]);
    expect(container.querySelector('form[action="/work"][method="get"]')).not.toBeNull();
    expect(screen.getByRole('button', { name: '적용' })).toBeDefined();
    expect(screen.getByRole('link', { name: '서버 필터 초기화' }).getAttribute('href')).toBe(
      '/work',
    );
    const reward = screen.getByLabelText('최대 예상 WLD 보상') as HTMLSelectElement;
    expect(reward.name).toBe('maxReward');
    expect(reward.value).toBe('500');
    expect(Array.from(reward.options).map((option) => option.value)).toEqual([
      '',
      '100',
      '200',
      '500',
      '1000',
      '2000',
      '5000',
      '10000',
    ]);
    expect(screen.getByText('선택한 조건에 맞는 업무가 없어요.')).toBeDefined();
  });

  it('keeps the default catalogue when no duration is selected', () => {
    render(<CareerTasksBoard tasks={[]} selectedMaxDuration={null} />);
    expect((screen.getByLabelText('최대 업무 수행시간') as HTMLSelectElement).value).toBe('');
  });
});
