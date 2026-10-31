import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  Inject,
  Post,
  Req,
  ServiceUnavailableException,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { DeokiAdvisorRepository } from './deoki-advisor.repository';

export interface AskDeokiDto {
  readonly question: string;
}

@ApiTags('advisor')
@Controller('advisor/deoki')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
export class DeokiAdvisorController {
  constructor(
    @Inject(DeokiAdvisorRepository) private readonly repository: DeokiAdvisorRepository | null,
  ) {}

  @Get('diagnose')
  @Header('Cache-Control', 'private, no-store')
  @Header('X-Robots-Tag', 'noindex')
  @ApiOperation({ summary: 'AI 금융 비서 덕이 포트폴리오 실시간 PR-Index 종합 진단' })
  async getDiagnosis(@Req() req: RequestWithSession) {
    if (!this.repository) {
      throw new ServiceUnavailableException('advisor source unavailable');
    }

    // Never substitute a guest actor for an owner-scoped financial read.
    const userId = req.session?.user_id;
    if (!userId) throw new UnauthorizedException('login required');

    try {
      const diagnosis = await this.repository.diagnoseUserPortfolio(userId);
      return {
        success: true,
        diagnosis,
      };
    } catch {
      // A DB permission error must never become a client error or leak SQL.
      throw new ServiceUnavailableException('advisor source unavailable');
    }
  }

  @Post('ask')
  @UseGuards(CsrfGuard)
  @Header('Cache-Control', 'private, no-store')
  @Header('X-Robots-Tag', 'noindex')
  @ApiOperation({ summary: 'AI 금융 비서 덕이 실시간 핀테크 자산 상담 및 질의응답' })
  async askDeoki(@Req() req: RequestWithSession, @Body() body: AskDeokiDto) {
    if (!this.repository) {
      throw new ServiceUnavailableException('advisor source unavailable');
    }

    const question = body.question;
    if (!question || question.trim().length === 0) {
      throw new BadRequestException('상담 질문을 입력해주세요.');
    }

    const userId = req.session?.user_id;
    if (!userId) throw new UnauthorizedException('login required');

    try {
      const advice = await this.repository.askDeoki(userId, question);
      return {
        success: true,
        ...advice,
      };
    } catch {
      throw new ServiceUnavailableException('advisor source unavailable');
    }
  }
}
