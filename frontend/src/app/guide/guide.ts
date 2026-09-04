export interface GuideLink {
  readonly href: string;
  readonly label: string;
  readonly labelEn?: string;
}

export interface GuideStep {
  readonly id: string;
  readonly title: string;
  readonly titleEn: string;
  readonly body: readonly string[];
  readonly bodyEn: readonly string[];
  readonly points?: readonly string[];
  readonly pointsEn?: readonly string[];
  readonly link?: GuideLink;
}

export interface GuideFaq {
  readonly question: string;
  readonly questionEn: string;
  readonly answer: string;
  readonly answerEn: string;
  readonly link?: GuideLink;
}

export interface BeginnerTip {
  readonly title: string;
  readonly titleEn: string;
  readonly body: string;
  readonly bodyEn: string;
}

export const QUICK_START_STEPS: readonly string[] = [
  'Discord 또는 Google로 로그인하기',
  '지갑에서 시작 잔액 확인하기',
  '오늘의 퀘스트 하나 고르기',
  '활동을 마치고 기록 확인하기',
];

export const QUICK_START_STEPS_EN: readonly string[] = [
  'Sign in with Discord or Google',
  'Check initial balance in your wallet',
  'Choose one of today’s quests',
  'Complete an activity and verify ledger records',
];

export const BEGINNER_TIPS: readonly BeginnerTip[] = [
  {
    title: '처음에는 하나만',
    titleEn: 'Start with Just One',
    body: '퀘스트와 작업을 여러 개 펼치기보다 가장 쉬운 활동 하나를 끝까지 마쳐 보세요.',
    bodyEn: 'Rather than starting multiple quests at once, finish one simple task from start to end.',
  },
  {
    title: '숫자는 지갑에서 확인',
    titleEn: 'Verify Numbers in Wallet',
    body: '보상을 받았다면 지갑 기록에서 지급 사유와 WLD가 함께 남았는지 확인하세요.',
    bodyEn: 'After earning rewards, check your wallet activity to see the WLD amount and reason.',
  },
  {
    title: '모르면 운영 소식부터',
    titleEn: 'Check Updates When in Doubt',
    body: '진행 방식이 달라졌거나 기능이 잠시 멈춘 경우 운영 소식과 서비스 상태에 먼저 안내됩니다.',
    bodyEn: 'System updates or maintenance notices are always posted first on Announcements and Status.',
  },
];

