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

/**
 * The one sentence the top of the status page leads with.
 *
 * Worst-first, and never better than the worst thing recorded: a page that
 * averaged an outage away would be worse than no page. An unknown source
 * cannot be reported as healthy either, so a board that is entirely unknown
 * says so rather than saying 정상.
 */
export function overallState(states: readonly StatusState[]): StatusState {
  if (states.length === 0) return 'unknown';
  const order: readonly StatusState[] = ['outage', 'degraded', 'maintenance', 'unknown'];
  for (const candidate of order) {
    if (states.includes(candidate)) return candidate;
  }
  return 'operational';
}

export const OVERALL_HEADLINE: Readonly<Record<StatusState, string>> = Object.freeze({
  operational: '모든 서비스가 정상입니다.',
  degraded: '일부 서비스가 느려지고 있어요.',
  outage: '일부 서비스에 장애가 있어요.',
  maintenance: '점검이 진행 중이에요.',
  unknown: '아직 확인된 기록이 없어요.',
});
