/** Fail-closed proof for a member's read-only WLD ledger projection.
 * Never infer a settled payment, recipient or opening/closing balance.
 */
export interface WalletTransactionDetail {
  readonly transactionId: string;
  readonly typeLabel: string;
  readonly occurredAtUtcMicros: string;
  readonly cashDelta: string;
  readonly bankDelta: string;
  readonly netDelta: string;
  readonly currency: 'WLD';
  readonly readStatus: 'READ_OK';
  readonly reconciliationStatus: 'NOT_ASSESSED';
}
const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const WLD = /^(?:0|[1-9][0-9]*|-[1-9][0-9]*)$/;
const MICROS = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/;
const KEYS = [
  'transactionId',
  'typeLabel',
  'occurredAtUtcMicros',
  'cashDelta',
  'bankDelta',
  'netDelta',
  'currency',
  'readStatus',
  'reconciliationStatus',
];
const LABELS = new Set([
  '보상 지급',
  '사용자 송금',
  '운영 수수료',
  '운영 지급',
  '소비',
  '은행 입금',
  '은행 출금',
  '은행 대출',
  '대출 상환',
  '시장 예치',
  '시장 정산',
  '관리자 조정',
  '계정 통합',
  '작업 보상',
  '예금 이자',
  '사업 인수',
  '사업 정산',
  '시즌 소비',
  '상점 구매',
  '동전 게임',
  '주사위 게임',
  '초반 사건 보상',
  '국고 자발적 기부',
  '주식 챔피언십 참가비',
  '마켓 감정서 발급 수수료',
  '주간 유지비',
  '주식 매수',
  '주식 매도',
  '거래정지 원가환급',
  '국채 매입',
  '국채 만기 상환',
  '경제 활동',
]);
export function parseWalletTransactionDetail(value: unknown): WalletTransactionDetail | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const v = value as Record<string, unknown>;
  if (Object.keys(v).length !== KEYS.length || KEYS.some((key) => !(key in v))) return null;
  if (
    typeof v.transactionId !== 'string' ||
    !ID.test(v.transactionId) ||
    typeof v.typeLabel !== 'string' ||
    !LABELS.has(v.typeLabel) ||
    typeof v.occurredAtUtcMicros !== 'string' ||
    !MICROS.test(v.occurredAtUtcMicros) ||
    !Number.isFinite(Date.parse(v.occurredAtUtcMicros)) ||
    new Date(v.occurredAtUtcMicros).toISOString().slice(0, 19) !==
      v.occurredAtUtcMicros.slice(0, 19)
  )
    return null;
  for (const key of ['cashDelta', 'bankDelta', 'netDelta']) {
    const amount = v[key];
    if (
      typeof amount !== 'string' ||
      !WLD.test(amount) ||
      (amount.startsWith('-') ? amount.length - 1 : amount.length) > 38
    )
      return null;
  }
  if (
    BigInt(v.cashDelta as string) + BigInt(v.bankDelta as string) !==
      BigInt(v.netDelta as string) ||
    v.currency !== 'WLD' ||
    v.readStatus !== 'READ_OK' ||
    v.reconciliationStatus !== 'NOT_ASSESSED'
  )
    return null;
  return v as unknown as WalletTransactionDetail;
}
