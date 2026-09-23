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

  it('successfully creates a club with valid input', async () => {
    const actorUserId = '11111111-1111-1111-1111-111111111111';
    const idempotencyKey = '22222222-2222-2222-2222-222222222222';
    const dto = {
      tag: 'ALPHA',
      name: '알파 클럽',
      description: '알파 테스트 클럽입니다.',
      charter: '클럽 헌장입니다.',
      joinMode: 'public',
    };

    vi.mocked(mockRepo.createClub).mockResolvedValueOnce({
      club_id: '33333333-3333-3333-3333-333333333333',
      tag: 'ALPHA',
      name: '알파 클럽',
      status: 'active',
      created_at: new Date(),
    });

    const result = await service.createClub(actorUserId, dto, idempotencyKey);
    expect(mockRepo.createClub).toHaveBeenCalledWith(
      actorUserId,
      'ALPHA',
      '알파 클럽',
      '알파 테스트 클럽입니다.',
      '클럽 헌장입니다.',
      'public',
      idempotencyKey,
    );
    expect(result.tag).toBe('ALPHA');
  });

  it('throws NotFoundException when club does not exist', async () => {
    const clubId = '99999999-9999-9999-9999-999999999999';
    vi.mocked(mockRepo.getClubById).mockResolvedValueOnce(null);

    await expect(service.getClubById(clubId)).rejects.toThrow(NotFoundException);
  });

  it('successfully contributes WLD to a cooperative project', async () => {
    const actorUserId = '11111111-1111-1111-1111-111111111111';
    const clubId = '22222222-2222-2222-2222-222222222222';
    const projectId = '33333333-3333-3333-3333-333333333333';
    const key = '44444444-4444-4444-4444-444444444444';

    vi.mocked(mockRepo.contributeToProject).mockResolvedValueOnce({
      contribution_id: '55555555-5555-5555-5555-555555555555',
      accepted_amount: '1000',
      project_current_wld: '1000',
      project_status: 'active',
    });

    const result = await service.contributeToProject(actorUserId, clubId, projectId, 1000, key);
    expect(result.accepted_amount).toBe('1000');
    expect(result.project_status).toBe('active');
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

