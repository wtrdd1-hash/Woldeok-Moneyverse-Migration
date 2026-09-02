/**
 * The first-day walkthrough, as data.
 *
 * Written down as a structure rather than as JSX so that the page renders it
 * one way and the tests can assert about it -- what the steps are, that every
 * link points somewhere this application serves, and that the order is the
 * order the product actually enforces. A guide that tells a member to open a
 * screen that does not exist is worse than no guide, and that is exactly the
 * failure a page full of hand-written <a> tags invites.
 */

export interface GuideLink {
  readonly href: string;
  readonly label: string;
}

export interface GuideStep {
  readonly id: string;
  readonly title: string;
  /** One paragraph per entry. Rendered in order, as prose. */
  readonly body: readonly string[];
  /** Optional bulleted list under the prose. */
  readonly points?: readonly string[];
  readonly link?: GuideLink;
}

/** Answers a signed-out visitor can use before deciding whether to join. */
export interface GuideFaq {
  readonly question: string;
  readonly answer: string;
  readonly link?: GuideLink;
}

/**
 * The six steps, in the order a member meets them.
 *
 * The wording follows the product rather than the other way round: step 5
 * sends them to /work because that is where a task is taken (095), and step 3
 * separates 퀘스트 from 작업 because they are two different screens backed by
 * two different tables -- `engagement_progress` records a quest, and only a
 * verified `work_assignment` mints WLD.
 */
export const GUIDE_STEPS: readonly GuideStep[] = [
  {
    id: 'sign-in',
    title: '로그인하고 이용 동의하기',
    body: [
      '오른쪽 위 로그인을 눌러 Discord 또는 Google 계정으로 들어옵니다. 따로 비밀번호를 만들지 않아요.',
      '처음 로그인했다면 이용약관과 개인정보 처리방침을 끝까지 확인한 뒤 동의해야 회원 기능이 열립니다. 동의는 건너뛸 수 없고, 동의하지 않으면 지갑도 퀘스트도 열리지 않아요.',
    ],
    link: { href: '/login', label: '로그인하러 가기' },
  },
  {
    id: 'wallet',
    title: '내 지갑에서 시작 상태 확인하기',
    body: [
      '로그인했다면 내 지갑을 먼저 열어 보세요. 처음에는 잔액이 0이고 기록도 비어 있습니다. 정상이에요. 첫 퀘스트나 첫 작업을 마치면 그때부터 쌓입니다.',
      '이 화면은 원장을 그대로 보여 줍니다. 숫자가 늘거나 줄 때마다 어디서 나와서 어디로 갔는지가 한 줄씩 남아요.',
    ],
    points: [
      '지금 가지고 있는 WLD',
      'WLD가 늘거나 쓰인 기록과 그 사유',
      '작업 보상이 실제로 지급됐는지',
      '상점에서 산 것',
    ],
    link: { href: '/wallet', label: '내 지갑 열기' },
  },
  {
    id: 'quests',
    title: '퀘스트에서 오늘 할 일 보기',
    body: [
      '게임 → 퀘스트에서 오늘의 퀘스트, 이번 주 목표, NPC 주문을 볼 수 있어요. 처음이라면 가장 쉬운 것 하나만 고르는 편이 좋습니다.',
      '퀘스트는 활동을 실제로 마친 뒤에 기록됩니다. 하지 않은 활동을 기록하거나 다른 사람이 한 일을 자기 기록으로 올리면 안 돼요.',
    ],
    link: { href: '/quests', label: '퀘스트 보기' },
  },
  {
    id: 'npc',
    title: '첫 NPC 주문 받기',
    body: [
      '퀘스트 화면의 NPC 주문에서 한 명을 골라 주문을 받습니다. NPC 주문은 "무엇부터 해 보면 좋은지" 알려 주는 초보자 안내 역할이에요.',
      '주문을 받기만 하고 활동을 하지 않았다면 완료로 기록하지 말아 주세요.',
    ],
    points: [
      'NPC가 부탁한 활동이 무엇인지',
      '어디에서 하는 활동인지',
      '완료를 증명해야 하는지',
      '주문이 열려 있는 기간',
    ],
    link: { href: '/quests', label: 'NPC 주문 보러 가기' },
  },
  {
    id: 'work',
    title: '첫 작업 맡기',
    body: [
      'WLD가 실제로 지급되는 곳은 작업입니다. 첫 작업은 보상이 큰 것보다 조건이 단순한 것을 고르세요.',
      '작업을 맡으면 최소 수행 시간과 기한이 함께 걸립니다. 최소 시간을 채우기 전에는 제출할 수 없고, 기한이 지나면 제출할 수 없어요. 맡기 전에 끝낼 수 있는지 확인해 주세요.',
      '작업 화면에 적힌 보상은 지금 마쳤을 때 실제로 지급될 금액입니다. 같은 작업을 하루에 반복하면 줄어들고, 하루·주간 한도에 걸리면 그만큼만 지급돼요.',
    ],
    points: [
      '작업을 고르고 난이도·보상·경험치·최소 수행 시간을 확인합니다',
      '작업 맡기를 누르면 진행 중인 작업에 나타납니다',
      '최소 수행 시간이 지나면 제출하기가 열립니다',
      '제출한 뒤 보상 받기를 누르면 원장에 기록되고 경험치가 쌓입니다',
    ],
    link: { href: '/work', label: '작업 보러 가기' },
  },
  {
    id: 'receipt',
    title: '첫 보상 확인하기',
    body: [
      '보상을 받았다면 작업 화면 아래 영수증과 내 지갑 기록에서 같은 거래를 확인할 수 있어요. 두 곳의 숫자는 같은 원장을 보고 있습니다.',
      '완료했는데 지급되지 않았다면 대개 셋 중 하나예요. 아직 제출만 하고 보상 받기를 누르지 않았거나, 하루·주간 한도를 다 썼거나, 기한이 지나 작업이 닫혔습니다.',
    ],
    points: [
      '어떤 활동으로 WLD가 지급됐는지',
      '지급된 WLD와 경험치',
      '오늘과 이번 주 한도에 남은 여유',
      '작업이 지급 완료 상태인지',
    ],
    link: { href: '/wallet/activity', label: '지갑 기록 보기' },
  },
];

