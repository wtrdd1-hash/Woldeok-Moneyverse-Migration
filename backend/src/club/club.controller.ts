import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsPositive, IsString, IsUUID, Matches, MaxLength, Min, MinLength } from 'class-validator';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { ClubService } from './club.service';

export class CreateClubDto {
  @ApiProperty({ description: '클럽 태그 (2-8자 대문자 영문/숫자)', example: 'ALPHA' })
  @IsString()
  @MinLength(2)
  @MaxLength(8)
  @Matches(/^[A-Z0-9]+$/, { message: '태그는 영문 대문자 및 숫자만 가능합니다.' })
  readonly tag!: string;

  @ApiProperty({ description: '클럽 이름 (2-30자)', example: '알파 협동조합' })
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  readonly name!: string;

  @ApiPropertyOptional({ description: '클럽 소개글 (최대 500자)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly description?: string;

  @ApiPropertyOptional({ description: '클럽 헌장 (최대 2000자)' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  readonly charter?: string;

  @ApiPropertyOptional({ description: '가입 방식 (public, invite, request)', default: 'public' })
  @IsOptional()
  @IsIn(['public', 'invite', 'request'])
  readonly joinMode?: string;

  @ApiProperty({ format: 'uuid', description: '클라이언트 멱등성 키' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class ContributeProjectDto {
  @ApiProperty({ description: '기여할 WLD 금액', example: 1000 })
  @IsInt()
  @IsPositive()
  readonly amountWld!: number;

  @ApiProperty({ format: 'uuid', description: '클라이언트 멱등성 키' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class UpdateMemberRoleDto {
  @ApiProperty({ description: '변경할 역할', enum: ['steward', 'moderator', 'member'] })
  @IsIn(['steward', 'moderator', 'member'])
  readonly role!: 'steward' | 'moderator' | 'member';
}

export class CreateFeedPostDto {
  @ApiProperty({ description: '게시글 제목 (1-100자)' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  readonly title!: string;

  @ApiProperty({ description: '게시글 본문 (1-2000자)' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  readonly body!: string;

  @ApiPropertyOptional({ description: '공지사항 여부 (운영진만 가능)', default: false })
  @IsOptional()
  @IsBoolean()
  readonly isAnnouncement?: boolean;
}

@ApiTags('clubs')
@Controller('clubs')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
export class ClubController {
  constructor(@Inject(ClubService) private readonly clubService: ClubService) {}

  @ApiOperation({ summary: '클럽 목록 탐색 및 검색' })
  @Get()
  async listClubs(
    @Req() req: RequestWithSession,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const actorUserId = requireUserId(req);
    const parsedLimit = limit ? Number.parseInt(limit, 10) : 50;
    const parsedOffset = offset ? Number.parseInt(offset, 10) : 0;
    const clubs = await this.clubService.listClubs(actorUserId, search, parsedLimit, parsedOffset);
    return { clubs };
  }

  @ApiOperation({ summary: '신규 클럽 창설 (10,000 WLD 소각)' })
  @Post()
  async createClub(@Req() req: RequestWithSession, @Body() dto: CreateClubDto) {
    const actorUserId = requireUserId(req);
    return this.clubService.createClub(actorUserId, dto, dto.idempotencyKey);
  }

  @ApiOperation({ summary: '클럽 상세 정보 조회' })
  @Get(':id')
  async getClubById(
    @Req() req: RequestWithSession,
    @Param('id', ParseUUIDPipe) clubId: string,
  ) {
    const actorUserId = requireUserId(req);
    const club = await this.clubService.getClubById(clubId, actorUserId);
    return { club };
  }

  @ApiOperation({ summary: '클럽 공개 가입' })
  @Post(':id/join')
  async joinClub(
    @Req() req: RequestWithSession,
    @Param('id', ParseUUIDPipe) clubId: string,
  ) {
    const actorUserId = requireUserId(req);
    const ok = await this.clubService.joinClub(actorUserId, clubId);
    return { ok };
  }

  @ApiOperation({ summary: '클럽 탈퇴' })
  @Post(':id/leave')
  async leaveClub(
    @Req() req: RequestWithSession,
    @Param('id', ParseUUIDPipe) clubId: string,
  ) {
    const actorUserId = requireUserId(req);
    const ok = await this.clubService.leaveClub(actorUserId, clubId);
    return { ok };
  }

  @ApiOperation({ summary: '클럽 회원 명부 조회' })
  @Get(':id/members')
  async listClubMembers(
    @Req() req: RequestWithSession,
    @Param('id', ParseUUIDPipe) clubId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const actorUserId = requireUserId(req);
    const parsedLimit = limit ? Number.parseInt(limit, 10) : 50;
    const parsedOffset = offset ? Number.parseInt(offset, 10) : 0;
    const members = await this.clubService.listClubMembers(clubId, actorUserId, parsedLimit, parsedOffset);
    return { members };
  }

  @ApiOperation({ summary: '클럽 회원 역할 변경' })
  @Patch(':id/members/:userId/role')
  async updateMemberRole(
    @Req() req: RequestWithSession,
    @Param('id', ParseUUIDPipe) clubId: string,
    @Param('userId', ParseUUIDPipe) targetUserId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    const actorUserId = requireUserId(req);
    const ok = await this.clubService.updateMemberRole(actorUserId, clubId, targetUserId, dto.role);
    return { ok };
  }

  @ApiOperation({ summary: '협동 프로젝트 목록 조회' })
  @Get(':id/projects')
  async listClubProjects(@Param('id', ParseUUIDPipe) clubId: string) {
    const projects = await this.clubService.listClubProjects(clubId);
    return { projects };
  }

  @ApiOperation({ summary: '협동 프로젝트 WLD 펀딩 기여 (영구 소각)' })
  @Post(':id/projects/:projectId/contributions')
  async contributeToProject(
    @Req() req: RequestWithSession,
    @Param('id', ParseUUIDPipe) clubId: string,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: ContributeProjectDto,
  ) {
    const actorUserId = requireUserId(req);
    return this.clubService.contributeToProject(
      actorUserId,
      clubId,
      projectId,
      dto.amountWld,
      dto.idempotencyKey,
    );
  }

  @ApiOperation({ summary: '클럽 피드 글 목록 조회' })
  @Get(':id/feed')
  async listClubFeed(
    @Param('id', ParseUUIDPipe) clubId: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? Number.parseInt(limit, 10) : 50;
    const posts = await this.clubService.listClubFeed(clubId, parsedLimit);
    return { posts };
  }

  @ApiOperation({ summary: '클럽 피드 또는 공지사항 작성' })
  @Post(':id/feed')
  async createClubFeedPost(
    @Req() req: RequestWithSession,
    @Param('id', ParseUUIDPipe) clubId: string,
    @Body() dto: CreateFeedPostDto,
  ) {
    const actorUserId = requireUserId(req);
    return this.clubService.createClubFeedPost(actorUserId, clubId, dto);
  }

  @ApiOperation({ summary: '클럽하우스 12x12 공유 캔버스 조회' })
  @Get(':id/canvas')
  async getClubCanvas(@Param('id', ParseUUIDPipe) clubId: string) {
    const canvas = await this.clubService.getClubCanvas(clubId);
    return { canvas };
  }

  @ApiOperation({ summary: '클럽하우스 12x12 공유 캔버스 저장' })
  @Put(':id/canvas')
  async updateClubCanvas(
    @Req() req: RequestWithSession,
    @Param('id', ParseUUIDPipe) clubId: string,
    @Body() dto: UpdateClubCanvasDto,
  ) {
    const actorUserId = requireUserId(req);
    const ok = await this.clubService.updateClubCanvas(actorUserId, clubId, dto.grid, dto.totalScore);
    return { ok };
  }
}

export class UpdateClubCanvasDto {
  @ApiProperty({ description: '12x12 가구 배치 그리드 배열' })
  @IsArray()
  readonly grid!: unknown[];

  @ApiProperty({ description: '장식 점수', example: 450 })
  @IsInt()
  @Min(0)
  readonly totalScore!: number;
}

