import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { isExpectedCommandFailure } from '../core/pg-error';
import { AiNewsInputError } from './ai-news.repository';
import { AiNewsService, AiNewsUnavailableError } from './ai-news.service';

export class SaveAiNewsSettingsDto {
  @ApiProperty({ example: 'https://api.anthropic.com' })
  @IsString()
  @MinLength(8)
  @MaxLength(300)
  readonly apiBaseUrl!: string;

  @ApiProperty({ example: 'claude-opus-5' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  readonly model!: string;

  @ApiProperty({ required: false, description: 'Absent or empty keeps the stored key' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  readonly apiKey?: string;

  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  readonly idempotencyKey?: string;
}

export class GenerateAiNewsDto {
  @ApiProperty({ required: false, maxLength: 2000, description: "The operator's wish for this batch" })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  readonly prompt?: string;

  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  readonly idempotencyKey?: string;
}

export class PublishAiNewsScenarioDto {
  @ApiProperty({ enum: ['up', 'down'] })
  @IsIn(['up', 'down'])
  readonly direction!: 'up' | 'down';

  @ApiProperty({ minimum: 1, maximum: 3 })
  @IsInt()
  @Min(1)
  @Max(3)
  readonly strength!: number;

  @ApiProperty({ minimum: 1, maximum: 168 })
  @IsInt()
  @Min(1)
  @Max(168)
  readonly hours!: number;

  @ApiProperty({ minLength: 2, maxLength: 120 })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  readonly headline!: string;

  @ApiProperty({ required: false, maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  readonly body?: string;

  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  readonly idempotencyKey?: string;
}

export class DiscardAiNewsScenarioDto {
  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  readonly idempotencyKey?: string;
}

/**
 * The AI newsroom, for operators. Storing the key is the one step-up act
 * here: a key is a credential, and the deployment's second factor is what
 * stands between an open console and a stored secret. Generating,
 * publishing and discarding are ordinary audited writes -- what a
 * published scenario can do to prices is bounded by 124's vocabulary.
 */
@ApiTags('admin')
@Controller('admin/ai-news')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard, AdminSessionGuard)
export class AiNewsController {
  constructor(@Inject(AiNewsService) private readonly newsroom: AiNewsService | null) {}

  private service(): AiNewsService {
    if (!this.newsroom) throw new ServiceUnavailableException('AI news is unavailable');
    return this.newsroom;
  }

  private async guarded<T>(work: () => Promise<T>, message: string): Promise<T> {
    try {
      return await work();
    } catch (error: unknown) {
      if (error instanceof AiNewsInputError) throw new BadRequestException(error.message);
      if (error instanceof AiNewsUnavailableError) {
        throw new ServiceUnavailableException({ message: error.message, code: error.code });
      }
      if (isExpectedCommandFailure(error)) {
        throw new BadRequestException({ message, code: 'ai_news_refused', detail: pgMessage(error) });
      }
      throw error;
    }
  }

  @Get('settings')
  @ApiOperation({ summary: 'Model address, model name and whether a key is stored' })
  async settings(@Req() request: RequestWithSession) {
    return { settings: await this.service().settings(requireUserId(request)) };
  }

  @Put('settings')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Store the model address, model name and, optionally, a new key' })
  saveSettings(@Req() request: RequestWithSession, @Body() body: SaveAiNewsSettingsDto) {
    return this.guarded(
      async () => ({ saved: await this.service().saveSettings({ actorUserId: requireUserId(request), ...body }) }),
      'invalid AI news settings',
    );
  }

  @Get('batches/latest')
  @ApiOperation({ summary: 'The current batch of proposed scenarios' })
  async latest(@Req() request: RequestWithSession) {
    return { batch: await this.service().latest(requireUserId(request)) };
  }

  @Post('batches')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Ask the model for five scenarios; replaces the current batch' })
  generate(@Req() request: RequestWithSession, @Body() body: GenerateAiNewsDto) {
    return this.guarded(
      async () => ({ batch: await this.service().generate({ actorUserId: requireUserId(request), ...body }) }),
      'the batch could not be stored',
    );
  }

  @Post('scenarios/:id/publish')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Publish a scenario as a market event, with the values the operator settled on' })
  publish(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) scenarioId: string,
    @Body() body: PublishAiNewsScenarioDto,
  ) {
    return this.guarded(
      () => this.service().publish({ actorUserId: requireUserId(request), scenarioId, ...body }),
      'this scenario cannot be published',
    );
  }

  @Post('scenarios/:id/discard')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Set a scenario aside' })
  discard(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) scenarioId: string,
    @Body() body: DiscardAiNewsScenarioDto,
  ) {
    return this.guarded(
      async () => ({ discarded: await this.service().discard({ actorUserId: requireUserId(request), scenarioId, ...body }) }),
      'this scenario cannot be discarded',
    );
  }
}

function pgMessage(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
    ? error.message
    : undefined;
}
