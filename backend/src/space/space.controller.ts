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
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsIn, IsInt, IsObject, IsPositive, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';
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

  @ApiProperty({ format: 'uuid', description: '클라이언트 소유 멱등성 키' })
  @IsUUID()
  readonly idempotencyKey!: string;
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

  @ApiProperty({ format: 'uuid', description: '클라이언트 소유 멱등성 키' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class PayPropertyTaxDto {
  @ApiProperty({ description: '납부할 일수 (1-30일)', example: 1, minimum: 1, maximum: 30 })
  @IsInt()
  @Min(1)
  @Max(30)
  readonly days!: number;

  @ApiProperty({ format: 'uuid', description: '클라이언트 소유 멱등성 키' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class PurchaseRealEstateLandDto {
  @ApiProperty({ description: '구역 ID', example: 'district-gangnam-teheran' })
  @IsString()
  readonly districtId!: string;

  @ApiProperty({ description: '랜드 필지 번호', example: 'LAND-TH-101' })
  @IsString()
  readonly landCode!: string;

  @ApiProperty({ description: '랜드 크기 등급', enum: ['STANDARD', 'COMMERCIAL', 'PRIME_HQ'] })
  @IsIn(['STANDARD', 'COMMERCIAL', 'PRIME_HQ'])
  readonly landTier!: 'STANDARD' | 'COMMERCIAL' | 'PRIME_HQ';

  @ApiProperty({ description: '매입 가격 (WLD)', example: 10000000 })
  @IsInt()
  @IsPositive()
  readonly priceWld!: number;

  @ApiProperty({ format: 'uuid', description: '클라이언트 소유 멱등성 키' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class RentRealEstateLandDto {
  @ApiProperty({ description: '일일 임대료 (WLD)', example: 50000 })
  @IsInt()
  @IsPositive()
  readonly dailyRentWld!: number;

  @ApiProperty({ description: '임대 보증금 (WLD)', example: 500000 })
  @IsInt()
  @IsPositive()
  readonly depositWld!: number;

  @ApiProperty({ format: 'uuid', description: '클라이언트 소유 멱등성 키' })
  @IsUUID()
  readonly idempotencyKey!: string;
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

  // These legacy land endpoints previously returned fabricated owner holdings,
  // bids, rent and WLD settlements. No PostgreSQL ownership or ledger receipt
  // backs them. Preserve the route contract but fail closed until implemented.
  private landReleaseHold(): never {
    throw new ServiceUnavailableException('가상 부동산 경매·임대는 검증된 원장 영수증이 준비될 때까지 중단됩니다.');
  }

  @ApiOperation({ summary: '가상 부동산 구역 조회 (원장 검증 전 중단)' })
  @Get('real-estate/districts')
  async listDistricts() { return this.landReleaseHold(); }

  @ApiOperation({ summary: '가상 부동산 필지 조회 (원장 검증 전 중단)' })
  @Get('real-estate/lands')
  async listRealEstateLands() { return this.landReleaseHold(); }

  @ApiOperation({ summary: '내 부동산 필지 조회 (소유권 검증 전 중단)' })
  @Get('real-estate/my-lands')
  async listMyRealEstateLands(@Req() _req: RequestWithSession) { return this.landReleaseHold(); }

  @ApiOperation({ summary: '가상 부동산 매입 (원장 검증 전 중단)' })
  @Post('real-estate/purchase')
  async purchaseRealEstateLand(
    @Req() _req: RequestWithSession,
    @Body() _dto: PurchaseRealEstateLandDto,
  ) { return this.landReleaseHold(); }

  @ApiOperation({ summary: '가상 부동산 임대 (원장 검증 전 중단)' })
  @Post('real-estate/:id/rent')
  async rentRealEstateLand(
    @Req() _req: RequestWithSession,
    @Param('id') _landId: string,
    @Body() _dto: RentRealEstateLandDto,
  ) { return this.landReleaseHold(); }

  @ApiOperation({ summary: '가상 부동산 임대료 정산 (원장 검증 전 중단)' })
  @Post('real-estate/:id/settle-rent')
  async settleLandRent(
    @Req() _req: RequestWithSession,
    @Param('id') _landId: string,
  ) { return this.landReleaseHold(); }

  @ApiOperation({ summary: '공공 도시 프로젝트 목록 조회' })
  @Get('city/projects')
  async listCityProjects() {
    const projects = await this.spaceService.listCityProjects();
    return { projects };
  }

  @ApiOperation({ summary: '체납 공매 대상 공간 목록 조회' })
  @Get('tax/delinquencies')
  async listTaxDelinquencies() {
    const delinquencies = await this.spaceService.listDelinquencies();
    return { delinquencies };
  }

  @ApiOperation({ summary: '개인 공간 구매 (WLD 소각)' })
  @Post('purchase')
  async purchaseSpace(@Req() req: RequestWithSession, @Body() dto: PurchaseSpaceDto) {
    const actorUserId = requireUserId(req);
    return this.spaceService.purchaseSpace(actorUserId, dto.spaceType, dto.name, dto.idempotencyKey);
  }

  @ApiOperation({ summary: '공공 도시 프로젝트 펀딩 기여 (WLD 영구 소각)' })
  @Post('city/projects/:id/contributions')
  async contributeCityProject(
    @Req() req: RequestWithSession,
    @Param('id', ParseUUIDPipe) projectId: string,
    @Body() dto: ContributeCityProjectDto,
  ) {
    const actorUserId = requireUserId(req);
    return this.spaceService.contributeCityProject(actorUserId, projectId, dto.amountWld, dto.idempotencyKey);
  }

  @ApiOperation({ summary: '개인 공간 부동산세 상태 조회' })
  @Get(':id/tax/status')
  async getSpaceTaxStatus(@Param('id', ParseUUIDPipe) spaceId: string) {
    const taxStatus = await this.spaceService.getSpaceTaxStatus(spaceId);
    return { taxStatus };
  }

  @ApiOperation({ summary: '개인 공간 일일 부동산세 납부 (100% 영구 소각)' })
  @Post(':id/tax/pay')
  async payPropertyTax(
    @Req() req: RequestWithSession,
    @Param('id', ParseUUIDPipe) spaceId: string,
    @Body() dto: PayPropertyTaxDto,
  ) {
    const actorUserId = requireUserId(req);
    const receipt = await this.spaceService.payPropertyTax(actorUserId, spaceId, dto.days, dto.idempotencyKey);
    return { receipt };
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
}
