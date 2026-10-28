import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { WorkTask } from './work';
import { CareerTasksBoard } from './career-tasks-board';

vi.mock('@/components/locale-provider', () => ({ useLocale: () => ({ locale: 'ko' }) }));
vi.mock('./work-forms', () => ({ TakeButton: () => <span>Choose task</span> }));

afterEach(cleanup);

function task(name: string, recommended: boolean): WorkTask {
  return {
    task_id: recommended ? '11111111-1111-4111-8111-111111111111' : '22222222-2222-4222-8222-222222222222',
    code: name,
    name,
    description: 'Member task',
    job_type: 'farmer',
    difficulty: 1,
    base_reward: '100',
    base_experience: '20',
    minimum_duration_seconds: 60,
    daily_limit: 5,
    taken_today: 0,
    reward_preview: '100',
    experience_preview: '20',
    recommended,
  };
}

describe('member recommended-only work board', () => {
  it('shows all tasks by default and uses an accessible pressed-state toggle for the member-specific daily picks', () => {
    render(<CareerTasksBoard tasks={[task('추천 업무', true), task('일반 업무', false)]} />);
    const toggle = screen.getByRole('button', { name: '오늘의 추천만 보기' });
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByText('추천 업무')).toBeDefined();
    expect(screen.getByText('일반 업무')).toBeDefined();
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('추천 업무')).toBeDefined();
    expect(screen.queryByText('일반 업무')).toBeNull();
    fireEvent.click(toggle);
    expect(screen.getByText('일반 업무')).toBeDefined();
  });
});
