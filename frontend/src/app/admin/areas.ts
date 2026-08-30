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
}

export const ADMIN_AREAS: readonly AdminArea[] = [
  {
    href: '/admin/controls',
    eyebrow: 'FEATURE CONTROL',
    title: '기능 스위치 · 정책 버전',
    summary: '기능을 켜고 끄고, 경제 정책 버전을 만들고 되돌립니다.',
  },
  {
    href: '/admin/users',
    eyebrow: 'USER SAFETY',
    title: '사용자 제한 관리',
    summary: '제한과 해제 모두 사유가 남고, 감사 기록에 기록됩니다.',
  },
  {
    href: '/admin/market',
    eyebrow: 'VIRTUAL MARKET',
    title: '가상 주식 종목 관리',
    summary: '종목 등록, 거래 정지, 액면분할 같은 기업 행위.',
  },
  {
    href: '/admin/catalog',
    eyebrow: 'GAME CATALOG',
    title: '사업 · 시즌 이벤트',
    summary: '구입 가능한 사업과 시즌 소비 이벤트를 켜고 끕니다.',
  },
  {
    href: '/admin/economy',
    eyebrow: 'READ-ONLY RECONCILIATION',
    title: '경제 대사',
    summary: '원장 정합성과 통화량. 읽기 전용입니다.',
  },
  {
    href: '/admin/logs',
    eyebrow: 'AUDIT TRAIL',
    title: '감사 로그 · Discord 전달',
    summary: '누가 무엇을 했는지, 무엇이 전달됐는지.',
  },
  {
    href: '/admin/content',
    eyebrow: 'PUBLISHED CONTENT CONTROL',
    title: '공지 · 사진',
    summary: '검토를 마친 소식과 사진만 공개합니다.',
  },
];

export function adminArea(href: string): AdminArea {
  const area = ADMIN_AREAS.find((entry) => entry.href === href);
  if (!area) throw new Error(`no admin area for ${href}`);
  return area;
}
