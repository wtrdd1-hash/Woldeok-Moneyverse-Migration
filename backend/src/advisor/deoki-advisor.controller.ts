import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { RequestWithSession } from '../auth/session.context';
import { DeokiAdvisorRepository } from './deoki-advisor.repository';

export interface AskDeokiDto {
  readonly question: string;
}

@ApiTags('advisor')
@Controller('advisor/deoki')
export class DeokiAdvisorController {
  constructor(
    @Inject(DeokiAdvisorRepository) private readonly repository: DeokiAdvisorRepository | null,
  ) {}

  @Get('diagnose')
  @ApiOperation({ summary: 'AI 금융 비서 덕이 포트폴리오 실시간 PR-Index 종합 진단' })
  async getDiagnosis(@Req() req: RequestWithSession) {
    if (!this.repository) {
      throw new BadRequestException('AI 금융 비서 덕이 서비스가 현재 점검 중입니다.');
    }

    // 비로그인 상태이거나 데모 유저일 경우를 위한 폴백 처리
    const userId = req.session?.user_id || '00000000-0000-0000-0000-000000000000';

    try {
      const diagnosis = await this.repository.diagnoseUserPortfolio(userId);
      return {
        success: true,
        diagnosis,
      };
    } catch (err: any) {
      console.error('[DeokiAdvisorController] Error in getDiagnosis:', err);
      throw new BadRequestException(err?.message || '진단 생성에 실패했습니다.');
    }
  }

  @Post('ask')
  @ApiOperation({ summary: 'AI 금융 비서 덕이 실시간 핀테크 자산 상담 및 질의응답' })
  async askDeoki(@Req() req: RequestWithSession, @Body() body: AskDeokiDto) {
    if (!this.repository) {
      throw new BadRequestException('AI 금융 비서 덕이 서비스가 현재 점검 중입니다.');
    }

    const question = body.question;
    if (!question || question.trim().length === 0) {
      throw new BadRequestException('상담 질문을 입력해주세요.');
    }

    const userId = req.session?.user_id || '00000000-0000-0000-0000-000000000000';

    try {
      const advice = await this.repository.askDeoki(userId, question);
      return {
        success: true,
        ...advice,
      };
    } catch (err: any) {
      console.error('[DeokiAdvisorController] Error in askDeoki:', err);
      throw new BadRequestException(err?.message || '상담 처리에 실패했습니다.');
    }
  }
}
