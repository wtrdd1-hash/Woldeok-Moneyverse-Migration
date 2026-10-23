import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PetPage, { dynamic, metadata } from './pet/page';
import { requireMember } from '@/lib/session';

vi.mock('@/lib/session', () => ({ requireMember: vi.fn() }));
vi.mock('@/lib/dopamine-api', () => ({ claimPetFortune: vi.fn() }));

describe('reachable private Deoki pet page', () => {
  it('requires a signed-in member, is dynamic and excluded from indexing', async () => {
    const view = await PetPage();
    expect(requireMember).toHaveBeenCalledTimes(1);
    expect(dynamic).toBe('force-dynamic');
    expect(metadata.robots).toEqual({ index: false, follow: false });
    render(view);
    expect(screen.getByRole('heading', { name: /덕이 펫/ })).toBeDefined();
    expect(screen.getByRole('button', { name: '포춘쿠키 쪼개기' })).toBeDefined();
    expect(screen.getAllByText(/WLD.*지급되지|WLD.*보상 없음/).length).toBeGreaterThan(0);
  });
});
