/**
 * The five states the content service records, and their Korean labels.
 *
 * `unknown` is the fallback everywhere, never `operational`. The original was
 * explicit that an unreachable source must not be rendered as a healthy one:
 * "확인 중" is the honest answer when nothing was reported.
 */
export const STATUS_STATES = ['operational', 'degraded', 'outage', 'maintenance', 'unknown'] as const;

export type StatusState = (typeof STATUS_STATES)[number];

export const STATUS_LABEL: Readonly<Record<StatusState, string>> = Object.freeze({
  operational: '정상',
  degraded: '성능 저하',
  outage: '장애',
  maintenance: '점검 중',
  unknown: '확인 중',
});

export function asStatusState(value: unknown): StatusState {
  return typeof value === 'string' && (STATUS_STATES as readonly string[]).includes(value)
    ? (value as StatusState)
    : 'unknown';
}
