import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsString, IsUUID, Matches, MaxLength, MinLength } from 'class-validator';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { isExpectedCommandFailure } from '../core/pg-error';
import { contextOf } from '../core/request-context';
import { AbuseSecurityRepository } from './abuse-security.repository';

class PermanentSuspensionDto {
  @ApiProperty({ minLength: 3, maxLength: 1000 })
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  readonly reason!: string;
}

class AddressBlockDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;

  @ApiProperty({ example: '203.0.113.5/32' })
  @IsString()
  @MaxLength(64)
  @Matches(/^[0-9A-Fa-f:.]+(?:\/\d{1,3})?$/)
  readonly network!: string;

  @ApiProperty({ minLength: 3, maxLength: 1000 })
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  readonly reason!: string;
}

class LiftAddressBlockDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;

  @ApiProperty({ minLength: 3, maxLength: 1000 })
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  readonly reason!: string;
}

@ApiTags('admin-security')
@Controller('admin/security')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard, AdminSessionGuard)
export class AbuseSecurityController {
  constructor(
    @Inject(AbuseSecurityRepository)
    private readonly repository: AbuseSecurityRepository | null,
  ) {}

  private repo(): AbuseSecurityRepository {
    if (!this.repository) throw new ServiceUnavailableException('abuse security console is unavailable');
    return this.repository;
  }

  private async guarded<T>(work: () => Promise<T>): Promise<T> {
    try {
      return await work();
    } catch (error: unknown) {
      if (isExpectedCommandFailure(error)) {
        const detail = error instanceof Error ? error.message : 'security action was rejected';
        throw new BadRequestException(detail);
      }
      throw error;
    }
  }

  @Get('ip-blocks')
  @ApiOperation({ summary: 'List current and historical service IP blocks' })
  async ipBlocks(@Req() request: RequestWithSession) {
    return { blocks: await this.repo().ipBlocks(requireUserId(request)) };
  }

  @Post('ip-blocks')
  @UseGuards(CsrfGuard, ReauthGuard)
  @ApiOperation({ summary: 'Block an IP address or CIDR until manually lifted' })
  blockAddress(@Req() request: RequestWithSession, @Body() body: AddressBlockDto) {
    return this.guarded(() =>
      this.repo().blockAddress(
        body.idempotencyKey,
        requireUserId(request),
        body.network,
        body.reason,
      ),
    );
  }

  @Delete('ip-blocks/:id')
  @UseGuards(CsrfGuard, ReauthGuard)
  @ApiOperation({ summary: 'Lift a service IP block' })
  liftAddress(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) blockId: string,
    @Body() body: LiftAddressBlockDto,
  ) {
    return this.guarded(() =>
      this.repo().liftAddressBlock(
        body.idempotencyKey,
        requireUserId(request),
        blockId,
        body.reason,
      ),
    );
  }

  @Post('users/:id/permanent-suspension')
  @UseGuards(CsrfGuard, ReauthGuard)
  @ApiOperation({ summary: 'Permanently restrict a member and revoke all live sessions' })
  suspendMember(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() body: PermanentSuspensionDto,
  ) {
    return this.guarded(() =>
      this.repo().permanentSuspend(
        requireUserId(request),
        userId,
        body.reason,
        contextOf(request)?.requestId ?? null,
      ),
    );
  }
}
