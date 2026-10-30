import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CareerTasksBoard } from './career-tasks-board';
import { normalizedWorkAvailableOnly, workTasksApiPath } from './work-duration-filter';

vi.mock('./actions', () => ({ switchJobAction: vi.fn() }));
vi.mock('./work-forms', () => ({ TakeButton: () => null }));
vi.mock('@/components/locale-provider', () => ({ useLocale: () => ({ locale: 'ko' }) }));
afterEach(cleanup);

describe('member work task daily availability filter', () => {
  it('keeps the default board and forwards only the explicit opt-in', () => {
    expect(normalizedWorkAvailableOnly(undefined)).toBe(false);
    expect(normalizedWorkAvailableOnly('1')).toBe(true);
    expect(normalizedWorkAvailableOnly(['1', '1'])).toBe(false);
    expect(workTasksApiPath(null)).toBe('/api/v1/work/tasks');
    expect(workTasksApiPath('300', true)).toBe(
      '/api/v1/work/tasks?maxDurationSeconds=300&availableOnly=1',
    );
    expect(workTasksApiPath(null, true)).toBe('/api/v1/work/tasks?availableOnly=1');
  });
  it('shows a labelled accessible availability checkbox in the server-filter GET form', () => {
    const { container } = render(
      <CareerTasksBoard tasks={[]} selectedAvailableOnly selectedMaxDuration="300" />,
    );
    const checkbox = screen.getByRole('checkbox', {
      name: '오늘 수행 가능한 업무만 보기',
    }) as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
    expect(checkbox.name).toBe('availableOnly');
    expect(checkbox.value).toBe('1');
    expect(container.querySelector('form[action="/work"][method="get"]')).not.toBeNull();
    expect(screen.getByText('선택한 조건에 맞는 업무가 없어요.')).toBeDefined();
  });
});