export const GUIDE_STEPS: readonly GuideStep[] = [
  {
    id: 'sign-in',
    title: '로그인하고 이용 동의하기',
    titleEn: 'Sign In and Agree to Terms',
    body: [
      '오른쪽 위 로그인을 눌러 Discord 또는 Google 계정으로 들어옵니다. 따로 비밀번호를 만들지 않아요.',
      '처음 로그인했다면 이용약관과 개인정보 처리방침을 끝까지 확인한 뒤 동의해야 회원 기능이 열립니다. 동의는 건너뛸 수 없고, 동의하지 않으면 지갑도 퀘스트도 열리지 않아요.',
    ],
    bodyEn: [
      'Click Sign In on the top right using your Discord or Google account. No separate password needed.',
      'On your first login, please read and agree to our Terms of Service and Privacy Policy to unlock member features.',
    ],
    link: { href: '/login', label: '로그인하러 가기', labelEn: 'Go to Sign In' },
  },
  {
    id: 'wallet',
    title: '내 지갑에서 시작 상태 확인하기',
    titleEn: 'Check Starting Status in My Wallet',
    body: [
      '로그인했다면 내 지갑을 먼저 열어 보세요. 처음에는 잔액이 0이고 기록도 비어 있습니다. 정상이에요. 첫 퀘스트나 첫 작업을 마치면 그때부터 쌓입니다.',
      '이 화면은 원장을 그대로 보여 줍니다. 숫자가 늘거나 줄 때마다 어디서 나와서 어디로 갔는지가 한 줄씩 남아요.',
    ],
    bodyEn: [
      'Open My Wallet after signing in. Starting balance is 0 WLD. As you finish quests and jobs, rewards will accumulate.',
      'This screen reflects the real double-entry ledger. Every increase or spend is recorded transparently.',
    ],
    points: [
      '지금 가지고 있는 WLD',
      'WLD가 늘거나 쓰인 기록과 그 사유',
      '작업 보상이 실제로 지급됐는지',
      '상점에서 산 것',
    ],
    pointsEn: [
      'Current WLD balance',
      'Transaction history and reasons',
      'Work reward payout verification',
      'Purchased shop items',
    ],
    link: { href: '/wallet', label: '내 지갑 열기', labelEn: 'Open Wallet' },
  },
  {
    id: 'quests',
    title: '퀘스트에서 오늘 할 일 보기',
    titleEn: 'Find Daily Tasks in Quests',
    body: [
      '활동 → 퀘스트에서 오늘의 퀘스트, 이번 주 목표, NPC 주문을 볼 수 있어요. 처음이라면 가장 쉬운 것 하나만 고르는 편이 좋습니다.',
      '퀘스트는 활동을 실제로 마친 뒤에 기록됩니다. 하지 않은 활동을 기록하거나 다른 사람이 한 일을 자기 기록으로 올리면 안 돼요.',
    ],
    bodyEn: [
      'Visit Earn → Quests to view daily quests, weekly goals, and NPC orders. Picking the simplest one first is recommended.',
      'Quests are recorded upon actual completion. Please only submit genuine activities.',
    ],
    link: { href: '/quests', label: '퀘스트 보기', labelEn: 'View Quests' },
  },
  {
    id: 'npc',
    title: '첫 NPC 주문 받기',
    titleEn: 'Receive Your First NPC Order',
    body: [
      '퀘스트 화면의 NPC 주문에서 한 명을 골라 주문을 받습니다. NPC 주문은 "무엇부터 해 보면 좋은지" 알려 주는 초보자 안내 역할이에요.',
      '주문을 받기만 하고 활동을 하지 않았다면 완료로 기록하지 말아 주세요.',
    ],
    bodyEn: [
      'Choose an NPC in the quest tab to take an order. NPC orders guide newcomers on what to do first.',
      'Make sure to complete the requested task before claiming completion.',
    ],
    points: [
      'NPC가 부탁한 활동이 무엇인지',
      '어디에서 하는 활동인지',
      '완료를 증명해야 하는지',
      '주문이 열려 있는 기간',
    ],
    pointsEn: [
      'Requested task details',
      'Activity location and requirements',
      'Completion verification method',
      'Order availability timeframe',
    ],
    link: { href: '/quests', label: 'NPC 주문 보러 가기', labelEn: 'View NPC Orders' },
  },
  {
    id: 'work',
    title: '첫 작업 맡기',
    titleEn: 'Accept Your First Job Assignment',
    body: [
      'WLD가 실제로 지급되는 곳은 작업입니다. 첫 작업은 보상이 큰 것보다 조건이 단순한 것을 고르세요.',
      '작업을 맡으면 최소 수행 시간과 기한이 함께 걸립니다. 최소 시간을 채우기 전에는 제출할 수 없고, 기한이 지나면 제출할 수 없어요. 맡기 전에 끝낼 수 있는지 확인해 주세요.',
      '작업 화면에 적힌 보상은 지금 마쳤을 때 실제로 지급될 금액입니다. 같은 작업을 하루에 반복하면 줄어들고, 하루·주간 한도에 걸리면 그만큼만 지급돼요.',
    ],
    bodyEn: [
      'The Work Board is where WLD is minted and paid. For your first job, pick one with simple requirements.',
      'Assignments have minimum execution time and deadlines. Verify you can fulfill the time before accepting.',
      'Job rewards scale dynamically based on repetition and daily/weekly quotas.',
    ],
    points: [
      '작업을 고르고 난이도·보상·경험치·최소 수행 시간을 확인합니다',
      '작업 맡기를 누르면 진행 중인 작업에 나타납니다',
      '최소 수행 시간이 지나면 제출하기가 열립니다',
      '제출한 뒤 보상 받기를 누르면 원장에 기록되고 경험치가 쌓입니다',
    ],
    pointsEn: [
      'Check difficulty, reward, EXP, and minimum time',
      'Click Accept to start your active assignment',
      'Submit becomes available after the minimum duration',
      'Claim reward to record WLD into the ledger and earn EXP',
    ],
    link: { href: '/work', label: '작업 보러 가기', labelEn: 'Go to Work Board' },
  },
  {
    id: 'receipt',
    title: '첫 보상 확인하기',
    titleEn: 'Verify Your First Reward',
    body: [
      '보상을 받았다면 작업 화면 아래 영수증과 내 지갑 기록에서 같은 거래를 확인할 수 있어요. 두 곳의 숫자는 같은 원장을 보고 있습니다.',
      '완료했는데 지급되지 않았다면 대개 셋 중 하나예요. 아직 제출만 하고 보상 받기를 누르지 않았거나, 하루·주간 한도를 다 썼거나, 기한이 지나 작업이 닫혔습니다.',
    ],
    bodyEn: [
      'After claiming, verify the transaction receipt in the work view and in your wallet history.',
      'If not received, make sure you clicked Claim, have daily quota left, and met the deadline.',
    ],
    points: [
      '어떤 활동으로 WLD가 지급됐는지',
      '지급된 WLD와 경험치',
      '오늘과 이번 주 한도에 남은 여유',
      '작업이 지급 완료 상태인지',
    ],
    pointsEn: [
      'Activity details for WLD payment',
      'Minted WLD and accumulated EXP',
      'Remaining daily and weekly allowance',
      'Payout completion status',
    ],
    link: { href: '/wallet/activity', label: '지갑 기록 보기', labelEn: 'View Wallet Activity' },
  },
];

