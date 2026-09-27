import { SeoPresetData } from './seo-presets.config';

export interface PseoStockInfo {
  readonly ticker: string;
  readonly nameKo: string;
  readonly nameEn: string;
  readonly basePrice: number;
  readonly market: 'KOSPI' | 'KOSDAQ' | 'NASDAQ' | 'NYSE' | 'CRYPTO' | 'MONEYVERSE';
  readonly category: string;
}

export const POPULAR_STOCKS_DATASET: readonly PseoStockInfo[] = [
  // 국내 코스피 / 코스닥 대형주
  { ticker: 'samsung', nameKo: '삼성전자', nameEn: 'Samsung Electronics', basePrice: 75000, market: 'KOSPI', category: '반도체/IT' },
  { ticker: 'sk-hynix', nameKo: 'SK하이닉스', nameEn: 'SK Hynix', basePrice: 180000, market: 'KOSPI', category: '반도체' },
  { ticker: 'hyundai-motor', nameKo: '현대자동차', nameEn: 'Hyundai Motor', basePrice: 240000, market: 'KOSPI', category: '자동차' },
  { ticker: 'naver', nameKo: 'NAVER', nameEn: 'Naver Corp', basePrice: 170000, market: 'KOSPI', category: '인터넷/플랫폼' },
  { ticker: 'kakao', nameKo: '카카오', nameEn: 'Kakao Corp', basePrice: 42000, market: 'KOSPI', category: '인터넷/플랫폼' },
  { ticker: 'celltrion', nameKo: '셀트리온', nameEn: 'Celltrion', basePrice: 195000, market: 'KOSPI', category: '바이오' },
  { ticker: 'posco-holdings', nameKo: 'POSCO홀딩스', nameEn: 'POSCO Holdings', basePrice: 380000, market: 'KOSPI', category: '철강/이차전지' },
  { ticker: 'lg-energy', nameKo: 'LG에너지솔루션', nameEn: 'LG Energy Solution', basePrice: 360000, market: 'KOSPI', category: '이차전지' },
  { ticker: 'ecopro-bm', nameKo: '에코프로비엠', nameEn: 'EcoPro BM', basePrice: 160000, market: 'KOSDAQ', category: '이차전지' },
  { ticker: 'kia', nameKo: '기아', nameEn: 'Kia Corp', basePrice: 110000, market: 'KOSPI', category: '자동차' },
  { ticker: 'samsung-sdi', nameKo: '삼성SDI', nameEn: 'Samsung SDI', basePrice: 340000, market: 'KOSPI', category: '이차전지' },
  { ticker: 'hanwha-aero', nameKo: '한화에어로스페이스', nameEn: 'Hanwha Aerospace', basePrice: 320000, market: 'KOSPI', category: '방산/항공우주' },
  { ticker: 'doosan-enerbility', nameKo: '두산에너빌리티', nameEn: 'Doosan Enerbility', basePrice: 21000, market: 'KOSPI', category: '원전/에너지' },
  { ticker: 'krafton', nameKo: '크래프톤', nameEn: 'Krafton', basePrice: 330000, market: 'KOSPI', category: '게임' },
  { ticker: 'kb-financial', nameKo: 'KB금융', nameEn: 'KB Financial Group', basePrice: 85000, market: 'KOSPI', category: '금융/은행' },
  { ticker: 'shinhan-holdings', nameKo: '신한지주', nameEn: 'Shinhan Financial', basePrice: 56000, market: 'KOSPI', category: '금융/은행' },
  { ticker: 'alteo-gen', nameKo: '알테오젠', nameEn: 'Alteogen', basePrice: 320000, market: 'KOSDAQ', category: '바이오' },
  { ticker: 'hlb', nameKo: 'HLB', nameEn: 'HLB Life Science', basePrice: 85000, market: 'KOSDAQ', category: '바이오' },
  { ticker: 'hyundai-rotem', nameKo: '현대로템', nameEn: 'Hyundai Rotem', basePrice: 65000, market: 'KOSPI', category: '방산/철도' },
  { ticker: 'sam-bio', nameKo: '삼성바이오로직스', nameEn: 'Samsung Biologics', basePrice: 980000, market: 'KOSPI', category: '바이오' },

  // 미국 나스닥 / S&P500 빅테크 & 고변동 ETF
  { ticker: 'nvda', nameKo: '엔비디아', nameEn: 'NVIDIA', basePrice: 125, market: 'NASDAQ', category: 'AI 반도체' },
  { ticker: 'tsla', nameKo: '테슬라', nameEn: 'Tesla', basePrice: 240, market: 'NASDAQ', category: '전기차/자율주행' },
  { ticker: 'aapl', nameKo: '애플', nameEn: 'Apple', basePrice: 230, market: 'NASDAQ', category: '빅테크' },
  { ticker: 'msft', nameKo: '마이크로소프트', nameEn: 'Microsoft', basePrice: 430, market: 'NASDAQ', category: '클라우드/AI' },
  { ticker: 'googl', nameKo: '알파벳 (구글)', nameEn: 'Alphabet (Google)', basePrice: 165, market: 'NASDAQ', category: '검색/AI' },
  { ticker: 'amzn', nameKo: '아마존', nameEn: 'Amazon', basePrice: 190, market: 'NASDAQ', category: '이커머스/클라우드' },
  { ticker: 'meta', nameKo: '메타 (페이스북)', nameEn: 'Meta Platforms', basePrice: 580, market: 'NASDAQ', category: 'SNS/VR' },
  { ticker: 'pltr', nameKo: '팔란티어', nameEn: 'Palantir', basePrice: 42, market: 'NYSE', category: '빅데이터/AI' },
  { ticker: 'soxl', nameKo: 'SOXL (반도체 3배 레버리지)', nameEn: 'Direxion Semiconductor Bull 3X', basePrice: 38, market: 'NYSE', category: '레버리지 ETF' },
  { ticker: 'tqqq', nameKo: 'TQQQ (나스닥 3배 레버리지)', nameEn: 'ProShares UltraPro QQQ', basePrice: 72, market: 'NASDAQ', category: '레버리지 ETF' },
  { ticker: 'qqq', nameKo: 'QQQ (나스닥 100 ETF)', nameEn: 'Invesco QQQ Trust', basePrice: 490, market: 'NASDAQ', category: '지수 ETF' },
  { ticker: 'schd', nameKo: 'SCHD (슈드 미국 배당 ETF)', nameEn: 'Schwab US Dividend Equity', basePrice: 84, market: 'NYSE', category: '배당 ETF' },
  { ticker: 'coin', nameKo: '코인베이스', nameEn: 'Coinbase Global', basePrice: 195, market: 'NASDAQ', category: '가상자산 거래소' },
  { ticker: 'amd', nameKo: 'AMD', nameEn: 'Advanced Micro Devices', basePrice: 155, market: 'NASDAQ', category: '반도체' },
  { ticker: 'ionq', nameKo: '아이온큐', nameEn: 'IonQ', basePrice: 14, market: 'NYSE', category: '양자컴퓨팅' },

  // 가상자산
  { ticker: 'btc', nameKo: '비트코인', nameEn: 'Bitcoin', basePrice: 90000000, market: 'CRYPTO', category: '디지털 금' },
  { ticker: 'eth', nameKo: '이더리움', nameEn: 'Ethereum', basePrice: 3600000, market: 'CRYPTO', category: '스마트 컨트랙트' },
  { ticker: 'sol', nameKo: '솔라나', nameEn: 'Solana', basePrice: 210000, market: 'CRYPTO', category: '고속 레이어1' },
  { ticker: 'xrp', nameKo: '리플', nameEn: 'XRP', basePrice: 800, market: 'CRYPTO', category: '국제 송금' },
  { ticker: 'doge', nameKo: '도지코인', nameEn: 'Dogecoin', basePrice: 160, market: 'CRYPTO', category: '밈 코인' },

  // 머니버스 가상 주식 10종
  { ticker: 'chips', nameKo: '침팬지 반도체', nameEn: 'Chimpanzee Semiconductor', basePrice: 50000, market: 'MONEYVERSE', category: '가상 IT' },
  { ticker: 'ducks', nameKo: '월덕 인더스트리', nameEn: 'Woldeok Industries', basePrice: 120000, market: 'MONEYVERSE', category: '가상 중공업' },
  { ticker: 'meme-coin', nameKo: '도지 밈 파이낸스', nameEn: 'Doge Meme Finance', basePrice: 15000, market: 'MONEYVERSE', category: '가상 금융' },
  { ticker: 'bio', nameKo: '불사조 바이오', nameEn: 'Phoenix Bio', basePrice: 85000, market: 'MONEYVERSE', category: '가상 바이오' },
  { ticker: 'energy', nameKo: '핵융합 에너지', nameEn: 'Fusion Energy', basePrice: 42000, market: 'MONEYVERSE', category: '가상 신재생' },
  { ticker: 'auto', nameKo: '사이버 모빌리티', nameEn: 'Cyber Mobility', basePrice: 95000, market: 'MONEYVERSE', category: '가상 완성차' },
  { ticker: 'game', nameKo: '메타버스 게임즈', nameEn: 'Metaverse Games', basePrice: 64000, market: 'MONEYVERSE', category: '가상 엔터' },
  { ticker: 'air', nameKo: '성층권 항공', nameEn: 'Stratosphere Air', basePrice: 31000, market: 'MONEYVERSE', category: '가상 항공' },
  { ticker: 'food', nameKo: '인공육 푸드텍', nameEn: 'Synthetic FoodTech', basePrice: 28000, market: 'MONEYVERSE', category: '가상 식품' },
  { ticker: 'space', nameKo: '은하계 탐사', nameEn: 'Galactic Space', basePrice: 150000, market: 'MONEYVERSE', category: '가상 우주항공' },
];

