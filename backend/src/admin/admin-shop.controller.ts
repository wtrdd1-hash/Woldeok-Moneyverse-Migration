import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';
import { isExpectedCommandFailure, isRoleRefusal } from '../core/pg-error';
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

interface AdminShopUpdateBody {
  readonly base_price?: string | number;
  readonly active?: boolean;
  readonly current_stock?: number | null;
}

function positiveIntegerText(value: unknown): string | null {
  const text = typeof value === 'number' ? String(value) : typeof value === 'string' ? value.trim() : '';
  return /^[1-9]\d*$/.test(text) ? text : null;
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
  async listItems(@Req() request: RequestWithSession): Promise<{ items: AdminShopItemRow[] }> {
    try {
      const items = await queryRows<AdminShopItemRow>(
        this.getPool(),
        `SELECT
           id::text AS id, code, name, description, category,
           base_price::text AS base_price, rarity, animation_css, preview_data,
           max_stock, current_stock, is_limited, active, purchase_limit, created_at
         FROM public.admin_shop_items($1)`,
        [requireUserId(request)],
      );
      return { items };
    } catch (error) {
      if (isRoleRefusal(error)) throw new ForbiddenException('administrator role required');
      throw error;
    }
  }

  @Patch('items/:id')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Update price, active status, or stock of a catalog item' })
  async updateItem(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: AdminShopUpdateBody,
  ) {
    const updatePrice = body.base_price !== undefined;
    const updateActive = body.active !== undefined;
    const updateStock = body.current_stock !== undefined;
    if (!updatePrice && !updateActive && !updateStock) {
      throw new BadRequestException('No update parameters provided');
    }

    const price = updatePrice ? positiveIntegerText(body.base_price) : null;
    if (updatePrice && price === null) {
      throw new BadRequestException('base_price must be a positive integer');
    }

    if (
      updateStock &&
      body.current_stock !== null &&
      (!Number.isSafeInteger(body.current_stock) || (body.current_stock ?? 0) < 0)
    ) {
      throw new BadRequestException('current_stock must be null or a non-negative integer');
    }

    try {
      const result = await queryOne<{ id: string; name: string; base_price: string; active: boolean }>(
        this.getPool(),
        `SELECT id::text, name, base_price::text, active
         FROM public.admin_shop_update_item($1,$2,$3::bigint,$4,$5,$6,$7,$8)`,
        [
          requireUserId(request),
          id,
          price,
          updateActive ? body.active : null,
          updateStock ? body.current_stock : null,
          updatePrice,
          updateActive,
          updateStock,
        ],
      );
      if (!result) throw new BadRequestException('Shop item not found');
      return { item: result };
    } catch (error) {
      if (isRoleRefusal(error)) throw new ForbiddenException('operator or superadmin role required');
      if (isExpectedCommandFailure(error)) throw new BadRequestException('shop item update rejected');
      throw error;
    }
  }
}
