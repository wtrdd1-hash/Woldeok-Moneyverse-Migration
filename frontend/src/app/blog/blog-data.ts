import type { BlogPost, BlogCategory } from './blog.types';

export const BLOG_AUTHOR_DEOKI = {
  name: '덕이 (Deoki)',
  role: '월덕 금융연구소 수석 AI 애널리스트',
  badge: 'AI Analyst',
} as const;

export const BLOG_CATEGORIES: ReadonlyArray<{ id: BlogCategory; label: string }> = [
  { id: 'COMPOUND', label: '복리 & 저축' },
  { id: 'TAX', label: '절세 & 세제혜택' },
  { id: 'STOCKS', label: '가상 주식 투자' },
  { id: 'WEALTH', label: '자산 배분 & 포트폴리오' },
  { id: 'MACRO', label: '거시 경제 & 국고' },
];

const INITIAL_POSTS: BlogPost[] = [
  {
    slug: '2026-10-14-compound-interest-wealth-secret',
    title: '월 50만 WLD로 10억 만들기: 72의 법칙과 복리 눈덩이 실전 투자법',
    excerpt: '시간이 돈을 벌어다 주는 복리의 마법! 단리와 복리의 근본적인 차이점부터 72의 법칙을 활용한 원금 2배 달성 시점 계산법, 그리고 월덕 머니버스 복리 예금 실전 굴리기 전략을 총정리합니다.',
    content: `## 1. 아인슈타인이 극찬한 세계 8대 불가사의, '복리(Compound Interest)'

재테크의 세계에서 가장 강력하지만 가장 과소평가되는 원리가 바로 **복리**입니다.
단리(Simple Interest)가 매년 원금에 대해서만 일정한 이자를 주는 반면, 복리는 **'원금 + 직전 기간에 발생한 이자'** 전체를 새로운 원금으로 삼아 다음 이자를 계산합니다.

즉, 이자가 또 다른 이자를 낳는 이른바 **눈덩이 효과(Snowball Effect)**가 발생합니다.

\`\`\`
단리 총액 = 원금 × (1 + 이자율 × 기간)
복리 총액 = 원금 × (1 + 이자율)^기간
\`\`\`

초기 1~3년 차에는 단리와 복리의 차이가 미미해 보일 수 있습니다. 하지만 5년, 10년, 20년의 시간이 흐르는 순간 곡선은 지수함수적으로 폭발합니다.

---

## 2. 내 돈이 두 배가 되는 마법의 공식: 72의 법칙

복리 투자 시 가장 직관적으로 자산 증식을 가늠할 수 있는 도구가 바로 **'72의 법칙(Rule of 72)'**입니다.

> **원금이 2배가 되는 데 걸리는 시간(년) = 72 ÷ 연이율(%)**

- **연 4% 정기예금**: 72 ÷ 4 = **18년**
- **연 8% 배당성장 포트폴리오**: 72 ÷ 8 = **9년**
- **연 12% 가상 주식 우량주 복리 펀드**: 72 ÷ 12 = **6년**

연 수익률이 단 4%포인트만 올라가도 원금이 2배가 되는 기간이 무려 9년이나 단축됩니다. 이것이 우리가 자산 배분과 복리 재투자에 목숨을 걸어야 하는 이유입니다.

---

## 3. 월덕 머니버스 실전 복리 시뮬레이션

가상경제 머니버스에서 매월 50만 WLD를 연 10% 복리 예금 팟에 10년간 꾸준히 납입한다고 가정해 보겠습니다:

| 기간 | 누적 원금 | 세후 예상 총자산 | 복리 이자 수익 |
| :--- | :--- | :--- | :--- |
| **1년** | 600만 WLD | 633만 WLD | +33만 WLD |
| **3년** | 1,800만 WLD | 2,096만 WLD | +296만 WLD |
| **5년** | 3,000만 WLD | 3,892만 WLD | +892만 WLD |
| **10년** | 6,000만 WLD | **1억 3,294만 WLD** | **+7,294만 WLD (원금 초과!)** |

10년이 지나면 원금(6,000만 WLD)보다 순수하게 복리로 불어난 이자(7,294만 WLD)가 더 커지는 극적인 골든크로스가 완성됩니다.

---

## 4. 덕이의 실전 투자 가이드라인

1. **절대 중간에 원금을 빼지 마세요**: 복리의 가파른 상승 구간은 후반부에 몰려 있습니다.
2. **배당금은 전액 재투자하세요**: 가상 주식 배당금이나 국채 쿠폰 이자를 소비하지 않고 즉시 재매수할 때 복리 가속도가 붙습니다.
3. **복리 계산기로 목표 수치를 먼저 시뮬레이션하세요**: 목표 자산 도달 기간을 사전에 계산하면 시장 변동성에도 흔들리지 않습니다.`,
    category: 'COMPOUND',
    categoryLabel: '복리 & 저축',
    author: BLOG_AUTHOR_DEOKI,
    publishedAt: '2026-10-14T09:00:00.000Z',
    updatedAt: '2026-10-14T09:00:00.000Z',
    readTimeMinutes: 5,
    tags: ['복리계산기', '72의법칙', '재테크노하우', '적금추천', '스노우볼'],
    relatedCalculatorHref: '/tools/compound-calculator',
    relatedCalculatorName: '복리 수익 계산기',
    relatedStockTicker: 'CHIPS',
    isAiGenerated: true,
    views: 1420,
  },
  {
    slug: '2026-10-13-isa-dividend-tax-saving-strategy',
    title: '배당소득세 15.4% 전액 비과세 꿀팁: ISA 계좌와 고배당주 절세 전략',
    excerpt: '배당금 받을 때마다 떼이는 세금이 아까우셨나요? 개인종합자산관리계좌(ISA)를 활용한 비과세 한도와 분리과세 혜택, 배당소득세 실효세율을 0%로 만드는 실전 절세 로드맵을 공개합니다.',
    content: `## 1. 세금은 수익률을 갉아먹는 보이지 않는 도둑

투자에서 1%의 추가 수익을 올리는 것은 어렵지만, **1%의 세금을 아끼는 것은 제도만 알면 100% 확정적**입니다.
일반 주식 계좌에서 배당을 수령하면 배당소득세 14% + 지방소득세 1.4%로 총 **15.4%**가 원천징수됩니다.

만약 연간 배당으로 1,000만 WLD를 받는다면 무려 154만 WLD가 고스란히 세금으로 빠져나가는 셈입니다.

---

## 2. 만능 절세 통장 ISA(개인종합자산관리계좌)의 3대 핵심 혜택

1. **순소득 비과세 혜택**: 일반형 기준 200만 WLD, 서민형 기준 최대 400만 WLD까지 세금을 1원도 내지 않습니다.
2. **초과분 9.9% 분리과세**: 비과세 한도를 초과한 순수익에 대해서도 15.4%가 아닌 9.9% 저율 분리과세가 적용됩니다.
3. **손익통산 (손실 상계)**: A 주식에서 300만 WLD 손실을 보고 B 배당주에서 500만 WLD 이익을 봤다면, 차액인 200만 WLD에 대해서만 과세합니다.

---

## 3. 고배당주 + ISA 결합 실전 포트폴리오

가상경제 머니버스 상장사 중 연 7~10% 안정적 분기 배당을 지급하는 **월덱 파이낸셜(WFIN)**이나 **강남 프라임 타워 랜드마크 부동산 지분**을 ISA 바구니에 담을 경우, 일반 계좌 대비 연 1.5% 이상의 추가 순수익을 거둘 수 있습니다.

지금 바로 머니버스 배당소득세 계산기를 통해 나의 예상 절세액을 확인해 보세요!`,
    category: 'TAX',
    categoryLabel: '절세 & 세제혜택',
    author: BLOG_AUTHOR_DEOKI,
    publishedAt: '2026-10-13T09:00:00.000Z',
    updatedAt: '2026-10-13T09:00:00.000Z',
    readTimeMinutes: 4,
    tags: ['ISA계좌', '배당소득세', '절세계산기', '비과세혜택', '고배당주'],
    relatedCalculatorHref: '/tools/dividend-tax-calculator',
    relatedCalculatorName: '배당소득세 계산기',
    relatedStockTicker: 'WFIN',
    isAiGenerated: true,
    views: 980,
  },
  {
    slug: '2026-10-12-virtual-stock-value-investing-guide',
    title: '급등주 뇌동매매 그만! 워런 버핏식 가상 주식 우량주 발굴 3대 지표',
    excerpt: '가상 주식 시장에서 고래들에게 휘둘리지 않고 연 20% 안정적 복리 수익을 올리는 법. PER, PBR, ROE 기본적 분석 지표를 월덕 상장사에 대입하여 저평가 진주를 찾아내는 정석 투자 가이드.',
    content: `## 1. 차트만 보고 매매하면 반드시 패배합니다

가상 주식 시장의 10단 호가창을 보고 있으면 급등하는 테마주에 나도 모르게 매수 버튼을 누르게 됩니다.
하지만 단기 가격 변동은 시장 심리와 노이즈의 영역입니다. 장기적으로 주가는 반드시 **기업의 펀더멘털(내재가치)**로 수렴합니다.

---

## 2. 우량주 선별을 위한 3대 핵심 밸류에이션 지표

### ① PER (주가수익비율, Price-to-Earnings Ratio)
- 현재 주가가 주당순이익(EPS)의 몇 배인가를 나타냅니다.
- 동일 업종 평균 대비 PER이 낮을수록 저평가되어 있을 확률이 높습니다.

### ② PBR (주가순자산비율, Price-to-Book Ratio)
- 기업이 당장 모든 사업을 청산했을 때 1주당 돌아오는 순자산 가치입니다.
- PBR 1.0 미만은 장부상 자산 가치보다도 주가가 싸게 거래되고 있음을 뜻합니다.

### ③ ROE (자기자본이익률, Return on Equity)
- 주주의 돈(자기자본)으로 1년간 얼마나 많은 순이익을 벌어들였는가를 측정합니다.
- 버핏은 **'연속 3년 이상 ROE 15% 이상'**인 독점적 해자(Moat) 기업을 선호합니다.

---

## 3. 월덕 머니버스 실전 적용 종목 추천

- **치무 초전도(CHIPS)**: 반도체 및 신소재 글로벌 독점 공급망 확보로 ROE 22.4% 유지.
- **월덱 바이오(WDB)**: 신약 파이프라인 임상 순항으로 예상 EPS 가파른 성장세.
- **가상 국채(KTB 5년물)**: 시장 급락기 안전판 역할을 하며 연 5.8% 확정 쿠폰 이자 지급.

포트폴리오 비중이 고민되신다면 AI 어드바이저 '덕이'의 진단실에서 내 계좌의 샤프 지수를 점검해 보세요.`,
    category: 'STOCKS',
    categoryLabel: '가상 주식 투자',
    author: BLOG_AUTHOR_DEOKI,
    publishedAt: '2026-10-12T09:00:00.000Z',
    updatedAt: '2026-10-12T09:00:00.000Z',
    readTimeMinutes: 6,
    tags: ['가상주식', '가치투자', 'PER', 'PBR', 'ROE', '주식계산기'],
    relatedCalculatorHref: '/tools/stock-calculator',
    relatedCalculatorName: '주식 평단가·수익률 계산기',
    relatedStockTicker: 'CHIPS',
    isAiGenerated: true,
    views: 1840,
  },
];

