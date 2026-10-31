import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ClubInputError, PostgresClubRepository } from './club.repository';
import { rejectUnjournaledClubSettlement } from './club.ledger-hold';

export interface CreateClubInput {
  readonly tag: string;
  readonly name: string;
  readonly description?: string;
  readonly charter?: string;
  readonly joinMode?: string;
}

export interface CreateFeedPostInput {
  readonly title: string;
  readonly body: string;
  readonly isAnnouncement?: boolean;
}

@Injectable()
export class ClubService {
  constructor(private readonly repo: PostgresClubRepository) {}

  async createClub(_actorUserId: string, _dto: CreateClubInput, _idempotencyKey: string) {
    return rejectUnjournaledClubSettlement();
  }

  async listClubs(actorUserId?: string, search?: string, limit = 50, offset = 0, minMembers = 0) {
    return this.repo.listClubs(actorUserId, search, limit, offset, minMembers);
  }

  async getClubById(clubId: string, actorUserId?: string) {
    try {
      const club = await this.repo.getClubById(clubId, actorUserId);
      if (!club) throw new NotFoundException('클럽을 찾을 수 없습니다.');
      return club;
    } catch (err: unknown) {
      if (err instanceof ClubInputError) throw new BadRequestException(err.message);
      throw err;
    }
  }

  async joinClub(actorUserId: string, clubId: string) {
    try {
      return await this.repo.joinClub(actorUserId, clubId);
    } catch (err: unknown) {
      if (err instanceof ClubInputError) throw new BadRequestException(err.message);
      throw err;
    }
  }

  async leaveClub(actorUserId: string, clubId: string) {
    try {
      return await this.repo.leaveClub(actorUserId, clubId);
    } catch (err: unknown) {
      if (err instanceof ClubInputError) throw new BadRequestException(err.message);
      throw err;
    }
  }

  async listClubMembers(clubId: string, actorUserId?: string, limit = 50, offset = 0) {
    try {
      return await this.repo.listClubMembers(clubId, actorUserId, limit, offset);
    } catch (err: unknown) {
      if (err instanceof ClubInputError) throw new BadRequestException(err.message);
      throw err;
    }
  }

  async updateMemberRole(
    actorUserId: string,
    clubId: string,
    targetUserId: string,
    newRole: 'steward' | 'moderator' | 'member',
  ) {
    try {
      return await this.repo.updateMemberRole(actorUserId, clubId, targetUserId, newRole);
    } catch (err: unknown) {
      if (err instanceof ClubInputError) {
        if (err.message.includes('permission denied')) throw new ForbiddenException(err.message);
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }

  async listClubProjects(clubId: string) {
    try {
      return await this.repo.listClubProjects(clubId);
    } catch (err: unknown) {
      if (err instanceof ClubInputError) throw new BadRequestException(err.message);
      throw err;
    }
  }

  async contributeToProject(
    _actorUserId: string,
    _clubId: string,
    _projectId: string,
    _amountWld: number,
    _idempotencyKey: string,
  ) {
    return rejectUnjournaledClubSettlement();
  }

  async listClubFeed(clubId: string, limit = 50) {
    try {
      return await this.repo.listClubFeed(clubId, limit);
    } catch (err: unknown) {
      if (err instanceof ClubInputError) throw new BadRequestException(err.message);
      throw err;
    }
  }

  async createClubFeedPost(actorUserId: string, clubId: string, dto: CreateFeedPostInput) {
    try {
      return await this.repo.createClubFeedPost(
        actorUserId,
        clubId,
        dto.title,
        dto.body,
        dto.isAnnouncement ?? false,
      );
    } catch (err: unknown) {
      if (err instanceof ClubInputError) {
        if (err.message.includes('permission denied')) throw new ForbiddenException(err.message);
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }

  async getClubCanvas(clubId: string) {
    try {
      return await this.repo.getClubCanvas(clubId);
    } catch (err: unknown) {
      if (err instanceof ClubInputError) throw new BadRequestException(err.message);
      throw err;
    }
  }

  async updateClubCanvas(actorUserId: string, clubId: string, grid: unknown, totalScore: number) {
    try {
      return await this.repo.updateClubCanvas(actorUserId, clubId, grid, totalScore);
    } catch (err: unknown) {
      if (err instanceof ClubInputError) {
        if (err.message.includes('permission denied')) throw new ForbiddenException(err.message);
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }
}

