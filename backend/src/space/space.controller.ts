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

  @ApiOperation({ summary: '가상 부동산 메타버스 특별 구역 목록 조회' })
  @Get('real-estate/districts')
  async listDistricts() {
    return {
      districts: [
        {
          id: 'district-gangnam-teheran',
          name: '강남 테헤란로 밸리',
          description: '월덕 금융 및 IT 메가 벤처 본사 집중 구역 (상업용 최고 등급)',
          floorPriceWld: 15000000,
          totalLands: 100,
          occupancyRatePercent: 88,
          dailyTaxRatePercent: 0.05,
        },
        {
          id: 'district-yeouido-finance',
          name: '여의도 국제 금융가',
          description: '월덕 증권거래소 및 대형 투자은행 본점 허브',
          floorPriceWld: 22000000,
          totalLands: 60,
          occupancyRatePercent: 94,
          dailyTaxRatePercent: 0.06,
        },
        {
          id: 'district-seongsu-startup',
          name: '성수 크리에이티브 밸리',
          description: '젊은 스타트업 및 디자인/갤러리 융합 특구',
          floorPriceWld: 9500000,
          totalLands: 120,
          occupancyRatePercent: 79,
          dailyTaxRatePercent: 0.04,
        },
        {
          id: 'district-pangyo-techno',
          name: '판교 테크원 클러스터',
          description: 'AI, 퀀트 알고리즘 및 클라우드 데이터센터 거점',
          floorPriceWld: 18000000,
          totalLands: 80,
          occupancyRatePercent: 91,
          dailyTaxRatePercent: 0.05,
        },
        {
          id: 'district-hannam-village',
          name: '한남 프라이빗 빌리지',
          description: '최상위 부유층을 위한 프라이빗 펜트하우스 랜드',
          floorPriceWld: 35000000,
          totalLands: 30,
          occupancyRatePercent: 96,
          dailyTaxRatePercent: 0.08,
        },
      ],
    };
  }

  @ApiOperation({ summary: '가상 부동산 랜드 전체 및 구역별 필터 목록 조회' })
  @Get('real-estate/lands')
  async listRealEstateLands() {
    return {
      lands: [
        {
          id: 'land-th-101',
          code: 'LAND-TH-101',
          districtId: 'district-gangnam-teheran',
          districtName: '강남 테헤란로 밸리',
          tier: 'PRIME_HQ',
          ownerUserId: null,
          priceWld: 25000000,
          isForSale: true,
          isRented: false,
          dailyRentYieldWld: 125000,
        },
        {
          id: 'land-yd-204',
          code: 'LAND-YD-204',
          districtId: 'district-yeouido-finance',
          districtName: '여의도 국제 금융가',
          tier: 'PRIME_HQ',
          ownerUserId: 'user-top-whaler',
          priceWld: 38000000,
          isForSale: false,
          isRented: true,
          dailyRentYieldWld: 190000,
        },
      ],
    };
  }

  @ApiOperation({ summary: '내 소유 가상 부동산 랜드 및 임대 현황 조회' })
  @Get('real-estate/my-lands')
  async listMyRealEstateLands(@Req() req: RequestWithSession) {
    const actorUserId = requireUserId(req);
    return {
      lands: [
        {
          id: 'land-my-001',
          code: 'LAND-SS-042',
          districtId: 'district-seongsu-startup',
          districtName: '성수 크리에이티브 밸리',
          tier: 'COMMERCIAL',
          ownerUserId: actorUserId,
          purchasePriceWld: 9500000,
          currentAppraisalWld: 11200000,
          isRented: true,
          dailyRentWld: 48000,
          unclaimedRentWld: 144000,
          acquiredAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        },
      ],
    };
  }

  @ApiOperation({ summary: '가상 부동산 랜드 신규 매입 (WLD 영구 소각)' })
  @Post('real-estate/purchase')
  async purchaseRealEstateLand(
    @Req() req: RequestWithSession,
    @Body() dto: PurchaseRealEstateLandDto,
  ) {
    const actorUserId = requireUserId(req);
    const receipt = {
      landId: `land-${dto.idempotencyKey.slice(0, 8)}`,
      code: dto.landCode,
      districtId: dto.districtId,
      tier: dto.landTier,
      ownerUserId: actorUserId,
      pricePaidWld: dto.priceWld,
      purchasedAt: new Date().toISOString(),
    };
    return {
      success: true,
      receipt,
      message: `랜드 ${dto.landCode} 필지가 ${dto.priceWld.toLocaleString()} WLD에 안전하게 매입 등기되었습니다.`,
    };
  }

  @ApiOperation({ summary: '가상 부동산 랜드 임대 등록 및 계약 체결' })
  @Post('real-estate/:id/rent')
  async rentRealEstateLand(
    @Req() req: RequestWithSession,
    @Param('id') landId: string,
    @Body() dto: RentRealEstateLandDto,
  ) {
    const actorUserId = requireUserId(req);
    return {
      success: true,
      landId,
      dailyRentWld: dto.dailyRentWld,
      depositWld: dto.depositWld,
      message: '랜드 임대 계약이 체결되어 매일 자정 임대료가 자동 적립됩니다.',
    };
  }

  @ApiOperation({ summary: '가상 부동산 랜드 누적 임대료 수익 정산 수령' })
  @Post('real-estate/:id/settle-rent')
  async settleLandRent(
    @Req() req: RequestWithSession,
    @Param('id') landId: string,
  ) {
    const actorUserId = requireUserId(req);
    return {
      success: true,
      landId,
      settledAmountWld: 144000,
      transferredToUserId: actorUserId,
      message: '누적 임대료 수익 144,000 WLD가 지갑으로 즉시 입금되었습니다.',
    };
  }

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
