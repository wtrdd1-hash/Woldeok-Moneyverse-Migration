import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { PRIVACY_REQUEST_TYPES, PrivacyRequestInputError } from './privacy.repository';
import { PrivacyRequestAccountUnavailableError, PrivacyRequestService } from './privacy.service';

/**
 * The allowed values come from PRIVACY_REQUEST_TYPES rather than a literal
 * list repeated here. The repository validates against the same constant, so
 * a type added there cannot be silently rejected by the DTO.
 */
export class CreatePrivacyRequestDto {
  @ApiProperty({ enum: PRIVACY_REQUEST_TYPES })
  @IsIn(PRIVACY_REQUEST_TYPES as string[])
  readonly requestType!: string;

  @ApiProperty({ required: false, maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  readonly detail?: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

@ApiTags('privacy')
@Controller('privacy/requests')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
export class PrivacyController {
  constructor(
    @Inject(PrivacyRequestService) private readonly privacy: PrivacyRequestService | null,
  ) {}

  private service(): PrivacyRequestService {
    if (!this.privacy) {
      throw new ServiceUnavailableException('privacy request service is unavailable');
    }
    return this.privacy;
  }

  @Get()
  @ApiOperation({ summary: 'Data subject requests the caller has made' })
  async list(@Req() request: RequestWithSession) {
    return { requests: await this.service().myRequests(requireUserId(request)) };
  }

  @Post()
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Raise a data subject request' })
  async create(@Req() request: RequestWithSession, @Body() body: CreatePrivacyRequestDto) {
    try {
      return await this.service().createRequest(requireUserId(request), { ...body });
    } catch (error: unknown) {
      if (error instanceof PrivacyRequestInputError) {
        throw new BadRequestException(error.message);
      }
      // A deleted or restricted account cannot raise a request. The original
      // reported this as a client error rather than a server fault.
      if (error instanceof PrivacyRequestAccountUnavailableError) {
        throw new BadRequestException('active account required');
      }
      throw error;
    }
  }
}
