import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { isExpectedCommandFailure, isMalformedInput, isRoleRefusal } from '../core/pg-error';
import { DiscordAlertService } from '../discord/discord-alert.service';
import { OperationsRepository } from './operations.repository';

export class UpdateWorkPolicyDto {
  @ApiProperty({ required: false, minimum: 1, maximum: 1000000000 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000000000)
  readonly dailyCap?: number;

  @ApiProperty({ required: false, minimum: 1, maximum: 10000000000 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000000000)
  readonly weeklyCap?: number;

  @ApiProperty({ required: false, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  readonly repeatDecayPercent?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  readonly enabled?: boolean;

  @ApiProperty({ required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly reason?: string;
}

export class UpdateWorkTaskDto {
  @ApiProperty({ required: false, minimum: 1, maximum: 100000 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100000)
  readonly baseReward?: number;

  @ApiProperty({ required: false, minimum: 0, maximum: 100000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100000)
  readonly baseExperience?: number;

  @ApiProperty({ required: false, minimum: 1, maximum: 86400 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(86400)
  readonly minimumDurationSeconds?: number;

  @ApiProperty({ required: false, minimum: 1, maximum: 1000 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  readonly dailyLimit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  readonly active?: boolean;
}

function required(repository: OperationsRepository | null): OperationsRepository {
  if (!repository) {
    throw new ServiceUnavailableException('the operations console is unavailable');
  }
  return repository;
}

async function guarded<T>(work: () => Promise<T>, message: string): Promise<T> {
  try {
    return await work();
  } catch (error: unknown) {
    if (isRoleRefusal(error)) throw new ForbiddenException('this screen needs a higher role');
    if (isMalformedInput(error)) throw new BadRequestException(message);
    if (isExpectedCommandFailure(error)) throw new BadRequestException(message);
    throw error;
  }
}

@ApiTags('admin')
@Controller('admin/work')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard, AdminSessionGuard)
export class AdminWorkOperationsController {
  constructor(
    @Inject(OperationsRepository) private readonly operations: OperationsRepository | null,
  ) {}

  @Get()
  @ApiOperation({ summary: 'The work catalogue, the reward policy in force, and job levels' })
  async overview(@Req() request: RequestWithSession) {
    const actor = requireUserId(request);
    const repository = required(this.operations);
    const [catalogue, jobLevels, policy] = await guarded(
      () =>
        Promise.all([
          repository.workCatalogue(actor),
          repository.jobLevels(actor),
          repository.workRewardPolicy(actor),
        ]),
      'the work console could not be read',
    );
    return { catalogue, jobLevels, policy };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Real-time 24h work ranking, daily cap usage buckets, and 7-day trend' })
  async stats(@Req() request: RequestWithSession) {
    const actor = requireUserId(request);
    const repository = required(this.operations);
    const stats = await guarded(
      () => repository.getWorkRealtimeStats(actor),
      'the work statistics could not be calculated',
    );
    return { stats };
  }

  @Post('auto-tune')
  @UseGuards(CsrfGuard, ReauthGuard)
  @ApiOperation({ summary: 'Automatically calculate and tune daily reward cap based on economy health' })
  async autoTune(@Req() request: RequestWithSession) {
    const actor = requireUserId(request);
    const repository = required(this.operations);
    const result = await guarded(
      () => repository.autoTuneWorkPolicy(actor),
      'auto-tuning work policy failed',
    );
    return { result };
  }

  @Put('policy')
  @UseGuards(CsrfGuard, ReauthGuard)
  @ApiOperation({ summary: 'Update work reward policy daily cap, weekly cap, and repeat decay' })
  async updatePolicy(
    @Req() request: RequestWithSession,
    @Body() body: UpdateWorkPolicyDto,
  ) {
    const actor = requireUserId(request);
    const repository = required(this.operations);
    const policy = await guarded(
      () => repository.updateWorkRewardPolicy(actor, body),
      'the work reward policy could not be updated',
    );
    return { policy };
  }

  @Patch('tasks/:id')
  @UseGuards(CsrfGuard, ReauthGuard)
  @ApiOperation({ summary: 'Update base reward, duration, daily limit, and active state of a work task' })
  async updateTask(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) taskId: string,
    @Body() body: UpdateWorkTaskDto,
  ) {
    const actor = requireUserId(request);
    const repository = required(this.operations);
    const task = await guarded(
      () => repository.updateWorkTask(actor, taskId, body),
      'the work task could not be updated',
    );
    return { task };
  }
}

@ApiTags('admin')
@Controller('admin/bank')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard, AdminSessionGuard)
export class AdminBankOperationsController {
  constructor(
    @Inject(OperationsRepository) private readonly operations: OperationsRepository | null,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Deposits and the loan book, with the credit ladder behind it' })
  async overview(@Req() request: RequestWithSession, @Query('limit') limit?: string) {
    const requested = limit === undefined ? undefined : Number(limit);
    if (requested !== undefined && !Number.isSafeInteger(requested)) {
      throw new BadRequestException('limit must be a whole number');
    }
    const actor = requireUserId(request);
    const repository = required(this.operations);
    const [overview, grades, loans] = await guarded(
      () =>
        Promise.all([
          repository.bankOverview(actor),
          repository.creditGrades(actor),
          requested === undefined
            ? repository.loanBook(actor)
            : repository.loanBook(actor, requested),
        ]),
      'the bank console could not be read',
    );
    return { overview, grades, loans };
  }
}

@ApiTags('admin')
@Controller('admin/discord')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard, AdminSessionGuard)
export class AdminDiscordOperationsController {
  constructor(
    @Inject(OperationsRepository) private readonly operations: OperationsRepository | null,
    @Inject(DiscordAlertService) private readonly discordAlert: DiscordAlertService | null,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Discord delivery: which types are routed, and what is stuck' })
  async overview(@Req() request: RequestWithSession) {
    const actor = requireUserId(request);
    const repository = required(this.operations);
    const [outbox, routes] = await guarded(
      () => Promise.all([repository.outboxHealth(actor), repository.discordRoutes(actor)]),
      'the delivery console could not be read',
    );
    const adminAlertInfo = {
      adminUserId: this.discordAlert ? this.discordAlert.getAdminUserId() : '886478189520637992',
      configured: !!process.env.DISCORD_BOT_TOKEN,
    };
    return { outbox, routes, adminAlertInfo };
  }

  @Post('test-dm')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Send test direct message to configured admin user' })
  async testDm(@Req() request: RequestWithSession) {
    const actor = requireUserId(request);
    if (!this.discordAlert) {
      throw new ServiceUnavailableException('Discord alert service is not available');
    }
    const adminUserId = this.discordAlert.getAdminUserId();
    const result = await this.discordAlert.sendAdminDirectMessage({
      title: '🔔 [관리자 DM 연동 확인] 월덕 머니버스 중요 정보 다이렉트 알림',
      description: '디스코드 봇을 통한 중요 정보(원장 불일치, 음수 잔액, 감사 체인 변조 등) 1:1 전송 파이프라인이 정상 연동되었습니다.',
      color: 0x10b981,
      fields: [
        { name: '수신 관리자 ID', value: `\`${adminUserId}\``, inline: true },
        { name: '테스트 요청자', value: `\`${actor.slice(0, 8)}...\``, inline: true },
        { name: '감시 항목', value: '원장 대사 무결성, 계좌 잔액 안전성, 감사 체인 변조, 긴급 관리자 경보', inline: false },
      ],
    });
    return { ...result, targetUserId: adminUserId };
  }
}

