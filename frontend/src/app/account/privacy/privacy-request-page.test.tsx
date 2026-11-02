import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const { read, requireMember } = vi.hoisted(() => ({ read: vi.fn(), requireMember: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull: read }));
vi.mock('@/lib/session', () => ({ requireMember }));
vi.mock('../account-forms', () => ({ PrivacyRequestForm: () => null }));
import AccountPrivacyPage from './page';

beforeEach(() => { vi.clearAllMocks(); requireMember.mockResolvedValue(undefined); });

describe('privacy request owner page', () => {
  it('fails closed and keeps the selected filter in accessible retry', async () => {
    read.mockResolvedValue({ requests: 'invalid' });
    const html = renderToStaticMarkup(await AccountPrivacyPage({ searchParams: Promise.resolve({ type: 'access' }) }));
    expect(html).toContain('role="alert"');
    expect(html).toContain('href="/account/privacy?type=access"');
    expect(html).toContain('다시 조회');
    expect(html).not.toContain('아직 기록한 개인정보 요청이 없어요');
    expect(read).toHaveBeenCalledWith('/api/v1/privacy/requests?type=access');
  });
  it('distinguishes verified empty from an unavailable response', async () => {
    read.mockResolvedValue({ requests: [] });
    const html = renderToStaticMarkup(await AccountPrivacyPage({ searchParams: Promise.resolve({}) }));
    expect(html).toContain('아직 기록한 개인정보 요청이 없어요');
    expect(html).not.toContain('잘못된 응답 또는 일시적인 서버 장애');
  });
});
