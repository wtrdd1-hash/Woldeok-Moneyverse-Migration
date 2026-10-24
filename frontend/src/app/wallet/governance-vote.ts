/** Values must match treasury_cast_citizen_budget_vote in migration 243. */
export const GOVERNANCE_CHOICES = [
  { value: 'WELFARE', label: '시민 복지 우선', description: '기본소득과 시민 안전망 지원을 우선합니다.' },
  { value: 'INFRASTRUCTURE', label: '공공 인프라 우선', description: '서버와 커뮤니티 인프라에 우선 투자합니다.' },
  { value: 'CITIZEN_DIVIDEND', label: '시민 배당 우선', description: '국고 잉여금의 시민 환원 배당을 우선합니다.' },
  { value: 'CURRENCY_STABILIZATION', label: '통화 안정 우선', description: '가상경제의 유동성과 통화 안정을 우선합니다.' },
] as const;

export function currentKstQuarter(at: Date = new Date()): string {
  const kst = new Date(at.getTime() + 9 * 60 * 60 * 1000);
  return `${kst.getUTCFullYear()}-Q${Math.floor(kst.getUTCMonth() / 3) + 1}`;
}
