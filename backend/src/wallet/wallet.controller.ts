import {
  Query,
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  GoneException,
  Header,
  Inject,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { isAuthorizationFailure, isExpectedCommandFailure } from '../core/pg-error';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireSession, requireUserId } from '../auth/session.context';
import { BankMovementDto, BorrowDto, ClaimDto, P2PTransferDto, RepayDto, TransferDto } from './wallet.dto';
import { WalletInputError } from './wallet.repository';
import { WalletActivityCursorExpired } from './wallet-activity-cursor';
import { WalletRecipientError, WalletService, WalletTransactionNotFoundError, type WalletOverviewOptions } from './wallet.service';

/**
 * Guard order is semantic, not cosmetic. SessionGuard resolves the session
 * onto the request; every guard after it reads what it attached, and
 * CsrfGuard cannot verify a token without a session id. Reordering these
 * changes which failure a caller sees, and can let a write through unchecked.
 */
export class CitizenBudgetVoteDto {
  quarter!: string;
  choice!: string;
}

@ApiTags('wallet')
@Controller()
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)

export class WalletController {
  constructor(@Inject(WalletService) private readonly wallet: WalletService | null) {}

  private service(): WalletService {
    if (!this.wallet) throw new ServiceUnavailableException('wallet service is unavailable');
    return this.wallet;
  }

  /**
   * Translates a failure from a database function into an HTTP answer without
   * letting its detail through. An expected command failure — duplicate
   * idempotency key, exhausted balance, disabled reward policy — is a
   * conflict; anything else is a fault and rethrows so the problem filter
   * reports 500 and the cause reaches the logs.
   */
  private async guarded<T>(work: () => Promise<T>, conflictMessage: string): Promise<T> {
    try {
      return await work();
    } catch (error: unknown) {
      if (error instanceof WalletActivityCursorExpired) throw new GoneException('wallet activity cursor expired');
      if (error instanceof WalletInputError) throw new BadRequestException(error.message);
      if (error instanceof WalletRecipientError) {
        throw new NotFoundException('recipient is unavailable');
      }
      if (isAuthorizationFailure(error)) throw new BadRequestException(conflictMessage);
      if (isExpectedCommandFailure(error)) throw new ConflictException(conflictMessage);
      throw error;
    }
  }

  /**
   * `recent` decides how many ledger entries come back, 1 to 50.
   *
   * The wallet screen wants a handful under the balance and the activity page
   * wants the lot, and both are the same resource — a second endpoint would
   * be a second thing to keep in step with this one. The bound lives in the
   * service, so a value outside it is rejected there rather than turning into
   * an unbounded query.
   */
  @Get('wallet')
  @Header('Cache-Control', 'private, no-store')
  @ApiOperation({ summary: 'Balances and recent ledger entries for the caller' })
  overview(
    @Req() request: RequestWithSession,
    @Query('recent') recent?: string,
    @Query('period') period?: string,
    @Query('direction') direction?: string,
  ) {
    if (direction !== undefined && direction !== 'all' && direction !== 'in' && direction !== 'out' && direction !== 'neutral') {
      throw new BadRequestException('direction must be all, in, out or neutral');
    }
    const filteredDirection = direction === 'in' ? 'in' : direction === 'out' ? 'out' : direction === 'neutral' ? 'neutral' : undefined;
    if (period !== undefined && period !== 'all' && period !== '7d' && period !== '30d') {
      throw new BadRequestException('period must be all, 7d or 30d');
    }
    const periodDays: 7 | 30 | undefined = period === '7d' ? 7 : period === '30d' ? 30 : undefined;
    const filters: WalletOverviewOptions = {
      ...(periodDays ? { periodDays } : {}),
      ...(filteredDirection ? { direction: filteredDirection } : {}),
    };
    if (recent === undefined) {
      return this.service().overview(requireUserId(request), filters);
    }
    // Reject coercible non-decimal and duplicate query values before any DB read.
    // The service/repository enforce the same 1..50 bound for direct callers.
    if (typeof recent !== 'string' || !/^(?:[1-9]|[1-4][0-9]|50)$/.test(recent)) {
      throw new BadRequestException('recent must be a decimal integer between 1 and 50');
    }
    const parsed = Number(recent);
    if (!Number.isSafeInteger(parsed)) {
      throw new BadRequestException('recent must be a whole number');
    }
    return this.service().overview(requireUserId(request), { recentLimit: parsed, ...filters });
  }

