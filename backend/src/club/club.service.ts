import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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
    actorUserId: string,
    clubId: string,
    projectId: string,
    amountWld: number,
    idempotencyKey: string,
  ) {
    try {
      return await this.repo.contributeToProject(actorUserId, clubId, projectId, amountWld, idempotencyKey);
    } catch (err: unknown) {
      if (err instanceof ClubInputError) throw new BadRequestException(err.message);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('not a member')) throw new ForbiddenException('클럽 회원만 프로젝트에 기여할 수 있습니다.');
      if (msg.includes('insufficient')) throw new BadRequestException('WLD 잔액이 부족합니다.');
      throw err;
    }
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
}
