import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PostgresCollectionRepository } from './collection.repository';

@Injectable()
export class CollectionService {
  constructor(private readonly repo: PostgresCollectionRepository) {}

  async listCollections(userId: string) {
    const unverifiedRecords = await this.repo.countUnverifiedCollections(userId);
    return { pieces: [], unverifiedRecords, verificationStatus: 'unavailable' as const };
  }

  async updatePiece(_userId: string, _pieceId: string, _userNote?: string, _isFavorite?: boolean) {
    throw new ServiceUnavailableException('collection provenance verification is unavailable');
  }

  async getCurationStatus(_userId: string) {
    return { status: null, verificationStatus: 'unavailable' as const };
  }

  async advanceCuration(_userId: string, _targetStep?: number, _timelineDay?: string) {
    throw new ServiceUnavailableException('collection provenance verification is unavailable');
  }
}
