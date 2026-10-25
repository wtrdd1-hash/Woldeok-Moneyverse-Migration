import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { LocaleProvider } from '@/components/locale-provider';
import { OnboardingChecklist } from './components/onboarding-checklist';

const renderChecklist = () => render(
  <LocaleProvider initialLocale="ko"><OnboardingChecklist /></LocaleProvider>,
);

describe('manual onboarding progress integrity', () => {
  beforeEach(() => localStorage.clear());

  it('never represents local checkboxes as WLD rewards or an awarded server badge', () => {
    renderChecklist();
    expect(screen.getByText('입문 6대 학습 체크리스트')).toBeDefined();
    expect(screen.getByText(/이 기기의 개인 학습 기록/)).toBeDefined();
    expect(screen.queryByText(/\+1,000 WLD/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '전체 완료 표시' }));
    expect(screen.getByText(/내 체크리스트 완료/)).toBeDefined();
    expect(screen.queryByText('머니버스 입문 마스터 뱃지 획득!')).toBeNull();
    expect(screen.queryByText(/모든 퀘스트 완료/)).toBeNull();
  });

  it('offers accessible 44px manual controls with pressed state', () => {
    renderChecklist();
    const task = screen.getByRole('button', { name: /완료 토글: 계정 로그인/ });
    expect(task.className).toContain('min-h-11');
    expect(task.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(task);
    expect(task.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: '전체 완료 표시' }).className).toContain('min-h-11');
  });

  it('keeps checked progress only in localStorage across remounts', () => {
    const { unmount } = renderChecklist();
    fireEvent.click(screen.getByRole('button', { name: /완료 토글: 계정 로그인/ }));
    expect(JSON.parse(localStorage.getItem('moneyverse_onboarding_completed_tasks_v1') || '{}')).toEqual({ task_login: true });
    unmount();
    renderChecklist();
    expect(screen.getByRole('button', { name: /완료 토글: 계정 로그인/ }).getAttribute('aria-pressed')).toBe('true');
  });

  it('ignores invalid localStorage payloads without granting progress', () => {
    localStorage.setItem('moneyverse_onboarding_completed_tasks_v1', JSON.stringify({ task_login: 'true', task_quest: 1 }));
    renderChecklist();
    expect(screen.getByText(/0 \/ 6/)).toBeDefined();
  });
});
