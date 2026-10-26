import { BadRequestException, ForbiddenException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ClubInputError, PostgresClubRepository } from './club.repository';

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

  async createClub(actorUserId: string, dto: CreateClubInput, idempotencyKey: string) {
    try {
      return await this.repo.createClub(
        actorUserId,
        dto.tag,
        dto.name,
        dto.description || '',
        dto.charter || '',
        dto.joinMode || 'public',
        idempotencyKey,
      );
    } catch (err: unknown) {
      if (err instanceof ClubInputError) throw new BadRequestException(err.message);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('insufficient balance')) throw new BadRequestException(msg);
      if (msg.includes('unique') || msg.includes('duplicate')) {
        throw new BadRequestException('클럽 태그 또는 이름이 이미 사용 중입니다.');
      }
      throw err;
    }
  }

  async listClubs(actorUserId?: string, search?: string, limit = 50, offset = 0) {
    return this.repo.listClubs(actorUserId, search, limit, offset);
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
    // Migration 222 changes balances without balanced ledger postings or a
    // replay receipt. Never invoke it until a certified ledger-first replacement
    // and the official release gates are available (P0 issue #1423).
    throw new ServiceUnavailableException({
      code: 'CLUB_PROJECT_LEDGER_UNAVAILABLE',
      message: '클럽 프로젝트 펀딩은 금융 원장 검증 완료 전까지 일시 중단됩니다.',
    });
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

