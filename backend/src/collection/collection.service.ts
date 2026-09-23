import { Injectable } from '@nestjs/common';
import { PostgresCollectionRepository } from './collection.repository';

@Injectable()
export class CollectionService {
  constructor(private readonly repo: PostgresCollectionRepository) {}

  async listCollections(userId: string) {
    return this.repo.listCollections(userId);
  }

  async updatePiece(userId: string, pieceId: string, userNote?: string, isFavorite?: boolean) {
    return this.repo.updatePiece(userId, pieceId, userNote, isFavorite);
  }

  async getCurationStatus(userId: string) {
    return this.repo.getCurationStatus(userId);
  }

  async advanceCuration(userId: string, targetStep?: number, timelineDay?: string) {
    return this.repo.advanceCuration(userId, targetStep, timelineDay);
  }
}
