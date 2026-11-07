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

// A bank dashboard is an indivisible financial read model: a failed query
// must not be turned into a healthy-looking zero or an empty portfolio.
// Preserve deliberate DB role/input refusals, but never expose DB error text.
async function guardedBankRead<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error: unknown) {
    if (isRoleRefusal(error)) throw new ForbiddenException('this screen needs a higher role');
    if (isMalformedInput(error)) throw new BadRequestException('the bank console could not be read');
    throw new ServiceUnavailableException('the bank console could not be read');
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
  @UseGuards(CsrfGuard)
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
  @UseGuards(CsrfGuard)
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
  @UseGuards(CsrfGuard)
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
    // Reject non-canonical wire values before any of the three financial reads.
    // Number() would otherwise accept whitespace, exponent notation, hex and
    // empty strings, which do not satisfy the documented 1..200 SQL contract.
    const requested =
      limit === undefined
        ? undefined
        : typeof limit === 'string' && /^[1-9][0-9]{0,2}$/.test(limit)
          ? Number(limit)
          : NaN;
    if (requested !== undefined && (!Number.isSafeInteger(requested) || requested > 200)) {
      throw new BadRequestException('limit must be a decimal integer between 1 and 200');
    }
    const actor = requireUserId(request);
    const repository = required(this.operations);
    // All three reads form one authoritative financial view. A failed query
    // must never masquerade as a zero balance or an empty loan portfolio.
    const [overview, grades, loans] = await guardedBankRead(
      () =>
        Promise.all([
          repository.bankOverview(actor),
          repository.creditGrades(actor),
          requested === undefined
            ? repository.loanBook(actor)
            : repository.loanBook(actor, requested),
        ]),
    );
    return { overview, grades, loans };
  }
}

/** Configuration evidence only: transport delivery must be measured separately. */
export function resolveAdminDmConfiguration(
  env: NodeJS.ProcessEnv,
  alert: DiscordAlertService | null,
): { configured: boolean; adminUserId: string | null } {
  const explicitRecipient = env.DISCORD_ADMIN_ALERT_USER_ID;
  if (!alert || !env.DISCORD_BOT_TOKEN || !explicitRecipient ||
      !/^\d{17,20}$/.test(explicitRecipient) || alert.getAdminUserId() !== explicitRecipient) {
    return { configured: false, adminUserId: null };
  }
  return { configured: true, adminUserId: explicitRecipient };
}

/** Test-only labels. Never feed synthetic incidents into production alert formatters. */
const DM_TEST_PRESETS = {
  default: '기본 관리자 DM 연동',
  whale: '고액 이체 감지 시나리오',
  jackpot: '카지노 잭팟 감지 시나리오',
  treasury: '국고 준비금 경보 시나리오',
  killswitch: '긴급 중단 경보 시나리오',
  bank_delinquency: '대출 연체 경보 시나리오',
} as const;

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
    const adminAlertInfo = resolveAdminDmConfiguration(process.env, this.discordAlert);
    return { outbox, routes, adminAlertInfo };
  }

  @Post('test-dm')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Send test direct message to configured admin user with preset support' })
  async testDm(
    @Req() request: RequestWithSession,
    @Body() body?: { preset?: string },
  ) {
    const actor = requireUserId(request);
    const readiness = resolveAdminDmConfiguration(process.env, this.discordAlert);
    if (!this.discordAlert || !readiness.configured || !readiness.adminUserId) {
      throw new ServiceUnavailableException('Discord administrator DM recipient or token is not configured');
    }
    const adminUserId = readiness.adminUserId;
    const preset = body?.preset ?? 'default';

    if (!Object.hasOwn(DM_TEST_PRESETS, preset)) {
      throw new BadRequestException('unknown administrator DM test preset');
    }
    const label = DM_TEST_PRESETS[preset as keyof typeof DM_TEST_PRESETS];
    // This route proves DM transport only. It must never invoke the real incident
    // formatters with invented transaction ids, balances, jackpot wins or halts.
    const result = await this.discordAlert.sendAdminDirectMessage({
      title: `[TEST / 실제 발생 아님] ${label}`,
      description: '실제 발생 아님 — 관리자 DM 전송 경로를 확인하는 모의 시나리오입니다. 거래, 지급, 장애, 제어 변경은 실행되지 않았습니다.',
      color: 0x64748b,
      fields: [
        { name: '시나리오', value: label, inline: true },
        { name: '테스트 요청자', value: `${actor.slice(0, 8)}...`, inline: true },
        { name: '증거 범위', value: 'Discord DM API 수락 여부만 확인. 실제 금융 사건 및 사용자 수신·열람 증명 아님.', inline: false },
      ],
      footer: { text: 'Woldeok Moneyverse TEST ONLY — not a real operational incident' },
    }, adminUserId);

    return { ...result, targetUserId: adminUserId, preset };
  }
}

