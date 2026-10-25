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
  @ApiOperation({ summary: 'Create a new live English auction' })
  createAuction(@Req() request: RequestWithSession, @Body() body: CreateAuctionDto) {
    return this.guarded(
      () => this.marketplaceService.createAuction(requireUserId(request), body),
      'failed to create auction',
    );
  }

  @Post('auctions/:id/bid')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Bid on a live English auction with escrow and anti-sniping extension' })
  bidAuction(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) auctionId: string,
    @Body() body: BidAuctionDto,
  ) {
    return this.guarded(
      () => this.marketplaceService.bidAuction(requireUserId(request), auctionId, body.bidAmountWld, body.maxProxyBidWld),
      'failed to bid on auction',
    );
  }

  // --- P2P Direct Trades ---
  // A direct SQL status update is not an escrow or a financial receipt.
  // Keep the authenticated/CSRF-protected route surface explicit and closed.
  private holdDirectTrade(request: RequestWithSession): never {
    requireUserId(request);
    throw new ServiceUnavailableException(
      'P2P direct trades are unavailable until atomic ledger settlement is verified',
    );
  }

  @Get('trades')
  @ApiOperation({ summary: 'P2P direct trades unavailable pending ledger certification' })
  listTrades(@Req() request: RequestWithSession) {
    return this.holdDirectTrade(request);
  }

  @Post('trades')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'P2P trade proposal unavailable pending ledger certification' })
  createTrade(@Req() request: RequestWithSession, @Body() _body: CreateTradeDto) {
    return this.holdDirectTrade(request);
  }

  @Post('trades/:id/accept')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'P2P acceptance unavailable pending ledger certification' })
  acceptTrade(@Req() request: RequestWithSession, @Param('id', ParseUUIDPipe) _tradeId: string) {
    return this.holdDirectTrade(request);
  }

  @Post('trades/:id/confirm')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'P2P swap unavailable pending ledger certification' })
  confirmTrade(@Req() request: RequestWithSession, @Param('id', ParseUUIDPipe) _tradeId: string) {
    return this.holdDirectTrade(request);
  }

  @Post('trades/:id/cancel')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'P2P cancellation unavailable pending ledger certification' })
  cancelTrade(@Req() request: RequestWithSession, @Param('id', ParseUUIDPipe) _tradeId: string) {
    return this.holdDirectTrade(request);
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
  @ApiOperation({ summary: 'Request system provenance appraisal for collectible with fee burn' })
  requestAppraisal(@Req() request: RequestWithSession, @Body() body: RequestAppraisalDto) {
    return this.guarded(
      () => this.marketplaceService.requestAppraisal(requireUserId(request), body),
      'failed to request appraisal',
    );
  }
}

