import { describe, expect, it, vi } from 'vitest';
import type { AppConfig } from '../core/config';
import { AuthController } from './auth.controller';

const config = {
  oauth: {
    discord: {
      enabled: true,
      clientId: 'discord-client',
      clientSecret: 'secret',
      redirectUri: 'https://easy-scraping.com/auth/discord/callback',
      redirectUris: ['https://easy-scraping.com/auth/discord/callback'],
    },
    google: { enabled: false },
  },
} as AppConfig;

describe('AuthController mobile OAuth session isolation', () => {
  it('creates a dedicated anonymous session for mobile even when the browser is already signed in', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'mobile-prelogin', token: 't', csrfToken: 'c' });
    const createChallenge = vi.fn().mockResolvedValue(undefined);
    const sessions = { create, createChallenge } as never;
    const controller = new AuthController(config, sessions, {} as never, null);
    const request = {
      session: { id: 'signed-in-web-session', user_id: 'member-1' },
      headers: { 'x-public-origin': 'https://easy-scraping.com' },
    } as never;

    const result = await controller.authorize(request, 'discord', 'mobile');

    expect(result.authorizationUrl).toContain('discord.com');
    expect(create).toHaveBeenCalledTimes(1);
    expect(createChallenge).toHaveBeenCalledWith(
      'mobile-prelogin',
      expect.any(Object),
      'login',
      true,
    );
  });

  it('keeps the current browser session for the ordinary web OAuth flow', async () => {
    const create = vi.fn();
    const createChallenge = vi.fn().mockResolvedValue(undefined);
    const sessions = { create, createChallenge } as never;
    const controller = new AuthController(config, sessions, {} as never, null);
    const request = {
      session: { id: 'web-session', user_id: null },
      headers: { 'x-public-origin': 'https://easy-scraping.com' },
    } as never;

    await controller.authorize(request, 'discord', 'web');

    expect(create).not.toHaveBeenCalled();
    expect(createChallenge).toHaveBeenCalledWith('web-session', expect.any(Object), 'login', false);
  });
});
