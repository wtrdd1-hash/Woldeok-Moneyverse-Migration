import {
  BadRequestException,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import {
  AccountIdentityUnavailableError,
  AccountLastIdentityError,
  AccountService,
  AccountUnavailableError,
} from './account.service';

/**
 * Reading which sign-in methods are linked needs only a session. Removing one,
 * or deleting the account, additionally needs ReauthGuard: the caller must
 * have proved control of an OAuth identity within the last 900 seconds.
 *
 * That is what stops a borrowed session from dismantling an account, and it
 * is why these two are the only routes in the application carrying that guard.
 */
@ApiTags('account')
@Controller('account')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
export class AccountController {
  constructor(@Inject(AccountService) private readonly account: AccountService | null) {}

  private service(): AccountService {
    if (!this.account) throw new ServiceUnavailableException('account service is unavailable');
    return this.account;
  }

  @Get('identities')
  @ApiOperation({ summary: 'Sign-in methods linked to the caller' })
  async identities(@Req() request: RequestWithSession) {
    return { identities: await this.service().linkedIdentities(requireUserId(request)) };
  }

  @Delete('identities/:id')
  @UseGuards(CsrfGuard, ReauthGuard)
  @ApiOperation({ summary: 'Unlink a sign-in method' })
  async unlink(@Req() request: RequestWithSession, @Param('id', ParseUUIDPipe) identityId: string) {
    try {
      return await this.service().unlinkIdentity(requireUserId(request), { identityId });
    } catch (error: unknown) {
      if (error instanceof AccountIdentityUnavailableError) {
        throw new NotFoundException('OAuth identity is unavailable');
      }
      // Removing the last sign-in method would lock the member out of their
      // own account, so the service refuses rather than letting it happen.
      if (error instanceof AccountLastIdentityError) {
        throw new ConflictException('at least one sign-in method must remain');
      }
      if (error instanceof AccountUnavailableError) {
        throw new BadRequestException('account is unavailable');
      }
      throw error;
    }
  }

  @Delete()
  @HttpCode(202)
  @UseGuards(CsrfGuard, ReauthGuard)
  @ApiOperation({ summary: 'Delete the caller account' })
  async remove(@Req() request: RequestWithSession) {
    try {
      return await this.service().softDeleteAccount(requireUserId(request));
    } catch (error: unknown) {
      if (error instanceof AccountUnavailableError) {
        throw new BadRequestException('account is unavailable');
      }
      throw error;
    }
  }
}
