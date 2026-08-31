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
 * Two surfaces, on purpose.
 *
 * `items` and `purchases` are the 009 shop the current page reads. The
 * `catalog` and `holdings` routes below are the catalogue of migrations
 * 071-075, which until now nothing could reach. They share a controller
 * because they are one noun to a member, and nothing else.
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

  /**
   * The three codes mean three different things to a member and would
   * otherwise arrive as one conflict: 22023 is a request the rules refuse,
   * 28000 is a receipt belonging to somebody else, and anything else is a
   * fault that must reach the logs as a 500 rather than be reported as their
   * mistake.
   */
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

  /**
   * Deliberately unguarded: the catalogue is public in the original, and a
   * visitor deciding whether to join can see what the shop sells. Only the
   * purchase paths below carry a session.
   */
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

  /**
   * Guarded, unlike `items` above, because `shop_catalog_list` takes an actor
   * and there is no anonymous caller to give it. Inventing one -- a null, a
   * fixed uuid -- to keep the route open would put a value the schema asks
   * for into a SECURITY DEFINER read that no member owns.
   */
  @Get('catalog')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
  @ApiOperation({ summary: 'The catalogue with prices, stock, purchase limits and upkeep' })
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

  /**
   * A missing item, an inactive one, one whose sale window has closed, one out
   * of stock and one already held to its limit all answer 409. They are one
   * fact to a member -- this cannot be bought now -- and the catalogue is the
   * only place the reason belongs.
   */
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

  /**
   * The way out of a suspension.
   *
   * 104 charges the weekly upkeep on a Monday and suspends a holding whose
   * arrears reach the four-week ceiling of specification 16.4. Without this
   * the only way back would be to wait for the next Monday, which turns a
   * capped debt into a week of a bought item not working -- and 16.4 is the
   * returning-member section, where restarting promptly is the whole point.
   *
   * Nothing outstanding and too little cash are both 409: they are one fact
   * to a member, and the catalogue is where the reason belongs.
   */
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
