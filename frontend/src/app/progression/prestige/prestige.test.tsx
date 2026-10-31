import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import PrestigePage, { metadata, dynamic } from './page';
import { requireMember } from '@/lib/session';

vi.mock('@/lib/session', () => ({ requireMember: vi.fn(async () => undefined) }));

describe('Prestige ledger truth', () => {
  it('requires a member and refuses to show invented balances, tiers, relics, or success actions', async () => {
    const html = renderToStaticMarkup(await PrestigePage());
    expect(requireMember).toHaveBeenCalled();
    expect(html).toContain('프레스티지 거래를 현재 제공하지 않습니다');
    expect(html).toContain('원장');
    expect(html).not.toContain('2,500,000');
    expect(html).not.toContain('8,500,000');
    expect(html).not.toContain('고대 황금 시계');
    expect(html).not.toContain('환생 확정');
    expect(html).not.toContain('환생 완료');
    expect(html).not.toContain('보험 활성화하기');
    expect(html).toContain('/progression');
  });

  it('keeps member-only content dynamic and unindexable', () => {
    expect(dynamic).toBe('force-dynamic');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
