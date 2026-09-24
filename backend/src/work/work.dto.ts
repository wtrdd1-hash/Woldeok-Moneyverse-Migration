import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class WorkAssignmentDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() readonly taskId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() readonly idempotencyKey!: string;
}

export class WorkCompletionDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() readonly idempotencyKey!: string;
  @ApiProperty({ required: false, maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  readonly evidence?: string;
}

export class JobSwitchDto {
  @ApiProperty({
    enum: [
      'developer',
      'trader',
      'entertainer',
      'detective',
      'miner',
      'farmer',
      'artisan',
      'civil_servant',
    ],
  })
  @IsIn([
    'developer',
    'trader',
    'entertainer',
    'detective',
    'miner',
    'farmer',
    'artisan',
    'civil_servant',
  ])
  readonly jobType!: string;
}

export class WorkCompleteTaskDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class WorkDashboardResponseDto {
  @ApiProperty({ pattern: '^\\d+$', description: 'WLD paid in the current accelerated game day' })
  readonly daily_paid!: string;

  @ApiProperty({
    pattern: '^\\d+$',
    description: 'Current member-wide daily Work reward cap in WLD',
  })
  readonly daily_cap!: string;

  @ApiProperty({ pattern: '^\\d+$', description: 'WLD paid in the current accelerated game week' })
  readonly weekly_paid!: string;

  @ApiProperty({
    pattern: '^\\d+$',
    description: 'Current member-wide weekly Work reward cap in WLD',
  })
  readonly weekly_cap!: string;

  @ApiProperty({ pattern: '^\\d+$', description: 'Assigned/submitted Work items still open' })
  readonly active_assignments!: string;

  @ApiProperty({ format: 'date', description: 'Authoritative accelerated Moneyverse game-day key' })
  readonly game_day_key!: string;

  @ApiProperty({
    format: 'date',
    description: 'Authoritative accelerated Moneyverse game-week key',
  })
  readonly game_week_key!: string;

  @ApiProperty({
    format: 'date-time',
    description: 'Exact server timestamp when the current game day resets',
  })
  readonly day_ends_at!: string;

  @ApiProperty({
    format: 'date-time',
    description: 'Exact server timestamp when the current game week resets',
  })
  readonly week_ends_at!: string;
}

export class CertifyQualificationDto {
  @ApiProperty({
    enum: [
      'developer',
      'trader',
      'entertainer',
      'detective',
      'miner',
      'farmer',
      'artisan',
      'civil_servant',
    ],
  })
  @IsIn([
    'developer',
    'trader',
    'entertainer',
    'detective',
    'miner',
    'farmer',
    'artisan',
    'civil_servant',
  ])
  readonly jobType!: string;

  @ApiProperty({
    enum: [
      'BASIC_LICENSE',
      'BADGE_ENGRAVING',
      'SPECIALIST_CERTIFICATE',
      'MASTER_PORTFOLIO',
      'UNIFORM_STYLING',
    ],
  })
  @IsIn([
    'BASIC_LICENSE',
    'BADGE_ENGRAVING',
    'SPECIALIST_CERTIFICATE',
    'MASTER_PORTFOLIO',
    'UNIFORM_STYLING',
  ])
  readonly qualificationCode!: string;
}

export interface QualificationItem {
  readonly id: string;
  readonly job_type: string;
  readonly qualification_code: string;
  readonly title: string;
  readonly tier: string;
  readonly fee_wld: string;
  readonly acquired_at: string;
}

