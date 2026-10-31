import {
  BadRequestException,
  ServiceUnavailableException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { AdminSessionGuard } from '../../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { ConsentGuard } from '../../auth/guards/consent.guard';
import { SessionGuard } from '../../auth/guards/session.guard';
import type { RequestWithSession } from '../../auth/session.context';
import { requireUserId } from '../../auth/session.context';
import { EnterpriseService } from './enterprise.service';
import { SkipInternalToken } from '../../auth/guards/skip-internal-token.decorator';

@ApiTags('State Enterprises & Corporate Governance')
@Controller('admin/enterprises')
@UseGuards(SessionGuard, ConsentGuard, AuthenticatedGuard, AdminGuard, AdminSessionGuard)
export class AdminEnterpriseController {
  constructor(private readonly service: EnterpriseService) {}

  @Get('overview')
  @ApiOperation({ summary: '월덱 국가투자공사(WSHC) 및 기업 생태계 총괄 지표 조회' })
  async getOverview() {
    return this.service.getStateHoldingOverview();
  }

  @Get('soes')
  @ApiOperation({ summary: '3대 국가 기간 공기업 목록 및 경영평가 현황 조회' })
  async listStateEnterprises() {
    return this.service.listStateEnterprises();
  }

  @Get('private')
  @ApiOperation({ summary: '민간 스타트업 및 상장 기업 포트폴리오 목록 조회' })
  async listPrivateEnterprises() {
    return this.service.listPrivateEnterprises();
  }

  @Get('dividend-logs')
  @ApiOperation({ summary: '공기업 국고 배당 납입 이력 조회' })
  async listDividendLogs(@Query('limit') limit?: string) {
    // Query parameters are untrusted strings (or arrays when repeated).
    // Do not silently turn malformed financial-history paging into a valid request.
    if (limit === undefined) return this.service.listRecentDividendLogs(20);
    if (typeof limit !== 'string' || !/^[1-9][0-9]*$/.test(limit)) {
      throw new BadRequestException('limit must be an integer from 1 to 100');
    }
    const requested = Number(limit);
    if (!Number.isSafeInteger(requested) || requested > 100) {
      throw new BadRequestException('limit must be an integer from 1 to 100');
    }
    return this.service.listRecentDividendLogs(requested);
  }

  @Post('soes/harvest')
  @ApiResponse({
    status: 503,
    description: 'SOE_DIVIDEND_LEDGER_UNAVAILABLE: atomic dividend settlement not certified',
  })
  @ApiOperation({ summary: '3대 국가 기간 공기업 법정 배당금 국고 즉시 수취 집행' })
  async harvestSoeDividends(@Req() req: RequestWithSession) {
    const adminId = requireUserId(req);
    return this.service.harvestSoeDividends(adminId);
  }

  @Put('soes/:code')
  @ApiOperation({ summary: '공기업 운영 상태 및 법정 배당률 변경 (킬스위치/민영화 제어)' })
  async updateSoeStatus(
    @Param('code') code: string,
    @Body('status') status: string,
    @Body('dividendRateBps') dividendRateBps?: number,
  ) {
    // The legacy repository performs direct app-role table DML and does not
    // provide an auditable DB-owned receipt. No HTTP caller may execute it.
    void code;
    void status;
    void dividendRateBps;
    throw new ServiceUnavailableException({
      code: 'SOE_STATUS_MUTATION_UNVERIFIED',
      message: 'SOE status updates are suspended pending least-privilege receipt verification',
    });
  }
}

@ApiTags('Public Enterprises')
@SkipInternalToken()
@Controller('enterprises')
export class PublicEnterpriseController {
  constructor(private readonly service: EnterpriseService) {}

  @Get('public')
  @ApiOperation({ summary: '대국민 알리오(ALIO) 공기업 경영정보 공개 공시' })
  async getPublicEnterprises() {
    try {
      const disclosure = await this.service.getPublicDisclosure();
      if (disclosure.financial_data_status !== 'PROJECTION_ONLY_UNVERIFIED' || disclosure.ledger_confirmed !== false) {
        throw new Error('Unverified enterprise disclosure status');
      }
      return {
        source: 'DATABASE_SNAPSHOT' as const,
        // Stored operating projections are NOT a settled Treasury/ledger receipt.
        settlementStatus: 'NOT_VERIFIED' as const,
        ...disclosure,
        disclosed_at: new Date().toISOString(),
        standards: 'In-game virtual operating projections, not legal or settlement certification',
      };
    } catch {
      // Never expose database details or synthesize a success-shaped financial report.
      throw new ServiceUnavailableException({
        code: 'ENTERPRISE_DISCLOSURE_UNAVAILABLE',
        message: 'Verified enterprise disclosure is temporarily unavailable',
      });
    }
  }
}
