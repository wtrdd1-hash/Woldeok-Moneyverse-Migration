import { Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const DAILY_TAX_MAP: Record<string, number> = {
  SPACE_ROOM_STARTER: 10,
  SPACE_STUDIO: 50,
  SPACE_GALLERY: 150,
  SPACE_OFFICE: 250,
  SPACE_PENTHOUSE: 600,
  SPACE_HQ: 2500,
};

export const BASE_PRICE_MAP: Record<string, number> = {
  SPACE_ROOM_STARTER: 5000,
  SPACE_STUDIO: 25000,
  SPACE_GALLERY: 75000,
  SPACE_OFFICE: 100000,
  SPACE_PENTHOUSE: 250000,
  SPACE_HQ: 1500000,
};

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

export interface SpaceTaxStatusResult {
  readonly spaceId: string;
  readonly spaceType: string;
  readonly spaceName: string;
  readonly dailyTaxWld: number;
  readonly taxPaidUntil: Date;
  readonly isDelinquent: boolean;
  readonly overdueDays: number;
  readonly delinquentWld: number;
  readonly gracePeriodEnd: Date;
  readonly isForeclosureReady: boolean;
  readonly estimatedForeclosurePrice: number;
}

export interface PayPropertyTaxResult {
  readonly receiptId: string;
  readonly spaceId: string;
  readonly daysPaid: number;
  readonly totalWld: number;
  readonly newPaidUntil: Date;
  readonly paidAt: Date;
  readonly burnCode: string;
}

export interface DelinquentSpaceRow {
  readonly spaceId: string;
  readonly ownerUserId: string;
  readonly ownerDisplayName: string;
  readonly spaceType: string;
  readonly spaceName: string;
  readonly dailyTaxWld: number;
  readonly overdueDays: number;
  readonly delinquentWld: number;
  readonly foreclosureStartPrice: number;
  readonly status: 'DELINQUENT_GRACE' | 'FORECLOSURE_AUCTION';
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

  async getSpaceTaxStatus(spaceId: string): Promise<SpaceTaxStatusResult> {
    if (!UUID_REGEX.test(spaceId)) throw new SpaceInputError('spaceId must be a valid UUID');

    const row = await queryOne<{
      id: string;
      space_type: string;
      name: string;
      tax_paid_until: Date | null;
      created_at: Date;
    }>(
      this.client,
      `SELECT id, space_type, name, tax_paid_until, created_at
       FROM public.user_spaces
       WHERE id = $1::uuid;`,
      [spaceId],
    );

    if (!row) throw new SpaceInputError('space not found');

    const dailyTaxWld = DAILY_TAX_MAP[row.space_type] ?? 50;
    const basePrice = BASE_PRICE_MAP[row.space_type] ?? 25000;
    const estimatedForeclosurePrice = Math.floor(basePrice * 0.5);

    const now = new Date();
    const paidUntil = row.tax_paid_until ? new Date(row.tax_paid_until) : new Date(row.created_at.getTime() + 86400000);
    const overdueMs = now.getTime() - paidUntil.getTime();
    const isDelinquent = overdueMs > 0;
    const overdueDays = isDelinquent ? Math.ceil(overdueMs / 86400000) : 0;
    const delinquentWld = overdueDays * dailyTaxWld;
    const gracePeriodEnd = new Date(paidUntil.getTime() + 7 * 86400000);
    const isForeclosureReady = overdueDays > 7;

    return {
      spaceId: row.id,
      spaceType: row.space_type,
      spaceName: row.name,
      dailyTaxWld,
      taxPaidUntil: paidUntil,
      isDelinquent,
      overdueDays,
      delinquentWld,
      gracePeriodEnd,
      isForeclosureReady,
      estimatedForeclosurePrice,
    };
  }

  async payPropertyTax(
    actorUserId: string,
    spaceId: string,
    days: number,
    idempotencyKey: string,
  ): Promise<PayPropertyTaxResult> {
    if (!UUID_REGEX.test(actorUserId)) throw new SpaceInputError('actorUserId must be a valid UUID');
    if (!UUID_REGEX.test(spaceId)) throw new SpaceInputError('spaceId must be a valid UUID');
    if (!UUID_REGEX.test(idempotencyKey)) throw new SpaceInputError('idempotencyKey must be a valid UUID');
    if (!Number.isSafeInteger(days) || days < 1 || days > 30) {
      throw new SpaceInputError('days must be an integer between 1 and 30');
    }

    const row = await queryOne<{
      receipt_id: string;
      space_id: string;
      days_paid: number;
      total_wld: string;
      new_paid_until: Date;
      paid_at: Date;
    }>(
      this.client,
      `SELECT receipt_id, space_id, days_paid, total_wld, new_paid_until, paid_at
       FROM public.space_pay_property_tax($1::uuid, $2::uuid, $3::integer, $4::uuid);`,
      [actorUserId, spaceId, days, idempotencyKey],
    );

    if (!row) throw new Error('failed to pay property tax');

    return {
      receiptId: row.receipt_id,
      spaceId: row.space_id,
      daysPaid: row.days_paid,
      totalWld: Number(row.total_wld),
      newPaidUntil: row.new_paid_until,
      paidAt: row.paid_at,
      burnCode: 'SINK_PROPERTY_TAX',
    };
  }

  async listDelinquencies(): Promise<DelinquentSpaceRow[]> {
    const rows = await queryRows<{
      space_id: string;
      owner_user_id: string;
      owner_display_name: string;
      space_type: string;
      space_name: string;
      tax_paid_until: Date | null;
      created_at: Date;
    }>(
      this.client,
      `SELECT
         s.id AS space_id,
         s.user_id AS owner_user_id,
         COALESCE(i.display_name, '시민') AS owner_display_name,
         s.space_type,
         s.name AS space_name,
         s.tax_paid_until,
         s.created_at
       FROM public.user_spaces s
       LEFT JOIN LATERAL (
         SELECT display_name FROM public.identities WHERE user_id = s.user_id ORDER BY linked_at LIMIT 1
       ) i ON true
       WHERE (COALESCE(s.tax_paid_until, s.created_at + interval '1 day') < pg_catalog.clock_timestamp())
       ORDER BY s.tax_paid_until ASC
       LIMIT 100;`,
      [],
    );

    const now = new Date();
    return rows.map((r) => {
      const dailyTaxWld = DAILY_TAX_MAP[r.space_type] ?? 50;
      const basePrice = BASE_PRICE_MAP[r.space_type] ?? 25000;
      const foreclosureStartPrice = Math.floor(basePrice * 0.5);

      const paidUntil = r.tax_paid_until ? new Date(r.tax_paid_until) : new Date(r.created_at.getTime() + 86400000);
      const overdueMs = now.getTime() - paidUntil.getTime();
      const overdueDays = Math.max(1, Math.ceil(overdueMs / 86400000));
      const delinquentWld = overdueDays * dailyTaxWld;
      const status: 'DELINQUENT_GRACE' | 'FORECLOSURE_AUCTION' =
        overdueDays > 7 ? 'FORECLOSURE_AUCTION' : 'DELINQUENT_GRACE';

      return {
        spaceId: r.space_id,
        ownerUserId: r.owner_user_id,
        ownerDisplayName: r.owner_display_name,
        spaceType: r.space_type,
        spaceName: r.space_name,
        dailyTaxWld,
        overdueDays,
        delinquentWld,
        foreclosureStartPrice,
        status,
      };
    });
  }
}
