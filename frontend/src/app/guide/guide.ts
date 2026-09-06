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

export interface EconomyPillar {
  readonly id: string;
  readonly badgeKo: string;
  readonly badgeEn: string;
  readonly titleKo: string;
  readonly titleEn: string;
  readonly descKo: string;
  readonly descEn: string;
  readonly featuresKo: readonly string[];
  readonly featuresEn: readonly string[];
  readonly link: GuideLink;
}

export interface GrowthStage {
  readonly step: number;
  readonly stageKo: string;
  readonly stageEn: string;
  readonly titleKo: string;
  readonly titleEn: string;
  readonly descKo: string;
  readonly descEn: string;
  readonly targetKo: string;
  readonly targetEn: string;
  readonly actionsKo: readonly string[];
  readonly actionsEn: readonly string[];
}

export const QUICK_START_STEPS: readonly string[] = [
  'Discord 또는 Google로 로그인하기',
  '지갑에서 시작 잔액 확인하기',
  '오늘의 퀘스트와 8대 직업 선택하기',
  '활동을 마치고 복리 예금과 상점 활용하기',
];

export const QUICK_START_STEPS_EN: readonly string[] = [
  'Sign in with Discord or Google',
  'Check initial balance in your wallet',
  'Choose daily quests and select your profession',
  'Complete work, enjoy compound savings and the shop',
];