  @Get('wallet/activity')
  @Header('Cache-Control', 'private, no-store')
  @Header('X-Robots-Tag', 'noindex')
  @ApiOperation({ summary: 'Read the caller wallet ledger in owner-bound cursor pages' })
  activity(
    @Req() request: RequestWithSession,
    @Query('period') period?: string,
    @Query('cursor') cursor?: string,
    @Query('direction') direction?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    if (period !== undefined && period !== 'all' && period !== '7d' && period !== '30d') {
      throw new BadRequestException('period must be all, 7d or 30d');
    }
    if (direction !== undefined && (typeof direction !== 'string' || !['all', 'in', 'out', 'neutral'].includes(direction))) {
      throw new BadRequestException('direction must be all, in, out or neutral');
    }
    if (cursor !== undefined && (typeof cursor !== 'string' || cursor.length > 2048)) {
      throw new BadRequestException('invalid wallet activity cursor');
    }
    return this.guarded(() => this.service().activityPage(requireUserId(request), requireSession(request).id,
      period === '7d' || period === '30d' ? period : 'all', cursor,
      direction === 'in' || direction === 'out' || direction === 'neutral' ? direction : 'all',
      ...(from !== undefined || to !== undefined ? [{ from, to }] : [])), 'wallet activity is unavailable');
  }

  @Get('wallet/activity/transactions/:transactionId')
  @Header('Cache-Control', 'private, no-store')
  @Header('X-Robots-Tag', 'noindex')
  @Header('Referrer-Policy', 'no-referrer')
  @ApiOperation({ summary: 'Read a single owner wallet transaction (not settlement evidence)' })
  async transactionDetail(@Req() request: RequestWithSession, @Param('transactionId') transactionId: string) {
    if (process.env.WALLET_TRANSACTION_DETAIL_ENABLED !== 'true') {
      throw new ServiceUnavailableException('wallet transaction detail is unavailable');
    }
    if (typeof transactionId !== 'string' ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(transactionId)) {
      throw new BadRequestException('invalid transaction id');
    }
    try {
      return await this.service().transactionDetail(requireUserId(request), transactionId);
    } catch (error: unknown) {
      if (error instanceof WalletTransactionNotFoundError) throw new NotFoundException('transaction not found');
      if (error instanceof BadRequestException) throw error;
      throw new ServiceUnavailableException('wallet transaction detail is unavailable');
    }
  }

  @Get('wallet/transfers/receipts/:key')
  @Header('Cache-Control', 'private, no-store')
  @ApiOperation({ summary: 'Fetch durable owner-only transfer receipt evidence by idempotency key' })
  async transferReceipt(
    @Req() request: RequestWithSession,
    @Param('key', new ParseUUIDPipe({ version: '4' })) idempotencyKey: string,
  ) {
    try {
      return await this.service().transferReceipt(requireUserId(request), idempotencyKey);
    } catch {
      // A missing/invalid ledger projection is not a failed transfer and must
      // not expose DB errors or induce a duplicate retry with a fresh key.
      throw new ServiceUnavailableException('transfer receipt evidence is unavailable');
    }
  }

  @Get('wallet/recipients/search')
  @Header('Cache-Control', 'private, no-store')
  @ApiOperation({ summary: 'Retired recipient name search; use exact recipient UUID', deprecated: true })
  searchRecipients(@Req() _request: RequestWithSession, @Query('query') _query?: string): never {
    throw new GoneException('recipient name search retired; use exact recipient UUID');
  }

