/** A read-time SQL observation, not proof that an upkeep charge was settled. */
export interface InventoryCondition {
  readonly expires_at?: string | null;
  readonly effect_expires_at?: string | null;
  readonly durable?: boolean;
  readonly weekly_cost?: string;
  readonly unpaid_weeks?: number;
  readonly arrears_due?: string;
  readonly arrears_cap?: string;
  readonly suspended?: boolean;
}

const amountPattern = /^(0|[1-9][0-9]{0,18})$/;
function isSqlBigint(value: unknown): value is string {
  return typeof value === 'string' && amountPattern.test(value) && BigInt(value) <= 9223372036854775807n;
}
const utcTimestamp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

export function isVerifiedInventoryCondition(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const condition = value as Record<string, unknown>;
  for (const field of ['weekly_cost', 'arrears_due', 'arrears_cap']) {
    const amount = condition[field];
    if (amount !== undefined && (!isSqlBigint(amount))) return false;
  }
  if (condition.unpaid_weeks !== undefined && (!Number.isSafeInteger(condition.unpaid_weeks) || (condition.unpaid_weeks as number) < 0)) return false;
  for (const field of ['durable', 'suspended']) {
    if (condition[field] !== undefined && typeof condition[field] !== 'boolean') return false;
  }
  for (const field of ['expires_at', 'effect_expires_at']) {
    const date = condition[field];
    if (date !== undefined && date !== null &&
      (typeof date !== 'string' || !utcTimestamp.test(date) || !Number.isFinite(Date.parse(date)))) return false;
  }
  return true;
}

const unknown = '확인 불가 (원본 근거 없음)';
function money(value: unknown): string {
  return isSqlBigint(value)
    ? `${BigInt(value).toLocaleString('ko-KR')} WLD (조회 시점 보고값)` : unknown;
}
function date(value: unknown): string {
  if (typeof value !== 'string' || !utcTimestamp.test(value) || !Number.isFinite(Date.parse(value))) return unknown;
  return new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) + ' (KST, 조회 시점)';
}

export function describeInventoryCondition(condition: InventoryCondition): ReadonlyArray<{ label: string; value: string }> {
  return [
    { label: '보유 만료', value: date(condition.expires_at) },
    { label: '효과 만료', value: date(condition.effect_expires_at) },
    { label: '지속형 속성', value: condition.durable === true ? '해당 (영구 소유 보증 아님)' : condition.durable === false ? '미해당 (만료 여부 별도)' : unknown },
    { label: '주간 유지비', value: money(condition.weekly_cost) },
    { label: '미납 상태', value: Number.isSafeInteger(condition.unpaid_weeks) && condition.unpaid_weeks! >= 0 ? `${condition.unpaid_weeks}주 보고됨 (정산 인증 아님)` : unknown },
    { label: '체납액', value: money(condition.arrears_due) },
    { label: '현재 유지비 상한', value: money(condition.arrears_cap) },
    { label: '정지 표시', value: condition.suspended === true ? '정지 표시됨' : condition.suspended === false ? '정지 표시 없음 (실시간 인증 아님)' : unknown },
  ];
}