export const BEGINNER_TIPS: readonly BeginnerTip[] = [
  {
    title: '처음에는 하나만',
    titleEn: 'Start with Just One',
    body: '퀘스트와 작업을 여러 개 펼치기보다 가장 쉬운 활동 하나를 끝까지 마쳐 보세요.',
    bodyEn: 'Rather than starting multiple quests at once, finish one simple task from start to end.',
  },
  {
    title: '남는 WLD는 은행 복리 예금에',
    titleEn: 'Deposit Idle WLD in Savings',
    body: '지갑에 모인 WLD를 은행 복리 예금에 넣으면 일 단위로 이자가 누적됩니다. 은행 화면에서 정산을 요청하면 원장에 반영됩니다.',
    bodyEn: 'Deposit earned WLD into compound savings. Interest accrues daily and is posted to the ledger when you claim it from the bank.',
  },
  {
    title: '숫자는 지갑과 원장에서 확인',
    titleEn: 'Verify Numbers in Wallet & Ledger',
    body: '보상, 이자, 배당금 등 처리 완료된 재화 변동은 복식부기 원장과 내 지갑 기록에서 확인할 수 있습니다.',
    bodyEn: 'Completed payouts, interest claims, and dividends are recorded in the double-entry ledger and wallet history.',
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
      '로그인했다면 내 지갑을 먼저 열어 보세요. 처음에는 잔액이 0이고 기록도 비어 있습니다. 정상이에요. 첫 퀘스트나 첫 작업을 마치면 그때부터 차곡차곡 쌓입니다.',
      '이 화면은 투명한 복식부기 원장을 그대로 보여 줍니다. 숫자가 늘거나 줄 때마다 어디서 나와서 어디로 갔는지가 한 줄씩 투명하게 남아요.',
    ],
    bodyEn: [
      'Open My Wallet after signing in. Starting balance is 0 WLD. As you finish quests and jobs, rewards will accumulate.',
      'This screen reflects the real double-entry ledger. Every increase or spend is recorded transparently.',
    ],
    points: [
      '지금 가지고 있는 WLD 잔액',
      'WLD가 늘거나 쓰인 기록과 그 거래 사유',
      '작업 보상 및 정산된 복리 이자 내역',
      '상점에서 구매한 아이템 및 소모품',
    ],
    pointsEn: [
      'Current WLD balance',
      'Transaction history and reasons',
      'Work reward and compound interest verification',
      'Purchased shop items and tools',
    ],
    link: { href: '/wallet', label: '내 지갑 열기', labelEn: 'Open Wallet' },
  },
  {
    id: 'quests',
    title: '퀘스트에서 오늘 할 일 보기',
    titleEn: 'Find Daily Tasks in Quests',
    body: [
      '활동 → 퀘스트에서 오늘의 퀘스트, 이번 주 목표, NPC 주문을 볼 수 있어요. 처음이라면 가장 쉬운 것 하나만 고르는 편이 좋습니다.',
      '퀘스트는 활동을 실제로 마친 뒤에 기록됩니다. 공정한 가상경제 유지를 위해 정당하게 수행한 활동만 기록해 주세요.',
    ],
    bodyEn: [
      'Visit Earn → Quests to view daily quests, weekly goals, and NPC orders. Picking the simplest one first is recommended.',
      'Quests are recorded upon actual completion. Please only submit genuine activities.',
    ],
    points: [
      '수행할 활동 위치와 조건',
      '완료 확인 방식 및 보상 WLD',
      '주문이 유지되는 시간',
    ],
    pointsEn: [
      'Activity location and requirements',
      'Completion verification method and WLD reward',
      'Order availability timeframe',
    ],
    link: { href: '/quests', label: 'NPC 주문 보러 가기', labelEn: 'View NPC Orders' },
  },
  {
    id: 'work',
    title: '8대 전문 직업 선택과 첫 작업 맡기',
    titleEn: 'Choose an Occupation & Accept Work',
    body: [
      'WLD가 지속적으로 채굴되고 지급되는 핵심 공간은 바로 잡보드(작업판)입니다.',
      '광부, 농부, 엔지니어, 트레이더, 연구원, 예술가, 경비원, 상인 등 8대 전문 직업군 중 원하는 직업을 선택하고 승급해 보세요.',
      '작업을 맡으면 최소 수행 시간과 기한이 걸립니다. 완료 후 보상 받기를 누르면 원장에 WLD가 기록되고 직업 경험치(EXP)가 올라갑니다.',
    ],
    bodyEn: [
      'The Work Board is the central engine where WLD is minted and distributed.',
      'Choose from 8 distinct professions: Miner, Farmer, Engineer, Trader, Researcher, Artist, Guard, and Merchant.',
      'Fulfill the assignment duration and click Claim to receive WLD in the ledger and gain career EXP.',
    ],
    points: [
      '광부/농부/엔지니어 등 8가지 전문 직업 선택',
      '작업 난이도·보상·경험치·최소 수행 시간 확인',
      '작업 완료 시 숙련도 레벨 승급 및 WLD 보너스 획득',
      '매일 주어지는 에너지와 쿨다운을 고려한 계획적 활동',
    ],
    pointsEn: [
      'Select from 8 career options like Miner, Farmer, Engineer',
      'Check difficulty, reward, EXP, and minimum time',
      'Level up career mastery for higher payout bonuses',
      'Plan around daily energy and cooldown mechanics',
    ],
    link: { href: '/work', label: '8대 직업 작업판 가기', labelEn: 'Go to Work Board' },
  },
  {
    id: 'receipt',
    title: '첫 보상 확인 및 복리 예금·상점 활용하기',
    titleEn: 'Verify Rewards, Deposit in Savings & Use Shop',
    body: [
      '보상을 받았다면 내 지갑 기록에서 거래를 즉시 확인할 수 있습니다. 모든 숫자는 동일한 원장 블록에 안전하게 기록됩니다.',
      '모은 WLD는 은행 복리 예금, 생산성 도구, 가상 주식 및 사업체 등 서비스 안의 여러 기능에 사용할 수 있습니다. 수익이나 원금은 보장되지 않는 가상경제 데이터입니다.',
    ],
    bodyEn: [
      'After claiming, verify the transaction receipt in your wallet history. All figures are secured by the ledger.',
      'Put your earned WLD into Bank Compound Savings to grow interest, buy productivity tools in the shop, or invest in stocks and businesses.',
    ],
    points: [
      '어떤 활동과 직업으로 WLD가 지급되었는지 확인',
      '지급된 WLD와 축적된 직업 경험치',
      '은행 복리 예금 또는 만기 국채 가입을 통한 자산 증식',
      '상점 도구 구매 및 카지노 미니게임을 통한 여가',
    ],
    pointsEn: [
      'Activity and profession details for WLD payment',
      'Minted WLD and accumulated career EXP',
      'Wealth accumulation via Bank Savings or Treasury Bonds',
      'Productivity boosts from the shop and casino entertainment',
    ],
    link: { href: '/wallet/activity', label: '지갑 기록 보기', labelEn: 'View Wallet Activity' },
  },
];

