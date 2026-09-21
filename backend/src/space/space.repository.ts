import { Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class SpaceInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SpaceInputError';
  }
}

export interface UserSpaceRow {
  readonly id: string;
  readonly user_id: string;
  readonly space_type: string;
  readonly name: string;
  readonly privacy: string;
  readonly layout: Record<string, unknown>;
  readonly created_at: Date;
  readonly updated_at: Date;
}

export interface CityProjectRow {
  readonly id: string;
  readonly code: string;
  readonly title: string;
  readonly description: string;
  readonly target_wld: string;
  readonly current_wld: string;
  readonly status: string;
  readonly stage: number;
  readonly created_at: Date;
  readonly completed_at: Date | null;
  readonly progress_percent: number;
}

export interface PurchaseSpaceResult {
  readonly space_id: string;
  readonly space_type: string;
  readonly name: string;
  readonly created_at: Date;
}

export interface ContributeCityProjectResult {
  readonly contribution_id: string;
  readonly accepted_amount: string;
  readonly project_current_wld: string;
  readonly project_status: string;
}

@Injectable()
export class PostgresSpaceRepository {
  constructor(private readonly client: Queryable) {}

  async purchaseSpace(
    actorUserId: string,
    spaceType: string,
    name: string,
    idempotencyKey: string,
  ): Promise<PurchaseSpaceResult> {
    if (!UUID_REGEX.test(actorUserId)) throw new SpaceInputError('actorUserId must be a valid UUID');
    if (!UUID_REGEX.test(idempotencyKey)) throw new SpaceInputError('idempotencyKey must be a valid UUID');

    const row = await queryOne<PurchaseSpaceResult>(
      this.client,
      `SELECT space_id, space_type, name, created_at
       FROM public.space_purchase($1::uuid, $2::text, $3::text, $4::uuid);`,
      [actorUserId, spaceType, name.trim(), idempotencyKey],
    );
    if (!row) throw new Error('failed to purchase space');
    return row;
  }

  async listUserSpaces(actorUserId: string): Promise<UserSpaceRow[]> {
    if (!UUID_REGEX.test(actorUserId)) throw new SpaceInputError('actorUserId must be a valid UUID');

    return queryRows<UserSpaceRow>(
      this.client,
      `SELECT id, user_id, space_type, name, privacy, layout, created_at, updated_at
       FROM public.user_spaces
       WHERE user_id = $1::uuid
       ORDER BY created_at DESC;`,
      [actorUserId],
    );
  }

  async getSpaceById(spaceId: string): Promise<UserSpaceRow | null> {
    if (!UUID_REGEX.test(spaceId)) throw new SpaceInputError('spaceId must be a valid UUID');

    return queryOne<UserSpaceRow>(
      this.client,
      `SELECT id, user_id, space_type, name, privacy, layout, created_at, updated_at
       FROM public.user_spaces
       WHERE id = $1::uuid;`,
      [spaceId],
    );
  }

  async updateSpaceLayout(
    actorUserId: string,
    spaceId: string,
    layout: Record<string, unknown>,
  ): Promise<boolean> {
    if (!UUID_REGEX.test(actorUserId)) throw new SpaceInputError('actorUserId must be a valid UUID');
    if (!UUID_REGEX.test(spaceId)) throw new SpaceInputError('spaceId must be a valid UUID');

    const space = await queryOne<{ user_id: string }>(
      this.client,
      `SELECT user_id FROM public.user_spaces WHERE id = $1::uuid;`,
      [spaceId],
    );
    if (!space) throw new SpaceInputError('space not found');
    if (space.user_id !== actorUserId) throw new SpaceInputError('not your space');

    await this.client.query(
      `UPDATE public.user_spaces
       SET layout = $2::jsonb, updated_at = pg_catalog.clock_timestamp()
       WHERE id = $1::uuid AND user_id = $3::uuid;`,
      [spaceId, JSON.stringify(layout), actorUserId],
    );
    return true;
  }

  async listCityProjects(): Promise<CityProjectRow[]> {
    return queryRows<CityProjectRow>(
      this.client,
      `SELECT
         id,
         code,
         title,
         description,
         target_wld,
         current_wld,
         status,
         stage,
         created_at,
         completed_at,
         ROUND(LEAST(100, (current_wld::numeric / NULLIF(target_wld::numeric, 0)) * 100))::integer AS progress_percent
       FROM public.city_projects
       ORDER BY CASE status WHEN 'active' THEN 1 ELSE 2 END, created_at ASC;`,
      [],
    );
  }

  async contributeCityProject(
    actorUserId: string,
    projectId: string,
    amountWld: number,
    idempotencyKey: string,
  ): Promise<ContributeCityProjectResult> {
    if (!UUID_REGEX.test(actorUserId)) throw new SpaceInputError('actorUserId must be a valid UUID');
    if (!UUID_REGEX.test(projectId)) throw new SpaceInputError('projectId must be a valid UUID');
    if (!UUID_REGEX.test(idempotencyKey)) throw new SpaceInputError('idempotencyKey must be a valid UUID');
    if (amountWld <= 0) throw new SpaceInputError('amountWld must be positive');

    const row = await queryOne<ContributeCityProjectResult>(
      this.client,
      `SELECT contribution_id, accepted_amount::text, project_current_wld, project_status
       FROM public.city_project_contribute($1::uuid, $2::uuid, $3::numeric, $4::uuid);`,
      [actorUserId, projectId, amountWld, idempotencyKey],
    );
    if (!row) throw new Error('failed to contribute to city project');
    return row;
  }
}
