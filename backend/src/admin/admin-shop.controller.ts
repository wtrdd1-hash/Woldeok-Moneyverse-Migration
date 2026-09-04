import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';
import { PG_POOL } from '../core/pool.provider';

interface AdminShopItemRow {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly base_price: string;
  readonly rarity: string;
  readonly animation_css: string | null;
  readonly preview_data: Record<string, unknown>;
  readonly max_stock: number | null;
  readonly current_stock: number | null;
  readonly is_limited: boolean;
  readonly active: boolean;
  readonly purchase_limit: string;
  readonly created_at: Date;
}

@ApiTags('admin')
@Controller('admin/shop')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard, AdminSessionGuard)
export class AdminShopController {
  constructor(@Inject(PG_POOL) private readonly pool: Queryable | null) {}

  private getPool(): Queryable {
    if (!this.pool) throw new Error('Database pool is not available');
    return this.pool;
  }

  @Get('items')
  @ApiOperation({ summary: 'List all items in the catalog for admin inspection' })
  async listItems(): Promise<{ items: AdminShopItemRow[] }> {
    const items = await queryRows<AdminShopItemRow>(
      this.getPool(),
      `SELECT
         id::text AS id,
         code,
         name,
         description,
         category,
         base_price::text AS base_price,
         rarity,
         animation_css,
         preview_data,
         max_stock,
         current_stock,
         is_limited,
         active,
         purchase_limit,
         created_at
       FROM public.shop_catalog
       ORDER BY 
         CASE category
           WHEN 'frame' THEN 1
           WHEN 'background' THEN 2
           WHEN 'effect' THEN 3
           WHEN 'nameplate' THEN 4
           WHEN 'title' THEN 5
           WHEN 'badge' THEN 6
           WHEN 'season' THEN 7
           WHEN 'limited' THEN 8
           WHEN 'business' THEN 9
           WHEN 'convenience' THEN 10
           ELSE 11
         END,
         base_price ASC, code ASC`,
    );
    return { items };
  }

  @Patch('items/:id')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Update price, active status, or stock of a catalog item' })
  async updateItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { base_price?: string | number; active?: boolean; current_stock?: number | null },
  ) {
    const updates: string[] = [];
    const values: unknown[] = [id];
    let index = 2;

    if (body.base_price !== undefined) {
      const price = Number(body.base_price);
      if (isNaN(price) || price <= 0) {
        throw new BadRequestException('base_price must be a positive integer');
      }
      updates.push(`base_price = $${index++}`);
      values.push(price);
    }

    if (body.active !== undefined) {
      updates.push(`active = $${index++}`);
      values.push(Boolean(body.active));
    }

    if (body.current_stock !== undefined) {
      updates.push(`current_stock = $${index++}`);
      values.push(body.current_stock === null ? null : Number(body.current_stock));
    }

    if (updates.length === 0) {
      throw new BadRequestException('No update parameters provided');
    }

    updates.push(`updated_at = clock_timestamp()`);

    const result = await queryOne<{ id: string; name: string; base_price: string; active: boolean }>(
      this.getPool(),
      `UPDATE public.shop_catalog
       SET ${updates.join(', ')}
       WHERE id = $1
       RETURNING id::text, name, base_price::text, active`,
      values,
    );

    if (!result) {
      throw new NotFoundException('Shop item not found');
    }

    return { item: result };
  }
}