export const ECONOMY_PILLARS: readonly EconomyPillar[] = [
  {
    id: 'bank',
    badgeKo: '가상 금융 2.0',
    badgeEn: 'Virtual Banking 2.0',
    titleKo: '🏦 복리 정기예금 & 만기 국채 & 스마트 대출',
    titleEn: '🏦 Compound Savings, Treasury Bonds & Loans',
    descKo:
      '모은 WLD를 은행에 예치하면 일 단위로 복리 이자가 누적되고, 은행 화면에서 직접 정산할 수 있습니다. 7일/30일 만기 가상 국채와 신용도 기반 가상 대출도 이용할 수 있습니다.',
    descEn:
      'Deposit WLD to accrue daily compound interest and claim it from the bank. Virtual 7-day and 30-day bonds and credit-based loans are also available.',
    featuresKo: [
      '일일 복리 예금 (누적 이자를 직접 정산)',
      '7일 및 30일 만기 가상 국채',
      '신용 등급 기반 스마트 비상 대출',
    ],
    featuresEn: [
      'Daily Compounding Savings (claim accrued interest)',
      '7-day & 30-day Virtual Treasury Bonds',
      'Credit-score based smart emergency loans',
    ],
    link: { href: '/bank', label: '가상 금융 포털 가기', labelEn: 'Go to Virtual Banking' },
  },
  {
    id: 'work',
    badgeKo: '전문 직업군 2.0',
    badgeEn: 'Careers 2.0',
    titleKo: '💼 8대 전문 직업 및 승급 시스템',
    titleEn: '💼 8 Major Occupations & Mastery System',
    descKo:
      '광부, 농부, 엔지니어, 트레이더, 연구원, 예술가, 경비원, 상인 등 8개 특화 직업군을 선택하고 작업을 완수해 보세요. 직업 레벨이 오를수록 작업 완수 보상과 마스터리 보너스가 급상승합니다.',
    descEn:
      'Choose from 8 specialized careers: Miner, Farmer, Engineer, Trader, Researcher, Artist, Guard, and Merchant. Complete tasks to level up your mastery and earn higher payouts.',
    featuresKo: [
      '8가지 특화 직업군 선택 및 자유로운 전직',
      '작업 완수 시 경험치(EXP) 및 레벨 승급 보너스',
      '일일 피로도(에너지) 및 쿨다운 전략적 운영',
    ],
    featuresEn: [
      '8 distinct professions with flexible career paths',
      'EXP and level progression with higher payout multipliers',
      'Strategic daily energy and task cooldown management',
    ],
    link: { href: '/work', label: '8대 직업 작업판 가기', labelEn: 'Go to Work Board' },
  },
  {
    id: 'businesses',
    badgeKo: '기업 & 주식',
    badgeEn: 'Enterprises & Stocks',
    titleKo: '🏢 가상 사업체 창업 & 📈 주식 거래소',
    titleEn: '🏢 Found Virtual Businesses & 📈 Trade Stocks',
    descKo:
      '시드머니를 모아 직접 스타트업이나 상거래 기업을 설립해 매일 들어오는 기업 배당금을 누리거나, 주식 거래소에서 상장 기업 주식을 매매하여 시세 차익과 주주 배당 소득을 거둘 수 있습니다.',
    descEn:
      'Found your own startup or commercial enterprise to receive daily business dividends, or trade virtual equities on the stock exchange for capital gains and investor yields.',
    featuresKo: [
      '나만의 가상 사업체 설립 및 지분 배당 관리',
      '실시간 가격 변동 차트 분석 및 주식 매매',
      '일일 배당금 정산을 통한 지속 가능한 패시브 소득',
    ],
    featuresEn: [
      'Found virtual companies and manage equity shares',
      'Real-time candlestick chart analysis & stock trading',
      'Passive income stream through daily dividend payouts',
    ],
    link: { href: '/businesses', label: '게임 사업 둘러보기', labelEn: 'Explore Businesses' },
  },
  {
    id: 'shop',
    badgeKo: '아이템 상점 2.0',
    badgeEn: 'Item Shop 2.0',
    titleKo: '🛍️ 생산성 도구 & 에너지 회복 상점',
    titleEn: '🛍️ Productivity Tools & Consumables',
    descKo:
      '작업 보상을 획기적으로 높여주는 장비와 도구, 소모된 피로도를 즉시 채워주는 회복 물약, 개성 있는 프로필을 꾸며주는 전용 칭호와 한정판 아이템을 WLD로 구매할 수 있습니다.',
    descEn:
      'Acquire specialized tools that boost job payout efficiency, recovery potions that restore energy instantly, and prestige titles and limited-edition badges using your WLD.',
    featuresKo: [
      '직업별 작업 효율 극대화 도구 및 장비',
      '피로도 즉시 회복 및 에너지 보충 물약',
      '한정판 명예 칭호 및 커뮤니티 전용 버프',
    ],
    featuresEn: [
      'Specialized equipment to maximize job yields',
      'Instant energy recovery and stamina potions',
      'Prestige honorary titles and community buffs',
    ],
    link: { href: '/shop', label: '아이템 상점 가기', labelEn: 'Go to Item Shop' },
  },
  {
    id: 'casino',
    badgeKo: '카지노 & 미니게임',
    badgeEn: 'Casino & Mini-games',
    titleKo: '🎲 가상 미니게임 엔터테인먼트',
    titleEn: '🎲 Virtual Mini-Game Entertainment',
    descKo:
      '서버가 정산하는 동전·주사위 3개 규칙과 이를 활용한 슬롯·하이로우 테마 화면을 제공합니다. 모든 이용에는 일일 베팅 및 손실 한도가 적용됩니다.',
    descEn:
      'Play three server-settled coin and dice rules plus Slots and Hi-Lo themed interfaces. Daily betting and loss limits apply to every play.',
    featuresKo: [
      '3개 서버 게임 규칙과 2개 테마형 화면',
      '서버 트랜잭션으로 결과 생성과 WLD 정산',
      '과몰입 방지 일일 최대 베팅 및 손실 한도 규정',
    ],
    featuresEn: [
      'Three server game rules and two themed interfaces',
      'Server-transaction result generation and WLD settlement',
      'Responsible daily bet caps and loss limits',
    ],
    link: { href: '/casino', label: '카지노 게임장 가기', labelEn: 'Visit Casino' },
  },
];

