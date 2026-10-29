import { describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { ClubService } from './club.service';
import type { PostgresClubRepository } from './club.repository';

describe('ClubService', () => {
  const mockRepo = {
    createClub: vi.fn(),
    listClubs: vi.fn(),
    getClubById: vi.fn(),
    joinClub: vi.fn(),
    leaveClub: vi.fn(),
    listClubMembers: vi.fn(),
    updateMemberRole: vi.fn(),
    listClubProjects: vi.fn(),
    contributeToProject: vi.fn(),
    listClubFeed: vi.fn(),
    createClubFeedPost: vi.fn(),
  } as unknown as PostgresClubRepository;

  const service = new ClubService(mockRepo);

  it('throws NotFoundException when club does not exist', async () => {
    const clubId = '99999999-9999-9999-9999-999999999999';
    vi.mocked(mockRepo.getClubById).mockResolvedValueOnce(null);

    await expect(service.getClubById(clubId)).rejects.toThrow(NotFoundException);
  });

  it('successfully retrieves and updates club canvas layout', async () => {
    const clubId = '22222222-2222-2222-2222-222222222222';
    const actorUserId = '11111111-1111-1111-1111-111111111111';
    const sampleGrid = [['conf_table', null], [null, 'member_seat']];

    mockRepo.getClubCanvas = vi.fn().mockResolvedValueOnce({
      grid: sampleGrid,
      totalScore: 105,
      updatedAt: '2026-09-23T12:00:00Z',
    });

    const canvas = await service.getClubCanvas(clubId);
    expect(canvas).toBeDefined();
    expect(canvas?.totalScore).toBe(105);

    mockRepo.updateClubCanvas = vi.fn().mockResolvedValueOnce(true);
    const updated = await service.updateClubCanvas(actorUserId, clubId, sampleGrid, 105);
    expect(updated).toBe(true);
    expect(mockRepo.updateClubCanvas).toHaveBeenCalledWith(actorUserId, clubId, sampleGrid, 105);
  });
});

