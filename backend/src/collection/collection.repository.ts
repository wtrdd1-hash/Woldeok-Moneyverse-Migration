import { Inject, Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';
import { PG_POOL } from '../core/pool.provider';

export interface CollectionPieceRow {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly category: string;
  readonly rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  readonly provenance: string;
  readonly icon: string;
  readonly isFavorite: boolean;
  readonly userNote: string;
  readonly acquiredAt: string;
}

export interface CurationStatusRow {
  readonly ladderStep: number;
  readonly timelineDay: string;
  readonly updatedAt: string;
}

@Injectable()
export class PostgresCollectionRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Queryable | null) {}

  private get client(): Queryable {
    if (!this.pool) throw new Error('database pool unavailable');
    return this.pool;
  }

  async listCollections(userId: string): Promise<CollectionPieceRow[]> {
    return queryRows<CollectionPieceRow>(
      this.client,
      `SELECT id::text, code, name, category, rarity, provenance, icon,
              is_favorite AS "isFavorite", user_note AS "userNote",
              acquired_at::text AS "acquiredAt"
       FROM public.user_collections
       WHERE user_id = $1::uuid
       ORDER BY is_favorite DESC, acquired_at DESC;`,
      [userId],
    );
  }

  async updatePiece(
    userId: string,
    pieceId: string,
    userNote?: string,
    isFavorite?: boolean,
  ): Promise<boolean> {
    const sets: string[] = [];
    const params: unknown[] = [pieceId, userId];

    if (userNote !== undefined) {
      params.push(userNote);
      sets.push(`user_note = $${params.length}`);
    }
    if (isFavorite !== undefined) {
      params.push(isFavorite);
      sets.push(`is_favorite = $${params.length}`);
    }

    if (sets.length === 0) return true;

    const row = await queryOne<{ id: string }>(
      this.client,
      `UPDATE public.user_collections
       SET ${sets.join(', ')}
       WHERE (id::text = $1 OR code = $1) AND user_id = $2::uuid
       RETURNING id::text;`,
      params,
    );
    return !!row?.id;
  }

  async getCurationStatus(userId: string): Promise<CurationStatusRow | null> {
    return queryOne<CurationStatusRow>(
      this.client,
      `SELECT ladder_step AS "ladderStep", timeline_day AS "timelineDay", updated_at::text AS "updatedAt"
       FROM public.user_curation_progress
       WHERE user_id = $1::uuid;`,
      [userId],
    );
  }

  async advanceCuration(
    userId: string,
    targetStep?: number,
    timelineDay?: string,
  ): Promise<CurationStatusRow> {
    const current = await this.getCurationStatus(userId);
    const nextStep = targetStep !== undefined ? targetStep : Math.min(7, (current?.ladderStep ?? 0) + 1);
    const nextDay = timelineDay ?? current?.timelineDay ?? 'D7';

    const updated = await queryOne<CurationStatusRow>(
      this.client,
      `INSERT INTO public.user_curation_progress (user_id, ladder_step, timeline_day, updated_at)
       VALUES ($1::uuid, $2, $3, clock_timestamp())
       ON CONFLICT (user_id)
       DO UPDATE SET
         ladder_step = EXCLUDED.ladder_step,
         timeline_day = EXCLUDED.timeline_day,
         updated_at = clock_timestamp()
       RETURNING ladder_step AS "ladderStep", timeline_day AS "timelineDay", updated_at::text AS "updatedAt";`,
      [userId, nextStep, nextDay],
    );

    return updated ?? { ladderStep: nextStep, timelineDay: nextDay, updatedAt: new Date().toISOString() };
  }
}
