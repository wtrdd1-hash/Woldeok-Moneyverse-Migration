/** Public takedown status must be backed by a passcode-authorized server response. */
export interface TakedownReceipt {
  readonly caseId: string;
  readonly status: 'SUBMITTED' | 'TRIAGED' | 'ACTIONED_REMOVED' | 'ACTIONED_RESTRICTED' | 'REJECTED' | 'APPEALED';
  readonly reasonCategory: string;
  readonly targetContentType: string;
  readonly createdAt: string;
  readonly actionedAt: string | null;
}

const statuses = new Set(['SUBMITTED', 'TRIAGED', 'ACTIONED_REMOVED', 'ACTIONED_RESTRICTED', 'REJECTED', 'APPEALED']);
const reasons = new Set(['non_consensual_private_image', 'underage_harmful_content', 'doxxing_credible_threat', 'impersonation_account_takeover', 'harassment_stalking', 'illegal_content']);
const contentTypes = new Set(['board_post', 'board_comment', 'gallery_photo', 'chat_message', 'profile_bio', 'other']);

function validTimestamp(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value)) return false;
  const time = new Date(value);
  return Number.isFinite(time.getTime()) && time.toISOString().slice(0, 19) === value.slice(0, 19);
}

export function parseTakedownStatus(value: unknown): TakedownReceipt | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  if (typeof row.caseId !== 'string' || row.caseId.length < 5 || row.caseId.length > 32 ||
      !/^[A-Za-z0-9-]+$/.test(row.caseId) ||
      typeof row.status !== 'string' || !statuses.has(row.status) ||
      typeof row.reasonCategory !== 'string' || !reasons.has(row.reasonCategory) ||
      typeof row.targetContentType !== 'string' || !contentTypes.has(row.targetContentType) ||
      !validTimestamp(row.createdAt) ||
      (row.actionedAt !== null && !validTimestamp(row.actionedAt))) return null;
  return {
    caseId: row.caseId,
    status: row.status as TakedownReceipt['status'],
    reasonCategory: row.reasonCategory,
    targetContentType: row.targetContentType,
    createdAt: row.createdAt,
    actionedAt: row.actionedAt as string | null,
  };
}

export const takedownStatusLabels: Record<TakedownReceipt['status'], string> = {
  SUBMITTED: '접수됨',
  TRIAGED: '검토 중',
  ACTIONED_REMOVED: '삭제 조치됨',
  ACTIONED_RESTRICTED: '접근 제한 조치됨',
  REJECTED: '요청 반려됨',
  APPEALED: '재검토 요청됨',
};
