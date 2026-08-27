import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
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
import { isAuthorizationFailure, isExpectedCommandFailure } from '../core/pg-error';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { BankMovementDto, BorrowDto, ClaimDto, RepayDto, TransferDto } from './wallet.dto';
import { WalletInputError } from './wallet.repository';
import { WalletRecipientError, WalletService } from './wallet.service';

/**
 * Guard order is semantic, not cosmetic. SessionGuard resolves the session
 * onto the request; every guard after it reads what it attached, and
 * CsrfGuard cannot verify a token without a session id. Reordering these
 * changes which failure a caller sees, and can let a write through unchecked.
 */
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
      if (error instanceof WalletInputError) throw new BadRequestException(error.message);
      if (error instanceof WalletRecipientError) {
        throw new NotFoundException('recipient is unavailable');
      }
      if (isAuthorizationFailure(error)) throw new BadRequestException(conflictMessage);
      if (isExpectedCommandFailure(error)) throw new ConflictException(conflictMessage);
      throw error;
    }
  }

  @Get('wallet')
  @ApiOperation({ summary: 'Balances and recent ledger entries for the caller' })
  overview(@Req() request: RequestWithSession) {
    return this.service().overview(requireUserId(request));
  }

  @Get('bank/loans')
  @ApiOperation({ summary: 'Outstanding loans for the caller' })
  async loans(@Req() request: RequestWithSession) {
    return { loans: await this.service().loans(requireUserId(request)) };
  }

  @Post('wallet/transfers')
  @ApiOperation({ summary: 'Send WLD to another member' })
  transfer(@Req() request: RequestWithSession, @Body() body: TransferDto) {
    return this.guarded(
      () => this.service().transfer(requireUserId(request), { ...body }),
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
  @ApiOperation({ summary: 'Claim the work reward' })
  claimWork(@Req() request: RequestWithSession, @Body() body: ClaimDto) {
    return this.guarded(
      () => this.service().claimWork(requireUserId(request), { ...body }),
      'this wallet action cannot be completed now',
    );
  }
}
