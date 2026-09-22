import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SafetyRepository } from './safety.repository';
import type {
  EmergencyTakedownSubmitDto,
  EmergencyTakedownStatusQueryDto,
  AdminTakedownActionDto,
} from './safety.dto';

@Injectable()
export class SafetyService {
  constructor(private readonly repository: SafetyRepository) {}

  async submitTakedown(dto: EmergencyTakedownSubmitDto) {
    const caseId = await this.repository.submitTakedown(dto);
    return {
      success: true,
      caseId,
      status: 'SUBMITTED',
      message: '긴급 콘텐츠 삭제 요청이 정상 접수되었습니다. 접수 번호와 비밀번호로 처리 상태를 확인하실 수 있습니다.',
    };
  }

  async getTakedownStatus(dto: EmergencyTakedownStatusQueryDto) {
    const statusRow = await this.repository.getTakedownStatus(dto);
    if (!statusRow) {
      throw new NotFoundException('일치하는 접수 건이 없거나 비밀번호가 올바르지 않습니다.');
    }
    return {
      caseId: statusRow.case_id,
      status: statusRow.status,
      reasonCategory: statusRow.reason_category,
      targetContentType: statusRow.target_content_type,
      actionedAt: statusRow.actioned_at,
      createdAt: statusRow.created_at,
    };
  }

  async adminListTakedowns(actorUserId: string, status?: string, limit?: number, offset?: number) {
    const items = await this.repository.adminListTakedowns(actorUserId, status, limit, offset);
    return {
      items,
      count: items.length,
    };
  }

  async adminActionTakedown(actorUserId: string, caseId: string, dto: AdminTakedownActionDto) {
    const success = await this.repository.adminActionTakedown(actorUserId, caseId, dto);
    if (!success) {
      throw new BadRequestException('긴급 삭제 조치 처리에 실패했습니다.');
    }
    return {
      success: true,
      caseId,
      newStatus: dto.newStatus,
    };
  }

  async adminListChatReports(actorUserId: string, status?: string, limit?: number, offset?: number) {
    const items = await this.repository.adminListChatReports(actorUserId, status, limit, offset);
    return {
      items,
      count: items.length,
    };
  }

  async adminGetChatReport(actorUserId: string, reportId: string) {
    const report = await this.repository.adminGetChatReport(actorUserId, reportId);
    if (!report) {
      throw new NotFoundException('해당 신고 건을 찾을 수 없습니다.');
    }
    return report;
  }

  async adminActionChatReport(
    actorUserId: string,
    reportId: string,
    dto: { action: string; note?: string },
  ) {
    const success = await this.repository.adminActionChatReport(
      actorUserId,
      reportId,
      dto.action,
      dto.note,
    );
    if (!success) {
      throw new BadRequestException('신고 건 조치 처리에 실패했습니다.');
    }
    return {
      success: true,
      reportId,
      newStatus: dto.action,
    };
  }
}