export interface PseoScenario {
  readonly slugSuffix: string;
  readonly dropRate: number; // -0.2 = -20%
  readonly additionalMultiplier: number; // 1 = 1배수(동수량), 2 = 2배수
  readonly label: string;
  readonly desc: string;
}

export const PSEO_SCENARIOS: readonly PseoScenario[] = [
  { slugSuffix: 'minus-10', dropRate: -0.1, additionalMultiplier: 1, label: '-10% 손실 1배수 물타기', desc: '10% 하락 시 1배 추가 매수로 평단가 즉시 회복' },
  { slugSuffix: 'minus-20', dropRate: -0.2, additionalMultiplier: 1, label: '-20% 손실 1배수 물타기', desc: '20% 하락 시 동일 수량 추가 매수 희석 공식' },
  { slugSuffix: 'minus-30', dropRate: -0.3, additionalMultiplier: 2, label: '-30% 폭락 2배수 물타기', desc: '30% 급락 시 2배 추가 매수로 탈출 단가 극대화' },
  { slugSuffix: 'minus-50', dropRate: -0.5, additionalMultiplier: 2, label: '-50% 반토막 탈출 역산', desc: '주가 반토막 시 탈출에 필요한 최소 상승률과 매수가 산출' },
  { slugSuffix: 'double-down', dropRate: -0.25, additionalMultiplier: 3, label: '3배수 불꽃 물타기', desc: '25% 하락 시 3배수 강력 매수로 초단기 본전 탈출' },
];

