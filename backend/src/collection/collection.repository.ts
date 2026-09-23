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

  // Ensure default seed pieces exist for user
  async ensureSeedPieces(userId: string): Promise<void> {
    const existing = await queryOne<{ count: string }>(
      this.client,
      `SELECT count(*)::text AS count FROM public.user_collections WHERE user_id = $1::uuid;`,
      [userId],
    );

    if (!existing || Number.parseInt(existing.count, 10) === 0) {
      await queryOne(
        this.client,
        `INSERT INTO public.user_collections (user_id, code, name, category, rarity, provenance, icon, is_favorite, user_note, acquired_at)
         VALUES
         ($1::uuid, 'FIRST_CAPITAL_BADGE', '최초의 수도 개척 훈장', 'SEASON', 'LEGENDARY', '시즌 1 First Capital 오픈 주간 공공 기여 및 수도 건설 참여 회원에게 수여된 불멸의 훈장', '🏛️', true, '첫 시즌의 수도 건설을 함께한 기념비적인 조각.', '2026-08-15'::timestamptz),
         ($1::uuid, 'ANTIQUE_SAFE_KEY', '골든 헤리티지 금고 열쇠', 'BANKING', 'EPIC', '초기 가상 은행 신용 등급 우수 회원에게 배정된 프라이빗 아카이브 인증 키', '🔑', false, '신용 관리 1등급 달성 기념.', '2026-08-28'::timestamptz),
         ($1::uuid, 'NEO_CYBER_CASINO_CHIP', '월덕 카지노 리미티드 칩', 'CASINO', 'RARE', '카지노 7대 게임 정규 그랜드 오픈 이벤트 참여 한정 소장용 기념 칩', '🎲', false, '', '2026-09-05'::timestamptz),
         ($1::uuid, 'SMART_LOGISTICS_PERMIT', '스마트 운송 물류 허가서', 'BUSINESS', 'RARE', '가상 사업체 B2B 공급망 개척 및 물류센터 가동 인가 공문서', '📜', true, '물류 사업 흑자 전환 기념.', '2026-09-18'::timestamptz)
         ON CONFLICT (user_id, code) DO NOTHING;`,
        [userId],
      );
    }
  }

  async listCollections(userId: string): Promise<CollectionPieceRow[]> {
    await this.ensureSeedPieces(userId);
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

  async getCurationStatus(userId: string): Promise<CurationStatusRow> {
    const existing = await queryOne<CurationStatusRow>(
      this.client,
      `SELECT ladder_step AS "ladderStep", timeline_day AS "timelineDay", updated_at::text AS "updatedAt"
       FROM public.user_curation_progress
       WHERE user_id = $1::uuid;`,
      [userId],
    );

    if (existing) return existing;

    const inserted = await queryOne<CurationStatusRow>(
      this.client,
      `INSERT INTO public.user_curation_progress (user_id, ladder_step, timeline_day)
       VALUES ($1::uuid, 1, 'D7')
       ON CONFLICT (user_id) DO UPDATE SET updated_at = clock_timestamp()
       RETURNING ladder_step AS "ladderStep", timeline_day AS "timelineDay", updated_at::text AS "updatedAt";`,
      [userId],
    );
    return inserted ?? { ladderStep: 1, timelineDay: 'D7', updatedAt: new Date().toISOString() };
  }

  async advanceCuration(
    userId: string,
    targetStep?: number,
    timelineDay?: string,
  ): Promise<CurationStatusRow> {
    const current = await this.getCurationStatus(userId);
    const nextStep = targetStep !== undefined ? targetStep : Math.min(7, current.ladderStep + 1);
    const nextDay = timelineDay ?? current.timelineDay;

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