/** The short version, for somebody who wants the order and nothing else. */
export const FIRST_DAY_ORDER: readonly string[] = [
  '로그인하고 이용 동의하기',
  '내 지갑 열어 보기',
  '오늘의 퀘스트 하나 확인하기',
  'NPC 주문 하나 받기',
  '실제로 그 활동 해 보기',
  '퀘스트와 지갑에서 기록 확인하기',
  '시간이 남으면 짧은 작업 하나 맡기',
];

/**
 * Public, product-specific questions — not generic SEO copy. These answers
 * intentionally describe only behaviour the app actually provides.
 */
export const GUIDE_FAQS: readonly GuideFaq[] = [
  {
    question: '월덕 머니버스는 어떤 서비스인가요?',
    answer:
      'Discord로 이어지는 커뮤니티 가상경제 서비스입니다. 활동 기록, WLD 보상, 게임 상점과 시즌 콘텐츠를 웹에서 확인하고 이용할 수 있습니다.',
  },
  {
    question: 'WLD는 현금으로 바꾸거나 거래할 수 있나요?',
    answer:
      '아니요. WLD와 보상은 서비스 안에서만 쓰는 가상 데이터입니다. 현금 거래·환전·실물 경품 교환 기능은 제공하지 않습니다.',
    link: { href: '/terms', label: '이용 기준 확인하기' },
  },
  {
    question: '처음 참여하려면 무엇이 필요한가요?',
    answer:
      'Discord 또는 Google 계정으로 로그인한 뒤 최신 이용약관과 개인정보처리방침에 동의하면 됩니다. 별도의 월덕 비밀번호를 만들지 않습니다.',
    link: { href: '/login', label: '로그인 시작하기' },
  },
  {
    question: '보상은 어떻게 받나요?',
    answer:
      '퀘스트와 작업에서 실제로 완료한 활동을 기록하고, 작업 화면에서 보상 받기를 누르면 WLD와 경험치가 원장에 기록됩니다. 지급 한도와 수행 조건은 각 작업에 표시됩니다.',
    link: { href: '/work', label: '작업 방식 보기' },
  },
  {
    question: '운영 소식과 사진은 어디서 보나요?',
    answer:
      '운영자가 검토해 공개한 소식과 사진만 각각 운영 소식과 사진 페이지에 표시됩니다. 새로운 내용을 확인하려면 이 두 페이지를 방문해 주세요.',
    link: { href: '/announcements', label: '운영 소식 보기' },
  },
];

/** Every internal destination the guide points at, deduplicated. */
export function guideDestinations(): readonly string[] {
  const paths = GUIDE_STEPS.flatMap((step) => (step.link ? [step.link.href] : []));
  return [...new Set(paths)];
}
