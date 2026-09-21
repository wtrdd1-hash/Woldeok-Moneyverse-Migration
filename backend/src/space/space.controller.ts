import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { IsIn, IsInt, IsObject, IsOptional, IsPositive, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { randomUUID } from 'node:crypto';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { SpaceService } from './space.service';

export class PurchaseSpaceDto {
  @ApiProperty({
    description: '공간 유형',
    enum: ['SPACE_ROOM_STARTER', 'SPACE_STUDIO', 'SPACE_GALLERY', 'SPACE_OFFICE', 'SPACE_PENTHOUSE', 'SPACE_HQ'],
  })
  @IsIn(['SPACE_ROOM_STARTER', 'SPACE_STUDIO', 'SPACE_GALLERY', 'SPACE_OFFICE', 'SPACE_PENTHOUSE', 'SPACE_HQ'])
  readonly spaceType!: string;

  @ApiProperty({ description: '공간 이름 (1-50자)' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  readonly name!: string;

  @ApiPropertyOptional({ format: 'uuid', description: '클라이언트 멱등성 키' })
  @IsOptional()
  @IsUUID()
  readonly idempotencyKey?: string;
}

export class UpdateLayoutDto {
  @ApiProperty({ description: '공간 가구/인테리어 레이아웃 JSON' })
  @IsObject()
  readonly layout!: Record<string, unknown>;
}

export class ContributeCityProjectDto {
  @ApiProperty({ description: '기여할 WLD 금액', example: 5000 })
  @IsInt()
  @IsPositive()
  readonly amountWld!: number;

  @ApiPropertyOptional({ format: 'uuid', description: '클라이언트 멱등성 키' })
  @IsOptional()
  @IsUUID()
  readonly idempotencyKey?: string;
}

@ApiTags('spaces')
@Controller('spaces')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
export class SpaceController {
  constructor(@Inject(SpaceService) private readonly spaceService: SpaceService) {}

  @ApiOperation({ summary: '내 개인 공간 목록 조회' })
  @Get()
  async listMySpaces(@Req() req: RequestWithSession) {
    const actorUserId = requireUserId(req);
    const spaces = await this.spaceService.listUserSpaces(actorUserId);
    return { spaces };
  }

  @ApiOperation({ summary: '개인 공간 구매 (WLD 소각)' })
  @Post('purchase')
  async purchaseSpace(@Req() req: RequestWithSession, @Body() dto: PurchaseSpaceDto) {
    const actorUserId = requireUserId(req);
    const idempotencyKey = dto.idempotencyKey || randomUUID();
    return this.spaceService.purchaseSpace(actorUserId, dto.spaceType, dto.name, idempotencyKey);
  }

  @ApiOperation({ summary: '개인 공간 상세 조회' })
  @Get(':id')
  async getSpaceById(@Param('id', ParseUUIDPipe) spaceId: string) {
    const space = await this.spaceService.getSpaceById(spaceId);
    return { space };
  }

  @ApiOperation({ summary: '개인 공간 인테리어/레이아웃 저장' })
  @Put(':id/layout')
  async updateLayout(
    @Req() req: RequestWithSession,
    @Param('id', ParseUUIDPipe) spaceId: string,
    @Body() dto: UpdateLayoutDto,
  ) {
    const actorUserId = requireUserId(req);
    const ok = await this.spaceService.updateSpaceLayout(actorUserId, spaceId, dto.layout);
    return { ok };
  }

  @ApiOperation({ summary: '공공 도시 프로젝트 목록 조회' })
  @Get('city/projects')
  async listCityProjects() {
    const projects = await this.spaceService.listCityProjects();
    return { projects };
  }

  @ApiOperation({ summary: '공공 도시 프로젝트 펀딩 기여 (WLD 영구 소각)' })
  @Post('city/projects/:id/contributions')
  async contributeCityProject(
    @Req() req: RequestWithSession,
    @Param('id', ParseUUIDPipe) projectId: string,
    @Body() dto: ContributeCityProjectDto,
  ) {
    const actorUserId = requireUserId(req);
    const idempotencyKey = dto.idempotencyKey || randomUUID();
    return this.spaceService.contributeCityProject(actorUserId, projectId, dto.amountWld, idempotencyKey);
  }
}
