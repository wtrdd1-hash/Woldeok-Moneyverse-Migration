import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  Inject,
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
  BankBondPurchaseDto,
  BankBorrowSmartDto,
  BankRepayDto,
  BankTransferDto,
  IdempotentDto,
} from './bank.dto';
import { BankInputError, BankRepository } from './bank.repository';

@ApiTags('banking')
@Controller('banking')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
export class BankController {
  constructor(@Inject(BankRepository) private readonly bank: BankRepository | null) {}

  private repository(): BankRepository {
    if (!this.bank) throw new ServiceUnavailableException('bank service is unavailable');
    return this.bank;
  }

  private async guarded<T>(work: () => Promise<T>, conflictMessage: string): Promise<T> {
    try {
      return await work();
    } catch (error: unknown) {
      if (error instanceof BankInputError) throw new BadRequestException(error.message);
      if (isAuthorizationFailure(error)) throw new ForbiddenException('this is not yours');
      if (isExpectedCommandFailure(error)) {
        const msg = error instanceof Error && error.message ? error.message : conflictMessage;
        throw new ConflictException(msg);
      }
      throw error;
    }
  }

  @Get('standing')
  @ApiOperation({ summary: 'Bank overview: cash, deposit balance, compound interest, loans, bonds' })
  standing(@Req() request: RequestWithSession) {
    return this.guarded(
      () => this.repository().getStanding(requireUserId(request)),
      'failed to load bank standing',
    );
  }

  @Post('deposit')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Deposit WLD cash into bank compound interest deposit account' })
  deposit(@Req() request: RequestWithSession, @Body() body: BankTransferDto) {
    return this.guarded(
      () =>
        this.repository().moveBalance(
          body.idempotencyKey,
          requireUserId(request),
          'deposit',
          body.amount,
        ),
      'failed to deposit WLD into bank',
    );
  }

  @Post('withdraw')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Withdraw WLD from bank deposit account to cash' })
  withdraw(@Req() request: RequestWithSession, @Body() body: BankTransferDto) {
    return this.guarded(
      () =>
        this.repository().moveBalance(
          body.idempotencyKey,
          requireUserId(request),
          'withdraw',
          body.amount,
        ),
      'failed to withdraw WLD from bank',
    );
  }

  @Post('claim-interest')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Claim accrued compound deposit interest into bank balance' })
  claimInterest(@Req() request: RequestWithSession, @Body() body: IdempotentDto) {
    return this.guarded(
      () =>
        this.repository().claimCompoundInterest(body.idempotencyKey, requireUserId(request)),
      'failed to claim compound interest',
    );
  }

  @Post('borrow')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Borrow smart credit loan evaluated by job level and business value' })
  borrow(@Req() request: RequestWithSession, @Body() body: BankBorrowSmartDto) {
    return this.guarded(
      () =>
        this.repository().borrowSmart(
          body.idempotencyKey,
          requireUserId(request),
          body.amount,
        ),
      'failed to issue smart bank loan',
    );
  }

  @Post('repay')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Repay active bank loan' })
  repay(
    @Req() request: RequestWithSession,
    @Body() body: BankRepayDto,
  ) {
    return this.guarded(
      () =>
        this.repository().repayLoan(
          body.idempotencyKey,
          requireUserId(request),
          body.loanId,
          body.amount,
        ),
      'failed to repay loan',
    );
  }

  @Post('bonds/purchase')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Purchase 7-day or 30-day virtual government bonds' })
  purchaseBond(@Req() request: RequestWithSession, @Body() body: BankBondPurchaseDto) {
    return this.guarded(
      () =>
        this.repository().purchaseBond(
          body.idempotencyKey,
          requireUserId(request),
          body.bondCode,
          body.amount,
        ),
      'failed to purchase virtual bond',
    );
  }

  @Post('bonds/:id/redeem')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Redeem matured virtual bond and payout principal with yield' })
  redeemBond(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) bondId: string,
    @Body() body: IdempotentDto,
  ) {
    return this.guarded(
      () => this.repository().redeemBond(body.idempotencyKey, requireUserId(request), bondId),
      'failed to redeem virtual bond',
    );
  }
}
