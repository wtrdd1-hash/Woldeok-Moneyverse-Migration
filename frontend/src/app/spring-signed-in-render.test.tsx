import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

/**
 * Production regressions 2026-11-25: /bank (digest 958076666, BigInt of
 * undefined) and /quests (next/link href undefined) threw for signed-in
 * members against the Spring API. Render both pages with the shapes Spring
 * actually returns (BankStanding camelCase envelope, streak status for
 * /engagement, hard-coded early-game rows) and expect honest states.
 */
const responses: Record<string, unknown> = {};
vi.mock('@/lib/api', () => ({
  apiOrNull: async (path: string) => {
    const key = Object.keys(responses).sort((a, b) => b.length - a.length).find((k) => path.startsWith(k));
    return key ? responses[key] : null;
  },
}));
vi.mock('@/lib/session', () => ({ requireMember: async () => ({ signedIn: true }) }));
vi.mock('@/lib/locale-server', () => ({ getServerLocale: async () => 'ko' }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }), usePathname: () => '/', useSearchParams: () => new URLSearchParams() }));

describe('signed-in pages against the Spring API', () => {
  it('/bank shows the unavailable state for the camelCase standing, no crash', async () => {
    responses['/api/v1/banking/standing'] = { success: true, data: { cashBalanceWld: '1000', depositBalanceWld: '500', creditGrade: 'A1', creditLimitWld: '5000000' } };
    responses['/api/v1/banking/pockets'] = { success: true, data: [] };
    const { default: BankPage } = await import('./bank/page');
    const html = renderToStaticMarkup(await BankPage());
    expect(html).toContain('지금은 은행 서비스를 불러올 수 없어요');
    expect(html).not.toContain('5,000,000');
  });

  it('/quests renders with Spring streak status and placeholder early-game rows', async () => {
    responses['/api/v1/engagement'] = { currentStreak: 2, claimedToday: false };
    responses['/api/v1/early-game/first-day'] = { steps: [{ step: 1, title: '계정 생성 및 프로필 설정', completed: true }] };
    responses['/api/v1/early-game/today'] = { event: { id: 'early-event-x', name: '첫 날의 출석 보너스', rewardWld: 50000, isClaimed: false } };
    const { default: QuestsPage } = await import('./quests/page');
    const html = renderToStaticMarkup(await QuestsPage());
    expect(html).not.toContain('50000');
    expect(html).not.toContain('50,000');
    expect(html).toContain('오늘의 사건을 불러오지 못했어요');
  });
});
