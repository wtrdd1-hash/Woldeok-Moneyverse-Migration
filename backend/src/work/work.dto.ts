import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class WorkAssignmentDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() readonly taskId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() readonly idempotencyKey!: string;
}
export class WorkCompletionDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() readonly idempotencyKey!: string;
  @ApiProperty({ required: false, maxLength: 1000 }) @IsOptional() @IsString() @MaxLength(1000) readonly evidence?: string;
}
