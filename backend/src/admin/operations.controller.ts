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
    return { ...stats, stats };
  }

  @Post('auto-tune')
  @UseGuards(CsrfGuard, ReauthGuard)
  @ApiOperation({
    summary: 'Automatically calculate and tune daily reward cap based on economy health',
  })
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
  async updatePolicy(@Req() request: RequestWithSession, @Body() body: UpdateWorkPolicyDto) {
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
  @ApiOperation({
    summary: 'Update base reward, duration, daily limit, and active state of a work task',
  })
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
    const overviewFallback = {
      deposit_amount: '0',
      depositor_count: '0',
      open_loan_count: '0',
      outstanding_amount: '0',
      overdue_loan_count: '0',
      overdue_amount: '0',
      maturing_7d_count: '0',
      issued_24h_count: '0',
      issued_24h_amount: '0',
      repaid_24h_amount: '0',
      borrower_count: '0',
    };
    const [overview, grades, loans] = await guarded(
      () =>
        Promise.all([
          repository.bankOverview(actor).catch(() => overviewFallback),
          repository.creditGrades(actor).catch(() => []),
          requested === undefined
            ? repository.loanBook(actor).catch(() => [])
            : repository.loanBook(actor, requested).catch(() => []),
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
      adminUserId: process.env.DISCORD_ADMIN_ALERT_USER_ID ?? '',
      configured: Boolean(
        this.discordAlert &&
        process.env.DISCORD_BOT_TOKEN &&
        /^\d{17,20}$/.test(process.env.DISCORD_ADMIN_ALERT_USER_ID ?? ''),
      ),
    };
    return { outbox, routes, adminAlertInfo };
  }

  @Post('test-dm')
  @UseGuards(CsrfGuard)
  @ApiOperation({
    summary: 'Send test direct message to configured admin user with preset support',
  })
  async testDm(@Req() request: RequestWithSession, @Body() body?: { preset?: string }) {
    const actor = requireUserId(request);
    if (
      !this.discordAlert ||
      !process.env.DISCORD_BOT_TOKEN ||
      !/^\d{17,20}$/.test(process.env.DISCORD_ADMIN_ALERT_USER_ID ?? '')
    ) {
      throw new ServiceUnavailableException(
        'Discord DM test requires an explicitly configured bot and recipient',
      );
    }
    const adminUserId = this.discordAlert.getAdminUserId();
    const preset = body?.preset === undefined ? 'default' : body.preset;
    const labels: Record<string, string> = {
      default: '기본 DM 연결 확인',
      whale: '대규모 자금 이동',
      jackpot: '카지노 잭팟',
      treasury: '국고 준비금',
      killswitch: '비상 거래 중단',
      bank_delinquency: '대출 연체',
    };
    const label = typeof preset === 'string' ? labels[preset] : undefined;
    if (typeof preset !== 'string' || !Object.hasOwn(labels, preset) || typeof label !== 'string') {
      throw new BadRequestException('unknown Discord test preset');
    }

    // Test traffic must NEVER invoke the production alert helpers: they
    // generate realistic emergency messages and may trigger operator response.
    // The single transport below sends a plainly marked, non-operational DM.
    const result = await this.discordAlert.sendAdminDirectMessage({
      title: `🧪 [TEST ONLY / 모의 알림] ${label}`,
      description:
        '관리자 DM 전송 경로를 점검하기 위한 모의 테스트입니다. 실제 경보 발생 또는 조치가 아닙니다. 실제 거래, 원장 변경, 정책 실행도 수행되지 않았습니다.',
      color: 0x64748b,
      fields: [
        { name: '유형', value: label, inline: true },
        { name: '요청자', value: `\`${actor.slice(0, 8)}...\``, inline: true },
        { name: '상태', value: 'TEST ONLY — 운영 이벤트가 아닙니다.', inline: false },
      ],
      footer: { text: 'TEST ONLY / 모의 알림 — 실제 사건 아님' },
    });

    return { ...result, targetUserId: adminUserId, preset };
  }
}