// 메모리 저장소 (서버 런타임 간 유지)
let blogPostsStore: BlogPost[] = [...INITIAL_POSTS];

export function getAllBlogPosts(): readonly BlogPost[] {
  return [...blogPostsStore].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPostsStore.find((p) => p.slug === slug);
}

export function addBlogPost(post: BlogPost): void {
  blogPostsStore = [post, ...blogPostsStore.filter((p) => p.slug !== post.slug)];
}

// 5대 고수익 롱테일 키워드 템플릿 풀
const TOPIC_TEMPLATES = [
  {
    category: 'WEALTH' as BlogCategory,
    categoryLabel: '자산 배분 & 포트폴리오',
    titleSuffix: '올웨더(All-Weather) 자산배분: 주식 55%, 국채 20%, 현금 25% 황금비율 분석',
    excerpt: '어떤 경제 위기에도 내 자산을 굳건하게 지켜주는 레이 달리오식 올웨더 포트폴리오의 실전 구성법과 샤프 지수 극대화 전략.',
    tags: ['자산배분', '올웨더포트폴리오', '샤프지수', '위험관리', '분산투자'],
    calculatorHref: '/advisor',
    calculatorName: 'AI 포트폴리오 진단실',
    stockTicker: 'KTB',
  },
  {
    category: 'TAX' as BlogCategory,
    categoryLabel: '절세 & 세제혜택',
    titleSuffix: '연금저축 vs IRP 계좌 완벽 비교: 연말정산 세액공제 99만 원 최대로 돌려받기',
    excerpt: '사회초년생부터 은퇴 준비자까지 필수! 연금저축펀드와 IRP의 세액공제 한도, 중도인출 조건, 그리고 수령 시 연금소득세 절세 꿀팁.',
    tags: ['연금저축', 'IRP', '연말정산', '세액공제', '은퇴설계'],
    calculatorHref: '/tools/pension-tax-calculator',
    calculatorName: '연금저축 절세 계산기',
    stockTicker: 'WFIN',
  },
  {
    category: 'COMPOUND' as BlogCategory,
    categoryLabel: '복리 & 저축',
    titleSuffix: '청년도약계좌 만기 5,000만 원 목돈 만들기: 정부 기여금과 비과세 혜택 총정리',
    excerpt: '청년층 자산 형성을 위한 핵심 국고 지원 프로그램! 5년간 매월 70만 원 납입 시 정부 기여금 매칭과 이자소득 비과세로 목돈을 만드는 공식.',
    tags: ['청년도약계좌', '목돈만들기', '정부기여금', '비과세적금', '재테크'],
    calculatorHref: '/tools/youth-leap-calculator',
    calculatorName: '청년도약계좌 계산기',
    stockTicker: 'CHIMU314',
  },
  {
    category: 'MACRO' as BlogCategory,
    categoryLabel: '거시 경제 & 국고',
    titleSuffix: '중앙은행 기준금리와 인플레이션: 내 대출이자와 주식 시장에 미치는 영향',
    excerpt: '금리가 오르면 왜 주가가 하락할까? 테일러 준칙(Taylor Rule)에 따른 금리 결정 메커니즘과 국고 채권 수익률 곡선 해석법.',
    tags: ['기준금리', '인플레이션', '거시경제', '채권금리', '대출이자'],
    calculatorHref: '/tools/loan-interest-calculator',
    calculatorName: '대출이자 상환 계산기',
    stockTicker: 'WDT',
  },
  {
    category: 'STOCKS' as BlogCategory,
    categoryLabel: '가상 주식 투자',
    titleSuffix: '주식 물타기 평단가 탈출 전략: 마틴게일 vs 분할 매수의 수학적 승률 비교',
    excerpt: '하락장에서 무작정 물타기를 하면 왜 계좌가 녹아내릴까? 리스크를 최소화하면서 목표 평단가에 도달하는 스마트 분할 매수 기법.',
    tags: ['물타기계산기', '평단가', '분할매수', '주식투자법', '손절전략'],
    calculatorHref: '/tools/stock-calculator',
    calculatorName: '주식 물타기 계산기',
    stockTicker: 'MYUY',
  },
];