export const GROWTH_STAGES: readonly GrowthStage[] = [
  {
    step: 1,
    stageKo: '1단계: 시드머니 확보 (입문자 / Lv.1~5)',
    stageEn: 'Stage 1: Seed Capital (Beginner / Lv.1-5)',
    titleKo: '퀘스트와 기초 일거리로 첫 1,000 WLD 마련하기',
    titleEn: 'Earn Your First 1,000 WLD via Quests & Entry Jobs',
    descKo:
      '매일 주어지는 출석과 일일 퀘스트, 잡보드의 입문 일거리를 완료하며 서비스 시스템과 복식부기 원장 기록 방식을 익히고 든든한 초기 시드머니를 마련합니다.',
    descEn:
      'Learn the platform ecosystem and ledger mechanics while gathering seed capital through daily check-in quests and entry-level job assignments.',
    targetKo: '목표 자산: 0 ~ 1,000 WLD',
    targetEn: 'Target Assets: 0 ~ 1,000 WLD',
    actionsKo: [
      '출석 퀘스트 및 쉬운 NPC 일거리 수행',
      '내 지갑에서 투명한 원장 거래 기록 확인',
      '잡보드에서 첫 일거리 완료하고 WLD 수령',
    ],
    actionsEn: [
      'Fulfill daily quests and beginner NPC orders',
      'Inspect transparent ledger entries in My Wallet',
      'Complete entry assignments on the Work Board',
    ],
  },
  {
    step: 2,
    stageKo: '2단계: 직업 전문화 & 금융 저축 (성장기 / Lv.6~15)',
    stageEn: 'Stage 2: Career & Savings (Growth / Lv.6-15)',
    titleKo: '8대 전문 직업 선택과 은행 일일 복리 예금·국채 가입',
    titleEn: 'Choose a Profession & Grow Wealth in Savings & Bonds',
    descKo:
      '광부, 농부, 엔지니어 등 내게 맞는 직업을 선택해 마스터리 레벨을 올리고, 남는 WLD를 은행 복리 예금이나 7일 만기 국채에 넣어 매일 불어나는 안정적인 이자를 거둡니다.',
    descEn:
      'Pick a specialized profession to level up mastery multipliers, and deposit surplus WLD into Bank Daily Compound Savings or 7-day Treasury Bonds for steady interest.',
    targetKo: '목표 자산: 1,000 ~ 10,000 WLD',
    targetEn: 'Target Assets: 1,000 ~ 10,000 WLD',
    actionsKo: [
      '8대 직업 중 진로 선택 후 전문 일거리 수행',
      '은행 복리 예금에 여유 자금 예치 후 누적 이자 정산',
      '조건을 확인하고 7일 만기 가상 국채 매입',
    ],
    actionsEn: [
      'Select a profession and complete specialized jobs',
      'Deposit savings into Bank Daily Compound Savings',
      'Purchase 7-day Treasury Bonds for guaranteed high returns',
    ],
  },
  {
    step: 3,
    stageKo: '3단계: 자본가 & 경영자 (도약기 / Lv.16+)',
    stageEn: 'Stage 3: Capitalist & Mogul (Expansion / Lv.16+)',
    titleKo: '가상 주식 포트폴리오 운용과 나만의 사업체 창업',
    titleEn: 'Build a Stock Portfolio & Found Virtual Businesses',
    descKo:
      '축적된 풍부한 자본을 바탕으로 주식 거래소에서 저평가 우량주를 매매해 시세 차익을 거두고, 나만의 가상 사업체를 직접 창업하여 매일 기업 배당금을 수령하는 머니버스의 대표 자본가가 됩니다.',
    descEn:
      'Leverage your accumulated wealth to trade high-yield virtual stocks and found your own virtual enterprise to collect passive corporate dividends every day.',
    targetKo: '목표 자산: 10,000 WLD 이상',
    targetEn: 'Target Assets: 10,000+ WLD',
    actionsKo: [
      '주식 거래소에서 우량 기업 발굴 및 포트폴리오 투자',
      '나만의 가상 사업체 설립 및 지분 배당 관리',
      '매일 정산되는 기업 배당 소득과 상점/카지노 여가',
    ],
    actionsEn: [
      'Analyze candlestick charts and build a stock portfolio',
      'Found a virtual company and manage corporate equity',
      'Collect daily dividends and enjoy casino & shop leisure',
    ],
  },
];

