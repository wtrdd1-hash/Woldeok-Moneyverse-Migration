import { Controller, Get, Post, Put, Header, ServiceUnavailableException, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';

/** No authoritative proposal/voter/settlement PostgreSQL function exists yet. */
@ApiTags('treasury')
@Controller('treasury/citizen-proposals')
export class TreasuryProposalsController {
  private unavailable(): never {
    throw new ServiceUnavailableException('verified treasury proposal ledger is unavailable');
  }

  @Get()
  @Header('Cache-Control', 'private, no-store')
  @ApiOperation({ summary: 'Read verified citizen treasury proposals (unavailable until DB contract)' })
  list(): never { return this.unavailable(); }

  @Post()
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
  @Header('Cache-Control', 'private, no-store')
  @ApiOperation({ summary: 'Submit verified citizen treasury proposal (disabled pending DB contract)' })
  propose(): never { return this.unavailable(); }

  @Put()
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
  @Header('Cache-Control', 'private, no-store')
  @ApiOperation({ summary: 'Vote on verified citizen treasury proposal (disabled pending DB contract)' })
  vote(): never { return this.unavailable(); }
}
