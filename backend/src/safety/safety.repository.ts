import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';
import type {
  EmergencyTakedownSubmitDto,
  EmergencyTakedownStatusQueryDto,
  AdminTakedownActionDto,
} from './safety.dto';

export interface TakedownRow {
  readonly id: string;
  readonly case_id: string;
  readonly requester_email: string;
  readonly requester_type: string;
  readonly reason_category: string;
  readonly target_content_url: string;
  readonly target_content_type: string;
  readonly description: string;
  readonly status: string;
  readonly admin_notes: string | null;
  readonly actioned_at: Date | null;
  readonly created_at: Date;
  readonly updated_at: Date;
}

export interface TakedownStatusRow {
  readonly case_id: string;
  readonly status: string;
  readonly reason_category: string;
  readonly target_content_type: string;
  readonly actioned_at: Date | null;
  readonly created_at: Date;
}

export interface ChatReportRow {
  readonly report_id: string;
  readonly reporter_id: string;
  readonly reporter_username: string;
  readonly reporter_nickname: string;
  readonly reported_user_id: string;
  readonly reported_username: string;
  readonly reported_nickname: string;
  readonly conversation_id: string;
  readonly reason: string;
  readonly details: string;
  readonly evidence_count: number;
  readonly status: string;
  readonly created_at: Date;
  readonly actioned_at: Date | null;
  readonly actioned_by: string | null;
  readonly actioner_nickname: string | null;
}

export interface ChatReportDetailRow extends ChatReportRow {
  readonly evidence_snapshot: Array<{
    id: string;
    sender_id: string;
    sequence: number;
    body: string;
    created_at: string;
  }>;
}

@Injectable()
export class SafetyRepository {
  readonly pool: Queryable;

  constructor(pool: Queryable) {
    this.pool = pool;
  }

  hashPasscode(passcode: string): string {
    return createHash('sha256').update(passcode.trim()).digest('hex');
  }

  async submitTakedown(dto: EmergencyTakedownSubmitDto): Promise<string> {
    const passcodeHash = this.hashPasscode(dto.passcode);
    const row = await queryOne<{ case_id: string }>(
      this.pool,
      `SELECT public.safety_submit_emergency_takedown($1, $2, $3, $4, $5, $6, $7) AS case_id`,
      [
        dto.requesterEmail,
        dto.requesterType,
        dto.reasonCategory,
        dto.targetContentUrl,
        dto.targetContentType,
        dto.description,
        passcodeHash,
      ],
    );
    if (!row?.case_id) throw new Error('failed to submit emergency takedown');
    return row.case_id;
  }

  async getTakedownStatus(dto: EmergencyTakedownStatusQueryDto): Promise<TakedownStatusRow | null> {
    const passcodeHash = this.hashPasscode(dto.passcode);
    const row = await queryOne<TakedownStatusRow>(
      this.pool,
      `SELECT case_id, status, reason_category, target_content_type, actioned_at, created_at
       FROM public.safety_get_takedown_status($1, $2)`,
      [dto.caseId, passcodeHash],
    );
    return row ?? null;
  }

  async adminListTakedowns(
    actorUserId: string,
    statusFilter?: string,
    limit = 50,
    offset = 0,
  ): Promise<TakedownRow[]> {
    return queryRows<TakedownRow>(
      this.pool,
      `SELECT id::text AS id, case_id, requester_email, requester_type, reason_category,
              target_content_url, target_content_type, description, status, admin_notes,
              actioned_at, created_at, updated_at
       FROM public.safety_admin_list_takedowns($1, $2, $3, $4)`,
      [actorUserId, statusFilter ?? null, limit, offset],
    );
  }

  async adminActionTakedown(
    actorUserId: string,
    caseId: string,
    dto: AdminTakedownActionDto,
  ): Promise<boolean> {
    const row = await queryOne<{ success: boolean }>(
      this.pool,
      `SELECT public.safety_admin_action_takedown($1, $2, $3, $4) AS success`,
      [actorUserId, caseId, dto.newStatus, dto.adminNotes ?? null],
    );
    return Boolean(row?.success);
  }

  async adminListChatReports(
    actorUserId: string,
    statusFilter?: string,
    limit = 50,
    offset = 0,
  ): Promise<ChatReportRow[]> {
    return queryRows<ChatReportRow>(
      this.pool,
      `SELECT report_id::text, reporter_id::text, reporter_username, reporter_nickname,
              reported_user_id::text, reported_username, reported_nickname,
              conversation_id::text, reason, details, evidence_count, status,
              created_at, actioned_at, actioned_by::text, actioner_nickname
       FROM public.private_chat_admin_list_reports($1, $2, $3, $4)`,
      [actorUserId, statusFilter ?? null, limit, offset],
    );
  }

  async adminGetChatReport(
    actorUserId: string,
    reportId: string,
  ): Promise<ChatReportDetailRow | null> {
    const row = await queryOne<ChatReportDetailRow>(
      this.pool,
      `SELECT report_id::text, reporter_id::text, reporter_username, reporter_nickname,
              reported_user_id::text, reported_username, reported_nickname,
              conversation_id::text, reason, details, evidence_snapshot, status,
              created_at, actioned_at, actioned_by::text, actioner_nickname
       FROM public.private_chat_admin_get_report($1, $2)`,
      [actorUserId, reportId],
    );
    return row ?? null;
  }

  async adminActionChatReport(
    actorUserId: string,
    reportId: string,
    action: string,
    note?: string | undefined,
  ): Promise<boolean> {
    const row = await queryOne<{ success: boolean }>(
      this.pool,
      `SELECT public.private_chat_admin_action_report($1, $2, $3, $4) AS success`,
      [actorUserId, reportId, action, note ?? null],
    );
    return Boolean(row?.success);
  }
}