export const FIRST_DAY_ORDER: readonly string[] = [
  '로그인하고 이용 동의하기',
  '내 지갑 열어 보기',
  '오늘의 퀘스트 하나 확인하기',
  '8대 직업 중 마음에 드는 직업 고르기',
  '첫 직업 작업 완료하고 WLD 보상 받기',
  '퀘스트와 지갑에서 원장 기록 확인하기',
  '남은 WLD는 은행 복리 정기예금에 예치하기',
];

export const FIRST_DAY_ORDER_EN: readonly string[] = [
  'Sign in and agree to Terms of Service',
  'Open and inspect your starting wallet',
  'Check today’s introductory quests',
  'Choose your preferred profession from the 8 careers',
  'Complete your first assignment and claim WLD rewards',
  'Verify the transaction entries in your wallet ledger',
  'Deposit remaining WLD in Bank Daily Compound Savings',
];

export const GUIDE_FAQS: readonly GuideFaq[] = [
  {
    question: '월덕 머니버스는 어떤 서비스인가요?',
    questionEn: 'What is Woldeok Moneyverse?',
    answer:
      'Discord로 이어지는 커뮤니티 가상경제 서비스입니다. 8대 직업 활동, 퀘스트, 가상 금융(복리 예금/국채/대출), 가상 사업체 창업 및 주식 거래소, 아이템 상점, 카지노 미니게임을 웹에서 모두 즐길 수 있습니다.',
    answerEn:
      'A community virtual economy platform connected with Discord. Enjoy 8 career occupations, quests, virtual banking (compound savings, bonds, loans), enterprise founding, stock exchange, item shop, and casino games.',
  },
  {
    question: '가상 금융(예금, 국채, 대출)은 어떻게 이용하나요?',
    questionEn: 'How do I use Virtual Banking (Savings, Bonds, Loans)?',
    answer:
      '경제 → 가상 금융(/bank) 메뉴에서 이용할 수 있습니다. 복리 예금의 이자는 일 단위로 누적되며 은행 화면에서 직접 정산해야 원장에 반영됩니다. 7일 또는 30일 만기 가상 국채와 신용도 기반 가상 대출은 화면에 표시된 조건을 확인한 뒤 이용하세요.',
    answerEn:
      'Visit Economy → Virtual Banking (/bank). Savings interest accrues daily and is posted when you claim it. Review the displayed terms before using virtual 7-day or 30-day bonds or credit-based loans.',
    link: { href: '/bank', label: '가상 금융 둘러보기', labelEn: 'Explore Virtual Banking' },
  },
  {
    question: '8대 직업은 어떻게 선택하고 변경하나요?',
    questionEn: 'How do I choose and change my profession?',
    answer:
      '잡보드(/work) 상단에서 광부, 농부, 엔지니어, 트레이더, 연구원, 예술가, 경비원, 상인 중 원하는 직업을 선택할 수 있습니다. 각 직업마다 고유한 작업과 숙련도 경험치가 존재하며, 자유롭게 전직할 수 있습니다.',
    answerEn:
      'On the Work Board (/work), choose from Miner, Farmer, Engineer, Trader, Researcher, Artist, Guard, or Merchant. Each career has unique tasks and EXP progression, and you can switch professions as desired.',
    link: { href: '/work', label: '8대 직업 작업판 가기', labelEn: 'Go to Work Board' },
  },
  {
    question: '가상 사업체 창업과 주식 투자는 어떻게 시작하나요?',
    questionEn: 'How do I found a business and invest in stocks?',
    answer:
      '경제 → 게임 사업(/businesses)에서 시드머니를 투자해 나만의 회사를 창업하고 지분을 경영할 수 있습니다. 가상 주식(/stocks)에서는 실시간 주가 차트를 확인하고 유망한 상장 기업의 주식을 매수해 매일 배당금과 시세 차익을 거둘 수 있습니다.',
    answerEn:
      'Under Economy → Businesses (/businesses), invest seed capital to launch your own enterprise. Under Virtual Stocks (/stocks), analyze charts to trade shares of public companies and collect daily dividend yields.',
    link: { href: '/stocks', label: '주식 거래소 보러 가기', labelEn: 'View Stock Exchange' },
  },
  {
    question: 'WLD는 현금으로 바꾸거나 거래할 수 있나요?',
    questionEn: 'Can WLD be exchanged or traded for cash?',
    answer:
      '아니요. WLD와 모든 보상은 서비스 안에서만 작동하는 순수 가상 데이터입니다. 현금 거래·환전·실물 경품 교환 기능은 일절 제공하지 않으며 엄격히 금지됩니다.',
    answerEn:
      'No. WLD and all in-game rewards are purely virtual items within the platform. Real cash trading, conversions, and tangible prize exchanges are strictly forbidden.',
    link: { href: '/terms', label: '이용 기준 확인하기', labelEn: 'Review Terms of Service' },
  },
  {
    question: '카지노 미니게임의 공정성과 한도는 어떻게 되나요?',
    questionEn: 'How are casino game fairness and limits ensured?',
    answer:
      '카지노(/casino)는 동전·주사위 기반 3개 서버 게임 규칙과 슬롯·하이로우 테마 화면을 제공합니다. 결과 생성과 WLD 정산은 서버 트랜잭션에서 처리되며, 일일 베팅 금액 및 손실 한도가 적용됩니다.',
    answerEn:
      'The casino provides three server-settled coin and dice rules plus Slots and Hi-Lo themed interfaces. Results and WLD settlement run in server transactions, with daily betting and loss limits.',
    link: { href: '/casino', label: '카지노 둘러보기', labelEn: 'Visit Casino' },
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
    question: '어디서부터 해야 할지 다시 잊어버렸어요.',
    questionEn: 'What if I forget where to start?',
    answer:
      '내 지갑에서 현재 WLD 잔액을 확인한 뒤, 퀘스트(/quests)에서 오늘의 출석과 쉬운 활동을 완료하고, 작업판(/work)에서 직업 작업을 한 건 완료해 보세요. 남은 WLD는 가상 금융(/bank)의 예금에 넣어두면 됩니다.',
    answerEn:
      'Check your balance in My Wallet, fulfill daily quests (/quests), complete a work task (/work), and deposit any extra WLD into Virtual Banking (/bank) compound savings.',
    link: { href: '/quests', label: '퀘스트로 돌아가기', labelEn: 'Back to Quests' },
  },
];

export function guideDestinations(): readonly string[] {
  const paths = [
    ...GUIDE_STEPS.flatMap((step) => (step.link ? [step.link.href] : [])),
    ...ECONOMY_PILLARS.flatMap((pillar) => (pillar.link ? [pillar.link.href] : [])),
  ];
  return [...new Set(paths)];
}
