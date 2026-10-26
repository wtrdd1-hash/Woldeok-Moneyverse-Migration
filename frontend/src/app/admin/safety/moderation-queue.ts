import type { ChatReportItem } from './chat-report-evidence-dialog';
import type { TakedownItem } from './takedown-action-dialog';

export const MODERATION_PAGE_SIZE = 50;
export const MODERATION_MAX_OFFSET = 100_000;

type Queue<T> = { readonly items: T[]; readonly count: number };

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonempty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function timestamp(value: unknown): value is string {
  return nonempty(value) && Number.isFinite(Date.parse(value));
}

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
  return ['report_id', 'reporter_id', 'reporter_username', 'reporter_nickname',
    'reported_user_id', 'reported_username', 'reported_nickname', 'conversation_id',
    'reason'].every((key) => nonempty(value[key])) &&
    typeof value.details === 'string' &&
    Number.isSafeInteger(value.evidence_count) && (value.evidence_count as number) >= 0 &&
    (value.evidence_count as number) <= 10 &&
    ['SUBMITTED', 'ACTIONED_BLOCKED', 'ACTIONED_WARNED', 'REJECTED'].includes(String(value.status)) &&
    timestamp(value.created_at) && optionalText(value.actioned_at) &&
    optionalText(value.actioned_by) && optionalText(value.actioner_nickname);
}

function isTakedown(value: unknown): value is TakedownItem {
  if (!record(value)) return false;
  return ['id', 'case_id', 'requester_email', 'requester_type', 'reason_category',
    'target_content_url', 'target_content_type'].every((key) => nonempty(value[key])) &&
    typeof value.description === 'string' &&
    ['SUBMITTED', 'TRIAGED', 'ACTIONED_REMOVED', 'ACTIONED_RESTRICTED', 'REJECTED', 'APPEALED'].includes(String(value.status)) &&
    timestamp(value.created_at) && optionalText(value.admin_notes) &&
    optionalText(value.actioned_at);
}

export function parseChatQueue(raw: unknown): Queue<ChatReportItem> | null {
  return parseQueue(raw, isChatReport, (item) => item.report_id);
}

export function parseTakedownQueue(raw: unknown): Queue<TakedownItem> | null {
  return parseQueue(raw, isTakedown, (item) => item.id);
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
