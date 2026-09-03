/**
 * The operations console's areas.
 *
 * One list, read by the overview that links to them and by each page that
 * titles itself from its own entry, so a name cannot say one thing on the
 * card and another on the page it opens.
 *
 * The console used to be a single page with five tabs, which meant four
 * fifths of what an operator could do was invisible — the original showed
 * every panel stacked on one screen, and the port had quietly made the
 * surface look smaller than it is. These are those panels, each with room to
 * be a page.
 */
export interface AdminArea {
  readonly href: string;
  readonly eyebrow: string;
  readonly title: string;
  /** One line on the overview card, saying what the area is for. */
  readonly summary: string;
  readonly group: 'safety' | 'economy' | 'records';
}

export const ADMIN_AREAS: readonly AdminArea[] = [
  {
    href: '/admin/controls',
    eyebrow: 'FEATURE CONTROL',
    title: '기능 스위치 · 정책 버전',
    summary: '기능을 켜고 끄고, 경제 정책 버전을 만들고 되돌립니다.',
    group: 'economy',
  },
  {
    href: '/admin/users',
    eyebrow: 'USER SAFETY',
    title: '사용자 제한 관리',
    summary: '제한과 해제 모두 사유가 남고, 감사 기록에 기록됩니다.',
    group: 'safety',
  },
  {
    href: '/admin/market',
    eyebrow: 'VIRTUAL MARKET',
    title: '가상 주식 종목 관리',
    summary: '종목 등록, 거래 정지, 액면분할 같은 기업 행위.',
    group: 'economy',
  },
  {
    href: '/admin/catalog',
    eyebrow: 'GAME CATALOG',
    title: '사업 · 시즌 이벤트',
    summary: '구입 가능한 사업과 시즌 소비 이벤트를 켜고 끕니다.',
    group: 'economy',
  },
  {
    href: '/admin/work',
    eyebrow: 'WORK AND JOBS',
    title: '작업 · 직업',
    summary: '작업 카탈로그와 보상 한도, 직업별 숙련도.',
    group: 'economy',
  },
  {
    href: '/admin/bank',
    eyebrow: 'BANK AND CREDIT',
    title: '은행 · 대출',
    summary: '예금과 남은 대출, 신용 등급별 한도와 연체.',
    group: 'economy',
  },
  {
    href: '/admin/economy',
    eyebrow: 'ECONOMY OPERATIONS',
    title: '경제 운영',
    summary: '통화량과 발행, 알림, 자동 조정 엔진, 일괄 지급.',
    group: 'economy',
  },
  {
    href: '/admin/logs',
    eyebrow: 'AUDIT TRAIL',
    title: '감사 로그',
    summary: '누가 무엇을 했는지 조건별로 검색하고 상세 기록을 확인합니다.',
    group: 'records',
  },
  {
    href: '/admin/logs/delivery',
    eyebrow: 'DELIVERY LOG',
    title: 'Discord 전달 로그',
    summary: '알림 전달 성공 여부와 재시도 상태를 별도 화면에서 확인합니다.',
    group: 'records',
  },
  {
    href: '/admin/logs/integrity',
    eyebrow: 'CHAIN INTEGRITY',
    title: '무결성 검증 · 보존 정책',
    summary: '사슬을 다시 계산하고, 보존 기간과 파기 기록을 남깁니다.',
    group: 'records',
  },
  {
    href: '/admin/discord',
    eyebrow: 'DISCORD DELIVERY',
    title: 'Discord 전달 경로',
    summary: '어떤 사건이 어느 채널로 나가는지, 무엇이 밀려 있는지.',
    group: 'records',
  },
  {
    href: '/admin/content',
    eyebrow: 'PUBLISHED CONTENT CONTROL',
    title: '공지 · 사진',
    summary: '검토를 마친 소식과 사진만 공개합니다.',
    group: 'safety',
  },
];

export function adminArea(href: string): AdminArea {
  const area = ADMIN_AREAS.find((entry) => entry.href === href);
  if (!area) throw new Error(`no admin area for ${href}`);
  return area;
}