/**
 * 일일 AI 자동 블로그 포스트 생성 엔진
 */
export function generateDailyAiBlogPost(): BlogPost {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.getTime().toString(36);

  // 날짜 기반 순환 템플릿 선택
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  const template = TOPIC_TEMPLATES[dayOfYear % TOPIC_TEMPLATES.length]!;

  const slug = `${dateStr}-${template.category.toLowerCase()}-${timeStr}`;
  const title = `[AI 금융칼럼] ${template.titleSuffix}`;

  const generatedContent = `## 1. 2026년 변화하는 금융 환경과 자산 관리 패러다임

최근 글로벌 거시 경제와 가상 금융 생태계의 유동성 변화 속에서, 단순한 근로소득만으로는 인플레이션을 방어하기 어려운 시대가 되었습니다.
오늘 **월덕 금융연구소 AI 애널리스트 덕이**가 분석할 핵심 주제는 바로 **"${template.titleSuffix}"**입니다.

성공적인 재테크와 자산 증식의 본질은 감에 의존한 투자가 아니라, **수학적 확률과 제도의 세제 혜택을 100% 내 편으로 만드는 구조화된 시스템**에 있습니다.

---

## 2. 핵심 원리 및 데이터 기반 시뮬레이션

### ① 리스크와 기대 수익률의 상관관계
모든 금융 자산은 변동성과 기대 수익률 간의 트레이드오프(Trade-off)를 갖습니다.
단일 자산에 올인할 경우 겪게 되는 최대 낙폭(MDD)의 고통을 줄이기 위해서는 자산 간 상관계수가 낮은 대체 자산(가상 부동산, 국가 공인 국채, 고배당주 등)을 적절한 비율로 믹스해야 합니다.

### ② 제도적 세금 감면 혜택 챙기기
많은 투자자들이 연 10%의 수익률을 좇으면서도 정작 15.4%의 이자·배당소득세나 건강보험료 피부양자 탈락 기준 등 보이지 않는 비용을 간과합니다.
국가에서 정책적으로 제공하는 비과세 및 소득공제 혜택을 사전에 계산하고 진입하는 것이 연간 수익률을 최소 2% 이상 끌어올리는 가장 확실한 무기입니다.

---

## 3. 머니버스 실전 적용 로드맵

1. **내 현재 자산의 건전성 점수 진단**: AI 어드바이저 덕이를 통해 샤프 지수와 MDD를 먼저 측정하세요.
2. **목표 수치를 계산기로 사전 시뮬레이션**: ${template.calculatorName}를 통해 만기 수령액과 절세 효과를 눈으로 직접 확인하세요.
3. **규칙 기반 분할 투자**: 시장의 소음에 흔들리지 말고 매월 정해진 날짜에 자동 이체 및 리밸런싱을 집행하세요.

---

## 4. 덕이의 한 줄 결론

> *"가장 훌륭한 투자 타이밍은 어제였고, 두 번째로 좋은 타이밍은 바로 오늘입니다."*

자세한 계산 및 종목 분석은 하단의 바로가기 배너를 통해 직접 체험해 보실 수 있습니다.`;

  const newPost: BlogPost = {
    slug,
    title,
    excerpt: template.excerpt,
    content: generatedContent,
    category: template.category,
    categoryLabel: template.categoryLabel,
    author: BLOG_AUTHOR_DEOKI,
    publishedAt: now.toISOString(),
    updatedAt: now.toISOString(),
    readTimeMinutes: 5,
    tags: template.tags,
    relatedCalculatorHref: template.calculatorHref,
    relatedCalculatorName: template.calculatorName,
    relatedStockTicker: template.stockTicker,
    isAiGenerated: true,
    views: Math.floor(Math.random() * 50) + 10,
  };

  addBlogPost(newPost);
  return newPost;
}
