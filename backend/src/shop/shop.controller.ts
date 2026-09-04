import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { isAuthorizationFailure, isExpectedCommandFailure } from '../core/pg-error';
import {
  CatalogPurchaseDto,
  ItemConsumptionDto,
  PurchaseDto,
  UpkeepSettlementDto,
} from './shop.dto';
import { ShopCatalogRepository, ShopInputError } from './shop.repository';
import { ShopItemUnavailableError, ShopService } from './shop.service';

/**
 * ShopController for Store 2.0 & Cosmetics
 */
@ApiTags('shop')
@Controller('shop')
export class ShopController {
  constructor(
    @Inject(ShopService) private readonly shop: ShopService | null,
    @Inject(ShopCatalogRepository) private readonly catalogue: ShopCatalogRepository | null,
  ) {}

  private service(): ShopService {
    if (!this.shop) throw new ServiceUnavailableException('shop service is unavailable');
    return this.shop;
  }

  private repository(): ShopCatalogRepository {
    if (!this.catalogue) throw new ServiceUnavailableException('shop catalogue is unavailable');
    return this.catalogue;
  }

  private async guarded<T>(work: () => Promise<T>, conflictMessage: string): Promise<T> {
    try {
      return await work();
    } catch (error: unknown) {
      if (error instanceof ShopInputError) throw new BadRequestException(error.message);
      if (isAuthorizationFailure(error)) throw new ForbiddenException('this receipt is not yours');
      if (isExpectedCommandFailure(error)) throw new ConflictException(conflictMessage);
      throw error;
    }
  }

  @Get('items')
  @ApiOperation({ summary: 'Items currently on sale' })
  async items() {
    return { items: await this.service().catalog() };
  }

  @Get('purchases')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
  @ApiOperation({ summary: 'Purchases made by the caller' })
  async purchases(@Req() request: RequestWithSession) {
    return { purchases: await this.service().myPurchases(requireUserId(request)) };
  }

  @Post('items/:id/purchases')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
  @ApiOperation({ summary: 'Buy an item' })
  async purchase(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) itemId: string,
    @Body() body: PurchaseDto,
  ) {
    try {
      return await this.service().purchase(requireUserId(request), {
        itemId,
        idempotencyKey: body.idempotencyKey,
      });
    } catch (error: unknown) {
      if (error instanceof ShopItemUnavailableError) {
        throw new NotFoundException('item is unavailable');
      }
      if (error instanceof ShopInputError) {
        throw new BadRequestException('invalid shop purchase request');
      }
      if (isExpectedCommandFailure(error)) {
        throw new ConflictException('this shop purchase cannot be completed now');
      }
      throw error;
    }
  }

  @Get('public-catalog')
  @ApiOperation({ summary: 'The catalogue with prices, stock and cosmetics for public browsing' })
  async publicCatalog() {
    return {
      catalogItems: await this.guarded(
        () => this.repository().catalog(null),
        'the catalogue is unavailable',
      ),
    };
  }

  @Get('catalog')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
  @ApiOperation({ summary: 'The catalogue with prices, stock, purchase limits and cosmetics' })
  async catalog(@Req() request: RequestWithSession) {
    return {
      catalogItems: await this.guarded(
        () => this.repository().catalog(requireUserId(request)),
        'the catalogue is unavailable',
      ),
    };
  }

  @Get('holdings')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
  @ApiOperation({ summary: 'Catalogue items the caller holds' })
  async holdings(@Req() request: RequestWithSession) {
    return {
      holdings: await this.guarded(
        () => this.repository().holdings(requireUserId(request)),
        'held items are unavailable',
      ),
    };
  }

  @Post('catalog/:id/purchases')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
  @ApiOperation({ summary: 'Buy a catalogue item' })
  async purchaseCatalogItem(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) catalogId: string,
    @Body() body: CatalogPurchaseDto,
  ) {
    return this.guarded(
      () =>
        this.repository().purchase(
          body.idempotencyKey,
          requireUserId(request),
          catalogId,
          body.quantity,
        ),
      'this item cannot be bought now',
    );
  }

  @Post('holdings/:id/equip')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
  @ApiOperation({ summary: 'Equip or unequip a held cosmetic item' })
  async equipItem(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) catalogId: string,
    @Body() body: { slot?: string; equip?: boolean },
  ) {
    return this.guarded(
      () =>
        this.repository().equipItem(
          requireUserId(request),
          catalogId,
          body.slot,
          body.equip !== false,
        ),
      'failed to equip or unequip item',
    );
  }

  @Get('cosmetics/:userId')
  @ApiOperation({ summary: 'Get active cosmetics equipped by a user' })
  async getCosmetics(@Param('userId', ParseUUIDPipe) userId: string) {
    return {
      cosmetics: await this.repository().getCosmetics(userId),
    };
  }

  @Post('holdings/:id/consumptions')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
  @ApiOperation({ summary: 'Consume one held item' })
  async consumeItem(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) catalogId: string,
    @Body() body: ItemConsumptionDto,
  ) {
    return this.guarded(
      () => this.repository().use(body.idempotencyKey, requireUserId(request), catalogId),
      'this item cannot be used now',
    );
  }

  @Post('holdings/:id/upkeep-settlements')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
  @ApiOperation({ summary: 'Pay the outstanding weekly upkeep on one held item' })
  async settleUpkeep(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) catalogId: string,
    @Body() body: UpkeepSettlementDto,
  ) {
    return this.guarded(
      () => this.repository().settleUpkeep(body.idempotencyKey, requireUserId(request), catalogId),
      'this upkeep cannot be settled now',
    );
  }
}
