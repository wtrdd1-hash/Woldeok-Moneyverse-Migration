import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PostgresSpaceRepository, SpaceInputError } from './space.repository';

@Injectable()
export class SpaceService {
  constructor(private readonly repo: PostgresSpaceRepository) {}

  async purchaseSpace(actorUserId: string, spaceType: string, name: string, idempotencyKey: string) {
    try {
      return await this.repo.purchaseSpace(actorUserId, spaceType, name, idempotencyKey);
    } catch (err: unknown) {
      if (err instanceof SpaceInputError) throw new BadRequestException(err.message);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('insufficient')) throw new BadRequestException('WLD 잔액이 부족합니다.');
      throw err;
    }
  }

  async listUserSpaces(actorUserId: string) {
    return this.repo.listUserSpaces(actorUserId);
  }

  async getSpaceById(spaceId: string) {
    try {
      const space = await this.repo.getSpaceById(spaceId);
      if (!space) throw new NotFoundException('공간을 찾을 수 없습니다.');
      return space;
    } catch (err: unknown) {
      if (err instanceof SpaceInputError) throw new BadRequestException(err.message);
      throw err;
    }
  }

  async updateSpaceLayout(actorUserId: string, spaceId: string, layout: Record<string, unknown>) {
    try {
      return await this.repo.updateSpaceLayout(actorUserId, spaceId, layout);
    } catch (err: unknown) {
      if (err instanceof SpaceInputError) {
        if (err.message.includes('not your space')) throw new ForbiddenException('본인의 공간만 수정할 수 있습니다.');
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }

  async listCityProjects() {
    return this.repo.listCityProjects();
  }

  async contributeCityProject(
    actorUserId: string,
    projectId: string,
    amountWld: number,
    idempotencyKey: string,
  ) {
    try {
      return await this.repo.contributeCityProject(actorUserId, projectId, amountWld, idempotencyKey);
    } catch (err: unknown) {
      if (err instanceof SpaceInputError) throw new BadRequestException(err.message);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('insufficient')) throw new BadRequestException('WLD 잔액이 부족합니다.');
      if (msg.includes('not active') || msg.includes('already fully funded')) {
        throw new BadRequestException('이미 완료되었거나 비활성 상태인 프로젝트입니다.');
      }
      throw err;
    }
  }

  async getSpaceTaxStatus(spaceId: string) {
    try {
      return await this.repo.getSpaceTaxStatus(spaceId);
    } catch (err: unknown) {
      if (err instanceof SpaceInputError) {
        if (err.message.includes('not found')) throw new NotFoundException('공간을 찾을 수 없습니다.');
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }

  async payPropertyTax(actorUserId: string, spaceId: string, days: number, idempotencyKey: string) {
    try {
      return await this.repo.payPropertyTax(actorUserId, spaceId, days, idempotencyKey);
    } catch (err: unknown) {
      if (err instanceof SpaceInputError) throw new BadRequestException(err.message);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('insufficient')) throw new BadRequestException('WLD 잔액이 부족합니다.');
      if (msg.includes('not owner')) throw new ForbiddenException('본인 소유의 공간만 부동산세를 납부할 수 있습니다.');
      if (msg.includes('not found')) throw new NotFoundException('공간을 찾을 수 없습니다.');
      throw err;
    }
  }

  async listDelinquencies() {
    return this.repo.listDelinquencies();
  }
}
