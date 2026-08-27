import { Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class GameCatalogInputError extends Error {}

function id(value: unknown, field: string): string {
  if (typeof value !== 'string' || !UUID.test(value))
    throw new GameCatalogInputError(`${field} must be a UUID`);
  return value;
}

// packages/database/migrations/038-admin-game-catalogs.sql (business_admin_list)
export interface BusinessRow {
  id: string;
  symbol: string;
  name: string;
  description: string;
  purchase_cost: string;
  daily_revenue: string;
  daily_operating_cost: string;
  active: boolean;
}

// packages/database/migrations/038-admin-game-catalogs.sql (business_admin_update / season_event_admin_update)
export interface ChangedRow {
  changed: boolean | null;
}

// packages/database/migrations/038-admin-game-catalogs.sql (season_event_admin_list)
export interface SeasonEventRow {
  id: string;
  season_name: string;
  title: string;
  description: string;
  cost_wld: string;
  points_per_entry: number;
  active: boolean;
  ends_at: Date;
}

// packages/database/migrations/038-admin-game-catalogs.sql (season_event_admin_create)
export interface SeasonEventIdRow {
  id: string;
}

export interface UpdateBusinessInput {
  name?: unknown;
  description?: unknown;
  active?: unknown;
}

export interface CreateEventInput {
  title: unknown;
  description?: unknown;
  costWld: unknown;
  pointsPerEntry: unknown;
}

export interface UpdateEventInput {
  title?: unknown;
  description?: unknown;
  active?: unknown;
}

@Injectable()
export class PostgresGameCatalogRepository {
  readonly pool: Queryable;

  constructor(pool: Queryable) {
    if (!pool?.query) throw new TypeError('a PostgreSQL pool is required');
    this.pool = pool;
  }

  async businesses(actor: unknown): Promise<BusinessRow[]> {
    return queryRows<BusinessRow>(
      this.pool,
      'SELECT id::text,symbol,name,description,purchase_cost::text,daily_revenue::text,daily_operating_cost::text,active FROM public.business_admin_list($1)',
      [id(actor, 'actor id')],
    );
  }

  async updateBusiness(
    actor: unknown,
    businessId: unknown,
    input: UpdateBusinessInput,
  ): Promise<ChangedRow> {
    const row = await queryOne<ChangedRow>(
      this.pool,
      'SELECT public.business_admin_update($1,$2,$3,$4,$5) AS changed',
      [
        id(actor, 'actor id'),
        id(businessId, 'business id'),
        input.name ?? null,
        input.description ?? null,
        input.active ?? null,
      ],
    );
    return row ?? { changed: false };
  }

  async events(actor: unknown): Promise<SeasonEventRow[]> {
    return queryRows<SeasonEventRow>(
      this.pool,
      'SELECT id::text,season_name,title,description,cost_wld::text,points_per_entry,active,ends_at FROM public.season_event_admin_list($1)',
      [id(actor, 'actor id')],
    );
  }

  async createEvent(actor: unknown, input: CreateEventInput): Promise<SeasonEventIdRow | null> {
    return queryOne<SeasonEventIdRow>(
      this.pool,
      'SELECT public.season_event_admin_create($1,$2,$3,$4,$5)::text AS id',
      [
        id(actor, 'actor id'),
        input.title,
        input.description ?? '',
        input.costWld,
        input.pointsPerEntry,
      ],
    );
  }

  async updateEvent(
    actor: unknown,
    eventId: unknown,
    input: UpdateEventInput,
  ): Promise<ChangedRow> {
    const row = await queryOne<ChangedRow>(
      this.pool,
      'SELECT public.season_event_admin_update($1,$2,$3,$4,$5) AS changed',
      [
        id(actor, 'actor id'),
        id(eventId, 'event id'),
        input.title ?? null,
        input.description ?? null,
        input.active ?? null,
      ],
    );
    return row ?? { changed: false };
  }
}