export const FIRST_DAY_ORDER: readonly string[] = [
  '로그인하고 이용 동의하기',
  '내 지갑 열어 보기',
  '오늘의 퀘스트 하나 확인하기',
  'NPC 주문 하나 받기',
  '실제로 그 활동 해 보기',
  '퀘스트와 지갑에서 기록 확인하기',
  '시간이 남으면 짧은 작업 하나 맡기',
];

export const FIRST_DAY_ORDER_EN: readonly string[] = [
  'Sign in and accept Terms',
  'Open and inspect your wallet',
  'Check today’s active quests',
  'Accept an introductory NPC order',
  'Complete the designated activity',
  'Verify completion in quests and wallet',
  'Try a short assignment on the Work Board',
];

export const GUIDE_FAQS: readonly GuideFaq[] = [
  {
    question: '월덕 머니버스는 어떤 서비스인가요?',
    questionEn: 'What is Woldeok Moneyverse?',
    answer:
      'Discord로 이어지는 커뮤니티 가상경제 서비스입니다. 활동 기록, WLD 보상, 게임 상점과 시즌 콘텐츠를 웹에서 확인하고 이용할 수 있습니다.',
    answerEn:
      'A community virtual economy platform connected with Discord. You can track activity records, earn WLD, use the item shop, and enjoy seasonal content.',
  },
  {
    question: 'WLD는 현금으로 바꾸거나 거래할 수 있나요?',
    questionEn: 'Can WLD be exchanged or traded for cash?',
    answer:
      '아니요. WLD와 보상은 서비스 안에서만 쓰는 가상 데이터입니다. 현금 거래·환전·실물 경품 교환 기능은 제공하지 않습니다.',
    answerEn:
      'No. WLD and all in-game rewards are purely virtual. Cash transactions, conversions, and real-world prize exchanges are strictly not supported.',
    link: { href: '/terms', label: '이용 기준 확인하기', labelEn: 'Review Terms of Service' },
  },
  {
    question: '처음 참여하려면 무엇이 필요한가요?',
    questionEn: 'What do I need to get started?',
    answer:
      'Discord 또는 Google 계정으로 로그인한 뒤 최신 이용약관과 개인정보처리방침에 동의하면 됩니다. 별도의 월덕 비밀번호를 만들지 않습니다.',
    answerEn:
      'Sign in with Discord or Google, then agree to our Terms and Privacy Policy. No separate password is created.',
    link: { href: '/login', label: '로그인 시작하기', labelEn: 'Start Sign In' },
  },
  {
    question: '보상은 어떻게 받나요?',
    questionEn: 'How do I receive rewards?',
    answer:
      '퀘스트와 작업에서 실제로 완료한 활동을 기록하고, 작업 화면에서 보상 받기를 누르면 WLD와 경험치가 원장에 기록됩니다. 지급 한도와 수행 조건은 각 작업에 표시됩니다.',
    answerEn:
      'Fulfill quests and jobs, then click Claim Rewards on the Work Board to record WLD and EXP to the ledger.',
    link: { href: '/work', label: '작업 방식 보기', labelEn: 'View Work Guide' },
  },
  {
    question: '운영 소식과 사진은 어디서 보나요?',
    questionEn: 'Where can I read announcements and gallery photos?',
    answer:
      '운영자가 검토해 공개한 소식과 사진만 각각 운영 소식과 사진 페이지에 표시됩니다. 새로운 내용을 확인하려면 이 두 페이지를 방문해 주세요.',
    answerEn:
      'Approved news and photos are published on Announcements and Gallery pages respectively.',
    link: { href: '/announcements', label: '운영 소식 보기', labelEn: 'View Announcements' },
  },
  {
    question: '이용 동의는 로그인할 때마다 해야 하나요?',
    questionEn: 'Do I need to accept the terms on every login?',
    answer:
      '아니요. 같은 계정에서 현재 문서 버전에 한 번 동의하면 다시 묻지 않습니다. 이용약관이나 개인정보처리방침이 변경된 경우에만 새 내용을 확인하고 다시 동의합니다.',
    answerEn:
      'No. Once accepted on an account, you will only be asked again if policies are updated.',
    link: { href: '/privacy', label: '개인정보 안내 보기', labelEn: 'Privacy Guide' },
  },
  {
    question: '어디서부터 해야 할지 다시 잊어버렸어요.',
    questionEn: 'What if I forget where to start?',
    answer:
      '괜찮아요. 내 지갑에서 현재 기록을 확인한 뒤 퀘스트 화면으로 돌아가 가장 쉬운 활동 하나를 고르면 됩니다. 진행 중인 작업이 있다면 새 작업보다 그 작업을 먼저 확인하세요.',
    answerEn:
      'No worries. Check your current wallet status, then visit Quests to choose one simple task to complete.',
    link: { href: '/quests', label: '퀘스트로 돌아가기', labelEn: 'Back to Quests' },
  },
];

export function guideDestinations(): readonly string[] {
  const paths = GUIDE_STEPS.flatMap((step) => (step.link ? [step.link.href] : []));
  return [...new Set(paths)];
}
