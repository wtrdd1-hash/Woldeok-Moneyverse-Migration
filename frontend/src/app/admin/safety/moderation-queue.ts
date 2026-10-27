import type { ChatReportItem } from './chat-report-evidence-dialog';
import type { TakedownItem } from './takedown-action-dialog';

export const MODERATION_PAGE_SIZE = 50;
export const MODERATION_MAX_OFFSET = 10_000; // Matches NestJS AdminTakedownQuerySchema and AdminChatReportQuerySchema.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CASE_ID = /^TKD-[0-9]{8}-[0-9A-F]{6}$/;
const ISO_TIMESTAMP = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)$/;
function uuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}
function nullableUuid(value: unknown): boolean { return value === null || uuid(value); }
function memberOf(value: unknown, choices: readonly string[]): boolean {
  return typeof value === 'string' && choices.includes(value);
}

type Queue<T> = { readonly items: T[]; readonly count: number };

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonempty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function timestamp(value: unknown): value is string {
  return nonempty(value) && ISO_TIMESTAMP.test(value) && Number.isFinite(Date.parse(value));
}

function nullableTimestamp(value: unknown): boolean { return value === null || timestamp(value); }

function optionalText(value: unknown): boolean {
  return value === null || typeof value === 'string';
}

function parseQueue<T>(
  raw: unknown,
  validate: (value: unknown) => value is T,
  identity: (value: T) => string,
): Queue<T> | null {
  if (!record(raw) || !Array.isArray(raw.items) || raw.items.length > MODERATION_PAGE_SIZE ||
      !Number.isSafeInteger(raw.count) || raw.count !== raw.items.length ||
      !raw.items.every(validate)) return null;
  const items = raw.items as T[];
  if (new Set(items.map(identity)).size !== items.length) return null;
  return { items, count: items.length };
}

function isChatReport(value: unknown): value is ChatReportItem {
  if (!record(value)) return false;
  return ['report_id', 'reporter_id', 'reported_user_id', 'conversation_id']
    .every((key) => uuid(value[key])) &&
    ['reporter_username', 'reporter_nickname', 'reported_username', 'reported_nickname']
      .every((key) => nonempty(value[key])) &&
    memberOf(value.reason, ['spam_promotional', 'fraud_scam', 'abuse_harassment', 'other']) &&
    typeof value.details === 'string' &&
    Number.isSafeInteger(value.evidence_count) && (value.evidence_count as number) >= 0 &&
    (value.evidence_count as number) <= 10 &&
    ['SUBMITTED', 'ACTIONED_BLOCKED', 'ACTIONED_WARNED', 'REJECTED'].includes(String(value.status)) &&
    timestamp(value.created_at) && nullableTimestamp(value.actioned_at) &&
    nullableUuid(value.actioned_by) && optionalText(value.actioner_nickname);
}

function isTakedown(value: unknown): value is TakedownItem {
  if (!record(value)) return false;
  return uuid(value.id) && typeof value.case_id === 'string' && CASE_ID.test(value.case_id) &&
    nonempty(value.requester_email) && value.requester_email.includes('@') &&
    memberOf(value.requester_type, ['victim_self', 'legal_guardian', 'authorized_rep', 'third_party']) &&
    memberOf(value.reason_category, ['non_consensual_private_image', 'underage_harmful_content',
      'doxxing_credible_threat', 'impersonation_account_takeover', 'harassment_stalking', 'illegal_content']) &&
    memberOf(value.target_content_type, ['board_post', 'board_comment', 'gallery_photo',
      'chat_message', 'profile_bio', 'other']) &&
    typeof value.target_content_url === 'string' && value.target_content_url.length <= 1024 &&
    safeTargetHref(value.target_content_url) !== null &&
    typeof value.description === 'string' &&
    ['SUBMITTED', 'TRIAGED', 'ACTIONED_REMOVED', 'ACTIONED_RESTRICTED', 'REJECTED', 'APPEALED'].includes(String(value.status)) &&
    timestamp(value.created_at) && optionalText(value.admin_notes) &&
    nullableTimestamp(value.actioned_at);
}

export function parseChatQueue(raw: unknown): Queue<ChatReportItem> | null {
  return parseQueue(raw, isChatReport, (item) => item.report_id);
}

export function parseTakedownQueue(raw: unknown): Queue<TakedownItem> | null {
  const result = parseQueue(raw, isTakedown, (item) => item.id);
  if (!result || new Set(result.items.map((item) => item.case_id)).size !== result.items.length) return null;
  return result;
}

export function readModerationOffset(raw: string | string[] | undefined): number {
  if (typeof raw !== 'string' || !/^(0|[1-9][0-9]*)$/.test(raw)) return 0;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value <= MODERATION_MAX_OFFSET &&
    value % MODERATION_PAGE_SIZE === 0 ? value : 0;
}

export function moderationPageHref(
  view: 'chat-reports' | 'takedowns',
  chatOffset: number,
  takedownOffset: number,
): string {
  const query = new URLSearchParams({
    view,
    chatOffset: String(chatOffset),
    takedownOffset: String(takedownOffset),
  });
  return '/admin/safety?' + query.toString();
}

export function safeTargetHref(raw: string): string | null {
  try {
    const parsed = new URL(raw);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
      !parsed.username && !parsed.password ? parsed.href : null;
  } catch {
    return null;
  }
}
