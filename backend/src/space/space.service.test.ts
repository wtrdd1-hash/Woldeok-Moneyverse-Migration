import { describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { SpaceService } from './space.service';
import type { PostgresSpaceRepository } from './space.repository';

describe('SpaceService', () => {
  const mockRepo = {
    purchaseSpace: vi.fn(),
    listUserSpaces: vi.fn(),
    getSpaceById: vi.fn(),
    updateSpaceLayout: vi.fn(),
    listCityProjects: vi.fn(),
    contributeCityProject: vi.fn(),
  } as unknown as PostgresSpaceRepository;

  const service = new SpaceService(mockRepo);

  it('successfully purchases a space', async () => {
    const actorUserId = '11111111-1111-1111-1111-111111111111';
    const key = '22222222-2222-2222-2222-222222222222';

    vi.mocked(mockRepo.purchaseSpace).mockResolvedValueOnce({
      space_id: '33333333-3333-3333-3333-333333333333',
      space_type: 'SPACE_ROOM_STARTER',
      name: '내 첫 번째 방',
      created_at: new Date(),
    });

    const result = await service.purchaseSpace(actorUserId, 'SPACE_ROOM_STARTER', '내 첫 번째 방', key);
    expect(result.space_type).toBe('SPACE_ROOM_STARTER');
    expect(mockRepo.purchaseSpace).toHaveBeenCalledWith(actorUserId, 'SPACE_ROOM_STARTER', '내 첫 번째 방', key);
  });

  it('throws NotFoundException when space is not found', async () => {
    vi.mocked(mockRepo.getSpaceById).mockResolvedValueOnce(null);
    await expect(service.getSpaceById('99999999-9999-9999-9999-999999999999')).rejects.toThrow(NotFoundException);
  });

  it('successfully contributes WLD to a city project', async () => {
    const actorUserId = '11111111-1111-1111-1111-111111111111';
    const projectId = '22222222-2222-2222-2222-222222222222';
    const key = '33333333-3333-3333-3333-333333333333';

    vi.mocked(mockRepo.contributeCityProject).mockResolvedValueOnce({
      contribution_id: '44444444-4444-4444-4444-444444444444',
      accepted_amount: '5000',
      project_current_wld: '15000',
      project_status: 'active',
    });

    const result = await service.contributeCityProject(actorUserId, projectId, 5000, key);
    expect(result.accepted_amount).toBe('5000');
  });
});
