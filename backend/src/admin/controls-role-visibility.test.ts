import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { AdminControlsController } from './controls.controller';
import type { ControlsRepository } from './controls.repository';

const actor = '00000000-0000-4000-8000-000000000001';
const request = { session: { user_id: actor } } as unknown as RequestWithSession;
const sampleRole = { user_id: actor, display_name: 'operator', role: 'superadmin', granted_at: new Date() };

function controllerWithRoles(roles: () => Promise<unknown>) {
  const repository = {
    featureSwitches: vi.fn().mockResolvedValue([]),
    policies: vi.fn().mockResolvedValue([]),
    roles: vi.fn().mockImplementation(roles),
  };
  return { controller: new AdminControlsController(repository as unknown as ControlsRepository), repository };
}

describe('administrator controls role-list provenance', () => {
  it('returns verified role assignments only when the PostgreSQL read succeeded', async () => {
    const { controller, repository } = controllerWithRoles(async () => [sampleRole]);
    await expect(controller.overview(request)).resolves.toMatchObject({ rolesEvidence: 'VERIFIED', roles: [sampleRole] });
    expect(repository.roles).toHaveBeenCalledWith(actor);
  });

  it('distinguishes a genuinely empty authorized role list from restricted access', async () => {
    const { controller } = controllerWithRoles(async () => []);
    await expect(controller.overview(request)).resolves.toMatchObject({ rolesEvidence: 'VERIFIED', roles: [] });
  });

  it.each([
    { code: '42501', message: 'superadmin role required' },
    { code: '28000', message: 'admin authorization required' },
  ])('reports RESTRICTED without leaking role rows for an expected authorization refusal $code', async (error) => {
    const { controller } = controllerWithRoles(async () => { throw error; });
    await expect(controller.overview(request)).resolves.toMatchObject({ rolesEvidence: 'RESTRICTED', roles: [] });
  });

  it('distinguishes an expected command error from a verified empty list', async () => {
    const { controller } = controllerWithRoles(async () => { throw { code: 'P0001', message: 'temporarily unavailable' }; });
    await expect(controller.overview(request)).resolves.toMatchObject({ rolesEvidence: 'UNAVAILABLE', roles: [] });
  });

  it('does not hide actual PostgreSQL privilege errors as role restrictions', async () => {
    const error = { code: '42501', message: 'permission denied for table user_roles' };
    const { controller } = controllerWithRoles(async () => { throw error; });
    await expect(controller.overview(request)).rejects.toBe(error);
  });
});
