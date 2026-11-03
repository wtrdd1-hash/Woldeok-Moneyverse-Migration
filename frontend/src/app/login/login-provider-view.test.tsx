import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const { response } = vi.hoisted(() => ({ response: { current: null as unknown } }));
vi.mock('@/lib/api', () => ({ apiOrNull: async () => response.current }));
vi.mock('@/lib/locale-server', () => ({ getServerLocale: async () => 'ko' }));
vi.mock('./actions', () => ({ submitLocalLogin: async () => undefined }));
import { LoginProvidersView } from './login-providers-view';

const providers = (local: boolean, discord: boolean, google: boolean) => ({ providers: [
  { id: 'local_email', enabled: local }, { id: 'discord', enabled: discord }, { id: 'google', enabled: google },
] });

beforeEach(() => { response.current = null; });

describe('sign-in options under source uncertainty', () => {
  it('does not crash or claim disabled OAuth when the upstream response is malformed', async () => {
    response.current = { providers: 'malformed' };
    const html = renderToStaticMarkup(await LoginProvidersView({}));
    expect(html).toContain('서버 상태를 확인하지 못했습니다');
    expect(html).toContain('다시 확인');
    expect(html).toContain('name="email"');
    expect(html).not.toContain('/auth/google/authorize');
  });

  it('omits local email sign-in when the server explicitly disables it', async () => {
    response.current = providers(false, true, false);
    const html = renderToStaticMarkup(await LoginProvidersView({}));
    expect(html).toContain('/auth/discord/authorize');
    expect(html).not.toContain('name="password"');
    expect(html).not.toContain('/auth/google/authorize');
  });

  it('distinguishes a verified all-disabled deployment from a temporary provider outage', async () => {
    response.current = providers(false, false, false);
    const html = renderToStaticMarkup(await LoginProvidersView({}));
    expect(html).toContain('현재 사용할 수 있는 로그인 수단이 없습니다');
    expect(html).not.toContain('서버 상태를 확인하지 못했습니다');
  });
});
