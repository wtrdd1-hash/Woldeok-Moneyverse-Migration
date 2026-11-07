import { describe, expect, it } from 'vitest';
import { HEADERS_METADATA } from '@nestjs/common/constants';
import { AuthBootstrapController } from './bootstrap.controller';
import type { AppConfig } from '../core/config';
import type { SessionRepository } from './session.repository';
import type { AdminRolesRepository } from './admin-roles.repository';

function controller(sessions: boolean, discord: boolean, google: boolean) {
  const config = { oauth: { discord: { enabled: discord }, google: { enabled: google } } } as AppConfig;
  return new AuthBootstrapController(config, sessions ? {} as SessionRepository : null, {} as AdminRolesRepository);
}

describe('deployment provider contract', () => {
  it('reports disabled session storage and the exact three configured providers', () => {
    expect(controller(false, true, false).providers()).toEqual({ providers: [
      { id: 'local_email', enabled: false },
      { id: 'discord', enabled: true },
      { id: 'google', enabled: false },
    ] });
    expect(controller(true, false, true).providers().providers[0]).toEqual({ id: 'local_email', enabled: true });
  });

  it('does not cache deployment-dependent provider readiness at the API edge', () => {
    const headers: { name: string; value: string }[] = Reflect.getMetadata(HEADERS_METADATA, AuthBootstrapController.prototype.providers) ?? [];
    expect(headers).toContainEqual({ name: 'Cache-Control', value: 'no-store' });
    expect(headers).toContainEqual({ name: 'X-Robots-Tag', value: 'noindex, nofollow' });
  });
});