  @Get('rewards/availability')
  @ApiOperation({ summary: 'Next eligible times for the caller reward controls' })
  rewardAvailability(@Req() request: RequestWithSession) {
    return this.service().rewardAvailability(requireUserId(request));
  }

  @Get('bank/loans')
  @Header('Cache-Control', 'private, no-store')
  @ApiOperation({ summary: 'Latest 20 owner bank loans, optionally filtered by status' })
  @ApiQuery({ name: 'status', required: false, enum: ['all', 'active', 'overdue', 'repaid'], description: 'Filter within the latest 20 owner loans' })
  async loans(@Req() request: RequestWithSession, @Query('status') status?: unknown) {
    if (status !== undefined && (typeof status !== 'string' || !['all', 'active', 'overdue', 'repaid'].includes(status))) {
      throw new BadRequestException('status must be all, active, overdue or repaid');
    }
    return { loans: await this.guarded(() => this.service().loans(requireUserId(request), status === undefined ? 'all' : status), 'loan status is unavailable') };
  }

  @Post('wallet/transfers')
  @ApiOperation({ summary: 'Send WLD to another member' })
  transfer(@Req() request: RequestWithSession, @Body() body: TransferDto) {
    return this.guarded(
      () => this.service().transfer(requireUserId(request), { ...body }),
      'this wallet action cannot be completed now',
    );
  }

  @Post('wallet/transfers/p2p')
  @ApiOperation({ summary: 'Send WLD to another member with custom thank-you note and sticker' })
  p2pTransfer(@Req() request: RequestWithSession, @Body() body: P2PTransferDto) {
    return this.guarded(
      () => this.service().p2pTransfer(requireUserId(request), { ...body }),
      'this wallet action cannot be completed now',
    );
  }


  @Post('bank/movements')
  @ApiOperation({ summary: 'Move balance between cash and bank' })
  bankMovement(@Req() request: RequestWithSession, @Body() body: BankMovementDto) {
    return this.guarded(
      () => this.service().bankMove(requireUserId(request), { ...body }),
      'bank transfer was rejected',
    );
  }

  @Post('bank/loans')
  @ApiOperation({ summary: 'Borrow from the virtual bank' })
  borrow(@Req() request: RequestWithSession, @Body() body: BorrowDto) {
    return this.guarded(
      () => this.service().borrow(requireUserId(request), { ...body }),
      'loan request was rejected',
    );
  }

  @Post('bank/loans/:id/repayments')
  @ApiOperation({ summary: 'Repay part or all of a loan' })
  repay(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) loanId: string,
    @Body() body: RepayDto,
  ) {
    return this.guarded(
      () => this.service().repayLoan(requireUserId(request), { loanId, ...body }),
      'loan repayment was rejected',
    );
  }

  @Post('rewards/daily/claims')
  @ApiOperation({ summary: 'Claim the daily reward' })
  claimDaily(@Req() request: RequestWithSession, @Body() body: ClaimDto) {
    return this.guarded(
      () => this.service().claimDaily(requireUserId(request), { ...body }),
      'this wallet action cannot be completed now',
    );
  }

  @Post('rewards/work/claims')
  @ApiOperation({ summary: 'Retired legacy work faucet; use professional work tasks', deprecated: true })
  claimWork() {
    throw new GoneException('legacy work reward retired; complete a professional task on /work');
  }

  @Get('wallet/tax-receipt')
  @ApiOperation({ summary: '시민 납세 투명성 영수증 조회 (1 WLD 단위 실시간 목적별 분배 추적)' })
  async getTaxReceipt(@Req() request: RequestWithSession) {
    const userId = requireUserId(request);
    return this.service().getCitizenTaxReceipt(userId);
  }

  @Post('wallet/governance/vote')
  @ApiOperation({ summary: '분기별 국고 예산안 우선순위 시민 거버넌스 투표 제출' })
  async voteBudget(@Req() request: RequestWithSession, @Body() body: CitizenBudgetVoteDto) {
    const userId = requireUserId(request);
    return this.service().voteCitizenBudget(userId, body.quarter || '2026-Q4', body.choice);
  }
}