/**
 * 2,000+개 조합을 처리하는 온디맨드 pSEO 파서 & 계산기
 */
export function getPseoStockPreset(slug: string): SeoPresetData | null {
  // 1. 시나리오 매칭
  const scenario = PSEO_SCENARIOS.find((s) => slug.endsWith(`-${s.slugSuffix}`));
  if (!scenario) return null;

  // 2. 티커 추출
  const tickerKey = slug.slice(0, -(scenario.slugSuffix.length + 1));
  const stock = POPULAR_STOCKS_DATASET.find((s) => s.ticker === tickerKey || s.ticker.toLowerCase() === tickerKey.toLowerCase());
  
  if (!stock) {
    // 동적 티커 fallback: 티커명이 데이터셋에 없더라도 기본 공식으로 온디맨드 생성
    const rawTicker = tickerKey.toUpperCase();
    return generateDynamicStockPreset(rawTicker, rawTicker, 50000, scenario, slug);
  }

  return generateDynamicStockPreset(stock.ticker, stock.nameKo, stock.basePrice, scenario, slug, stock.market, stock.category);
}

function generateDynamicStockPreset(
  ticker: string,
  nameKo: string,
  initialPrice: number,
  scenario: PseoScenario,
  slug: string,
  market: string = '주식',
  category: string = '금융'
): SeoPresetData {
  const initialQty = 100;
  const initialTotal = initialPrice * initialQty;
  const currentPrice = Math.round(initialPrice * (1 + scenario.dropRate));
  const addQty = Math.round(initialQty * scenario.additionalMultiplier);
  const addTotal = currentPrice * addQty;
  const totalQty = initialQty + addQty;
  const finalAvgPrice = Math.round((initialTotal + addTotal) / totalQty);
  const dilutionRate = ((1 - finalAvgPrice / initialPrice) * 100).toFixed(1);
  const neededRebound = (((finalAvgPrice - currentPrice) / currentPrice) * 100).toFixed(1);
  const dropPercent = Math.abs(Math.round(scenario.dropRate * 100));

  const isUSD = market === 'NASDAQ' || market === 'NYSE';
  const unit = isUSD ? '$' : '원';
  const fmt = (num: number) => num.toLocaleString('ko-KR');

  const title = `${nameKo}(${ticker.toUpperCase()}) -${dropPercent}% 물타기 평단가 계산기 [${scenario.additionalMultiplier}배수]`;
  const metaTitle = `${nameKo} -${dropPercent}% 물타기 평단가 계산기 | ${scenario.additionalMultiplier}배 추가 매수 시 탈출가 시뮬레이션`;
  const metaDescription = `${nameKo} 매수가 ${fmt(initialPrice)}${unit}에서 -${dropPercent}% 하락 시 ${addQty}주 추가 물타기했을 때의 희석 평단가(${fmt(finalAvgPrice)}${unit})와 본전 탈출 필요 반등률(+${neededRebound}%)을 실시간 계산하세요.`;

  return {
    slug,
    category: 'stock',
    title,
    metaTitle,
    metaDescription,
    heading: `${nameKo} -${dropPercent}% 폭락 시 ${scenario.additionalMultiplier}배수 물타기 탈출 시뮬레이션`,
    badge: `${market} 실전 물타기 pSEO`,
    summary: `${nameKo} 1차 매수가 ${fmt(initialPrice)}${unit} 대비 -${dropPercent}% 하락한 ${fmt(currentPrice)}${unit}에서 ${addQty}주 추가 매수 시 평단가는 ${fmt(finalAvgPrice)}${unit}로 희석되며, +${neededRebound}%만 반등해도 본전 탈출이 가능합니다.`,
    params: {
      initialPrice,
      initialQty,
      currentPrice,
      addQty,
      dropPercent,
      multiplier: scenario.additionalMultiplier,
    },
    calculatedResult: {
      primaryLabel: '물타기 후 최종 평단가',
      primaryValue: `${fmt(finalAvgPrice)} ${unit}`,
      secondaryLabel: '본전 탈출 필요 반등률',
      secondaryValue: `+${neededRebound}% 반등 시 본전`,
      tertiaryLabel: '평단가 희석 효과',
      tertiaryValue: `-${dilutionRate}% 단가 절감`,
      detailText: `총 투자금액은 ${fmt(initialTotal + addTotal)} ${unit}(총 ${totalQty}주)이며, 원금 대비 매수가가 ${dilutionRate}% 낮아져 주가가 ${fmt(finalAvgPrice)} ${unit}에 도달하면 즉시 손실 없이 매도 가능합니다. (증권거래세 0.18% 반영)`,
    },
    faqs: [
      {
        question: `${nameKo} 주가가 -${dropPercent}% 빠졌을 때 몇 주를 더 사야 평단가가 낮아지나요?`,
        answer: `기존 100주 보유 기준 현재가(${fmt(currentPrice)}${unit})에서 ${addQty}주(${scenario.additionalMultiplier}배수)를 추가 매수하면 평단가가 ${fmt(initialPrice)}${unit}에서 ${fmt(finalAvgPrice)}${unit}로 ${dilutionRate}% 즉시 낮아집니다.`,
      },
      {
        question: `물타기 후 본전에 도달하려면 주가가 몇 % 올라야 하나요?`,
        answer: `물타기 전에는 +${(((initialPrice - currentPrice) / currentPrice) * 100).toFixed(1)}%가 올라야 원금 회복이 가능했지만, 물타기 후에는 단 +${neededRebound}%만 반등해도 전액 원금 회수가 가능합니다.`,
      },
      {
        question: `가상 주식 거래소 및 실전 매매에서 수수료는 어떻게 계산되나요?`,
        answer: `월덕 머니버스와 국내 증권사는 매도 시 증권거래세 0.18%와 위탁수수료를 차감하므로, 탈출 목표가는 계산된 평단가보다 약 0.2% 높은 가격으로 설정하는 것이 안전합니다.`,
      },
      {
        question: `${nameKo} 추가 매수 자금이 부족할 때는 어떻게 해야 하나요?`,
        answer: `월덕 머니버스 직업 파밍 또는 가상 은행 예적금 만기 이자로 시드머니(WLD)를 확보하여 안전하게 분할 매수(DCA)를 진행하는 것을 추천합니다.`,
      },
    ],
    howToSteps: [
      { name: '1차 매수가 및 잔고 확인', text: `${nameKo} 보유 잔고 ${initialQty}주와 평단가 ${fmt(initialPrice)}${unit}를 확인합니다.` },
      { name: '추가 매수 주문 실행', text: `현재가 ${fmt(currentPrice)}${unit}에 ${addQty}주 추가 매수 주문을 접수합니다.` },
      { name: '탈출 목표가 알림 설정', text: `희석된 평단가 ${fmt(finalAvgPrice)}${unit}에 자동 매도 감시 주문(Stop-Limit)을 설정합니다.` },
    ],
  };
}

/**
 * 사전 정적 빌드 및 사이트맵을 위한 200대 상위 인기 슬러그 목록
 */
export const ALL_PSEO_POPULAR_SLUGS: readonly string[] = POPULAR_STOCKS_DATASET.flatMap((stock) =>
  PSEO_SCENARIOS.map((scenario) => `${stock.ticker}-${scenario.slugSuffix}`)
);
