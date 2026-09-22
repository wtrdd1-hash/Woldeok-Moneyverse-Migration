import {
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
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
  BuyListingDto,
  CreateListingDto,
  MarketplaceQueryDto,
} from './marketplace.dto';
import { MarketplaceService } from './marketplace.service';

@ApiTags('marketplace')
@Controller('marketplace')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  private async guarded<T>(work: () => Promise<T>, conflictMessage: string): Promise<T> {
    try {
      return await work();
    } catch (error: unknown) {
      if (isAuthorizationFailure(error)) throw new ForbiddenException('this is not yours');
      if (isExpectedCommandFailure(error)) {
        const msg = error instanceof Error && error.message ? error.message : conflictMessage;
        throw new ConflictException(msg);
      }
      throw error;
    }
  }

  @Get('listings')
  @ApiOperation({ summary: 'List active player marketplace listings with filter and search' })
  listListings(@Query() query: MarketplaceQueryDto) {
    return this.guarded(
      () => this.marketplaceService.listListings(query),
      'failed to load marketplace listings',
    );
  }

  @Get('my-listings')
  @ApiOperation({ summary: 'List current user marketplace listings and trade history' })
  listMyListings(@Req() request: RequestWithSession) {
    return this.guarded(
      () => this.marketplaceService.listMyListings(requireUserId(request)),
      'failed to load my marketplace listings',
    );
  }

  @Post('listings')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'List an item for sale in player marketplace with escrow lock' })
  createListing(@Req() request: RequestWithSession, @Body() body: CreateListingDto) {
    return this.guarded(
      () =>
        this.marketplaceService.createListing(
          requireUserId(request),
          body.itemCode,
          body.quantity,
          body.price,
          body.idempotencyKey,
          body.description,
        ),
      'failed to create marketplace listing',
    );
  }

  @Post('listings/:id/buy')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Buy a marketplace listing item with 1% burn fee and 99% seller settlement' })
  buyListing(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) listingId: string,
    @Body() body: BuyListingDto,
  ) {
    return this.guarded(
      () =>
        this.marketplaceService.buyListing(
          requireUserId(request),
          listingId,
          body.idempotencyKey,
        ),
      'failed to buy marketplace listing',
    );
  }

  @Post('listings/:id/cancel')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Cancel active marketplace listing and recover item to inventory' })
  cancelListing(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) listingId: string,
  ) {
    return this.guarded(
      () => this.marketplaceService.cancelListing(requireUserId(request), listingId),
      'failed to cancel marketplace listing',
    );
  }
}
