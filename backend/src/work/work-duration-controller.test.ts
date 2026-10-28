import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { WorkController } from './work.controller';
import type { WorkRepository } from './work.repository';

const actor = '00000000-0000-4000-8000-000000000001';
const request = { session: { user_id: actor } } as unknown as RequestWithSession;

describe('work duration API authorization and input', () => {
  it('uses the guarded session actor, not a user-supplied identity', async () => {
    const tasks = vi.fn(async () => []);
    const controller = new WorkController({
      featureState: async () => 'enabled',
      tasks,
    } as unknown as WorkRepository);
    expect(await controller.tasks(request, '900')).toEqual({ featureState: 'enabled', tasks: [] });
    expect(tasks).toHaveBeenCalledWith(actor, 900);
  });

  it('rejects invalid and repeated filters without querying tasks', async () => {
    const tasks = vi.fn(async () => []);
    const controller = new WorkController({
      featureState: async () => 'enabled',
      tasks,
    } as unknown as WorkRepository);
    await expect(controller.tasks(request, ['300', '900'])).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(controller.tasks(request, '-1')).rejects.toBeInstanceOf(BadRequestException);
    expect(tasks).not.toHaveBeenCalled();
  });
});
