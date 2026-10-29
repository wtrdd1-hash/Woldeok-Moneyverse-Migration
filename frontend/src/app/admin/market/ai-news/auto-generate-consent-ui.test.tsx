import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AiNewsAutoGenerateCard } from './ai-news-console';

vi.mock('./actions', () => ({
  autoGenerateAiNews: vi.fn(async () => ({ status: 'idle' })),
  saveAiNewsSettings: vi.fn(async () => ({ status: 'idle' })),
  generateAiNews: vi.fn(async () => ({ status: 'idle' })),
  decideAiNewsScenario: vi.fn(async () => ({ status: 'idle' })),
}));

describe('AI news admin publication checkbox', () => {
  it('starts unchecked and explains that draft-only generation cannot move prices', () => {
    render(<AiNewsAutoGenerateCard ready />);
    const consent = screen.getByRole('checkbox', { name: /생성 즉시 시장에 뉴스 발행/ });
    expect((consent as HTMLInputElement).checked).toBe(false);
    expect(screen.getByText(/시장에는 발행하지 않습니다/)).toBeTruthy();
  });
});
