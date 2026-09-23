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
  BidAuctionDto,
  BuyListingDto,
  CreateAuctionDto,
  CreateListingDto,
  CreateTradeDto,
  MarketplaceQueryDto,
  RequestAppraisalDto,
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

  // --- Auctions ---
  @Get('auctions')
  @ApiOperation({ summary: 'List active live English auctions' })
  listAuctions() {
    return this.guarded(
      () => this.marketplaceService.listAuctions(),
      'failed to load auctions',
    );
  }

  @Post('auctions')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Auction creation is disabled until item escrow and settlement are ledger-backed' })
  createAuction(@Req() _request: RequestWithSession, @Body() _body: CreateAuctionDto) {
    throw new ServiceUnavailableException(
      'auction writes are unavailable until item escrow, winner settlement, and ledger posting are implemented',
    );
  }

  @Post('auctions/:id/bid')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Auction bidding is disabled until item escrow and settlement are ledger-backed' })
  bidAuction(
    @Req() _request: RequestWithSession,
    @Param('id', ParseUUIDPipe) _auctionId: string,
    @Body() _body: BidAuctionDto,
  ) {
    throw new ServiceUnavailableException(
      'auction writes are unavailable until item escrow, winner settlement, and ledger posting are implemented',
    );
  }

  // --- P2P Direct Trades ---
  @Get('trades')
  @ApiOperation({ summary: 'List my P2P direct trades' })
  listTrades(@Req() request: RequestWithSession) {
    return this.guarded(
      () => this.marketplaceService.listTrades(requireUserId(request)),
      'failed to load trades',
    );
  }

  @Post('trades')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Direct trade creation is disabled until atomic asset settlement is implemented' })
  createTrade(@Req() _request: RequestWithSession, @Body() _body: CreateTradeDto) {
    throw new ServiceUnavailableException(
      'direct trade settlement is unavailable until atomic WLD and item transfer is implemented',
    );
  }

  @Post('trades/:id/accept')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Direct trade acceptance is disabled until atomic asset settlement is implemented' })
  acceptTrade(@Req() _request: RequestWithSession, @Param('id', ParseUUIDPipe) _tradeId: string) {
    throw new ServiceUnavailableException(
      'direct trade settlement is unavailable until atomic WLD and item transfer is implemented',
    );
  }

  @Post('trades/:id/confirm')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Direct trade confirmation is disabled until atomic asset settlement is implemented' })
  confirmTrade(@Req() _request: RequestWithSession, @Param('id', ParseUUIDPipe) _tradeId: string) {
    throw new ServiceUnavailableException(
      'direct trade settlement is unavailable until atomic WLD and item transfer is implemented',
    );
  }

  @Post('trades/:id/cancel')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Cancel a P2P 1:1 direct trade' })
  cancelTrade(@Req() request: RequestWithSession, @Param('id', ParseUUIDPipe) tradeId: string) {
    return this.guarded(
      () => this.marketplaceService.cancelTrade(requireUserId(request), tradeId),
      'failed to cancel trade',
    );
  }

  // --- Appraisals ---
  @Get('appraisals')
  @ApiOperation({ summary: 'List my issued provenance appraisal certificates' })
  listAppraisals(@Req() request: RequestWithSession) {
    return this.guarded(
      () => this.marketplaceService.listAppraisals(requireUserId(request)),
      'failed to load appraisals',
    );
  }

  @Post('appraisals')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Appraisal issuance is disabled until ownership, provenance, and fee ledger checks are implemented' })
  requestAppraisal(@Req() _request: RequestWithSession, @Body() _body: RequestAppraisalDto) {
    throw new ServiceUnavailableException(
      'appraisal issuance is unavailable until ownership, provenance, and ledger-backed fee settlement are implemented',
    );
  }
}

