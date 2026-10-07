import { Injectable, Logger } from '@nestjs/common';

export interface MacroIndicator {
  readonly id: string;
  readonly name: string;
  readonly nameEn: string;
  readonly value: number;
  readonly unit: string;
  readonly changeRate: number; // 전일/직전 대비 %
  readonly description: string;
  readonly descriptionEn: string;
  readonly educationalTip: string;
  readonly educationalTipEn: string;
}

export interface GlobalCurrencyRate {
  readonly code: string;
  readonly name: string;
  readonly symbol: string;
  readonly ratePerWld: number; // 1 WLD당 가치
  readonly formatted: string;
}

export interface EconomicCalendarEvent {
  readonly id: string;
  readonly title: string;
  readonly titleEn: string;
  readonly scheduledDate: string;
  readonly scheduledTime: string;
  readonly dDay: number; // 0: D-Day(오늘), >0: D-N
  readonly importance: 'HIGH' | 'MEDIUM' | 'LOW';
  readonly country: 'KR' | 'US' | 'EU';
  readonly previousValue: string;
  readonly forecastValue: string;
  readonly analysisKo: string;
  readonly analysisEn: string;
  readonly marketImpactTipKo: string;
  readonly marketImpactTipEn: string;
}

export interface MacroPulsePayload {
  readonly updatedAt: string;
  readonly nextUpdateAt: string;
  readonly domestic: readonly MacroIndicator[];
  readonly global: readonly MacroIndicator[];
  readonly exchangeRates: readonly GlobalCurrencyRate[];
  readonly economicCalendar: readonly EconomicCalendarEvent[];
  readonly marketSummary: {
    readonly sentiment: 'RISK_ON' | 'NEUTRAL' | 'RISK_OFF';
    readonly summaryKo: string;
    readonly summaryEn: string;
    readonly actionTipKo: string;
    readonly actionTipEn: string;
  };
}

@Injectable()
export class MacroPulseService {
  private readonly logger = new Logger(MacroPulseService.name);
  private cachedPulse: MacroPulsePayload | null = null;
  private lastGeneratedTime: number = 0;

  getMacroPulse(): MacroPulsePayload {
    const now = Date.now();
    // 10분마다 미세한 시장 변동성을 반영하여 자동 시뮬레이션 갱신
    if (!this.cachedPulse || now - this.lastGeneratedTime > 10 * 60 * 1000) {
      this.cachedPulse = this.generateDynamicPulse(now);
      this.lastGeneratedTime = now;
      this.logger.log(`Macro economy pulse auto-refreshed at ${new Date(now).toISOString()}`);
    }
    return this.cachedPulse;
  }

  private generateDynamicPulse(timestamp: number): MacroPulsePayload {
    // 시간에 따른 자연스러운 소수점 변동 계수 (Deterministic & realistic wave)
    const hourCycle = (timestamp / (1000 * 60 * 60)) % 24;
    const microWave = Math.sin(hourCycle * Math.PI / 12) * 0.4;
    const kospiWave = Math.cos(hourCycle * Math.PI / 8) * 12.5;
    const nasdaqWave = Math.sin(hourCycle * Math.PI / 6) * 45.2;
    const usdkrwWave = Math.sin(hourCycle * Math.PI / 4) * 3.8;

    const bokRate = 3.25;
    const fedRate = 4.75;
    const kospi = Math.round((2640.5 + kospiWave) * 10) / 10;
    const sp500 = Math.round((5780.2 + nasdaqWave * 0.25) * 10) / 10;
    const nasdaq = Math.round((18250.8 + nasdaqWave) * 10) / 10;
    const usdkrw = Math.round((1382.4 + usdkrwWave) * 10) / 10;
    const dxy = Math.round((103.45 + microWave * 0.5) * 100) / 100;
    const us10y = Math.round((4.18 + microWave * 0.08) * 100) / 100;

    const domestic: MacroIndicator[] = [
      {
        id: 'bok_rate',
        name: '한국은행 기준금리',
        nameEn: 'Bank of Korea Base Rate',
        value: bokRate,
        unit: '%',
        changeRate: 0.0,
        description: '국내 금융기관 예금 및 대출 금리의 기준이 되는 중앙은행 정책금리입니다.',
        descriptionEn: 'The policy interest rate set by the Bank of Korea benchmark for domestic loans and savings.',
        educationalTip: '기준금리가 높으면 은행 예금 이자가 늘어나 저축이 유리해지고, 주식 시장의 유동성은 줄어듭니다.',
        educationalTipEn: 'Higher rates favor bank savings while withdrawing liquidity from equity markets.',
      },
      {
        id: 'kospi',
        name: 'KOSPI 코스피 종합지수',
        nameEn: 'KOSPI Index',
        value: kospi,
        unit: 'pt',
        changeRate: Number((kospiWave / 2640 * 100).toFixed(2)),
        description: '대한민국 유가증권시장의 대표 기업 800+개 시가총액 가중 종합지표입니다.',
        descriptionEn: 'Benchmark stock market index of South Korea covering 800+ listed companies.',
        educationalTip: '반도체, 자동차 등 수출 대형주 비중이 높아 글로벌 환율과 경기 선행 지표에 민감하게 반응합니다.',
        educationalTipEn: 'Heavily weighted in semiconductors and exports, sensitive to FX and global macro cycles.',
      },
      {
        id: 'usd_krw',
        name: '원/달러 환율 (USD/KRW)',
        nameEn: 'USD/KRW Exchange Rate',
        value: usdkrw,
        unit: '원',
        changeRate: Number((usdkrwWave / 1380 * 100).toFixed(2)),
        description: '미국 1달러를 구매하기 위해 필요한 원화의 교환 가치입니다.',
        descriptionEn: 'The exchange rate indicating how many Korean Won is required to purchase 1 US Dollar.',
        educationalTip: '환율 상승(원화 약세)은 수출 기업의 원화 환산 이익을 늘리지만, 수입 물가 상승과 자본 유출 압력을 가합니다.',
        educationalTipEn: 'A rising rate boosts exporter KRW margins but increases imported inflation pressures.',
      },
      {
        id: 'kr_cpi',
        name: '소비자물가상승률 (CPI YoY)',
        nameEn: 'Consumer Price Index Inflation',
        value: 2.1,
        unit: '%',
        changeRate: -0.1,
        description: '소비자가 일상에서 체감하는 장바구니 물가의 전년 동기 대비 변화율입니다.',
        descriptionEn: 'Year-over-year percentage change in the cost of consumer goods and services.',
        educationalTip: '인플레이션이 2% 수준으로 안정되면 중앙은행의 금리 인하 여력이 확대되어 자산 시장에 호재가 됩니다.',
        educationalTipEn: 'Inflation stabilizing around 2% gives central banks room to cut rates, stimulating investments.',
      },
    ];

    const global: MacroIndicator[] = [
      {
        id: 'fed_funds',
        name: '미국 연준(Fed) 기준금리',
        nameEn: 'US Federal Funds Rate',
        value: fedRate,
        unit: '%',
        changeRate: 0.0,
        description: '전 세계 기축통화 달러의 조달 비용을 결정짓는 세계 최대 영향력의 금리입니다.',
        descriptionEn: 'The target policy interest rate set by the US Federal Reserve, guiding global capital costs.',
        educationalTip: '연준의 금리 결정(FOMC)은 전 세계 주식, 암호화폐, 환율을 동시에 움직이는 최고의 거시경제 변수입니다.',
        educationalTipEn: 'Fed FOMC decisions are the single most influential macro driver across global stocks and currencies.',
      },
      {
        id: 'nasdaq',
        name: 'NASDAQ 나스닥 종합지수',
        nameEn: 'NASDAQ Composite',
        value: nasdaq,
        unit: 'pt',
        changeRate: Number((nasdaqWave / 18200 * 100).toFixed(2)),
        description: '애플, 엔비디아, 마이크로소프트 등 글로벌 첨단 기술·혁신 성장주 중심의 지수입니다.',
        descriptionEn: 'Global benchmark tech and innovation index featuring Apple, Nvidia, Microsoft, etc.',
        educationalTip: '미래 기대 수익을 현재 가치로 환산하는 성장주 특성상, 장기 시장금리 하락 시 가장 강하게 상승합니다.',
        educationalTipEn: 'Growth stocks rally hardest when bond yields ease due to lower discount rates on future cash flows.',
      },
      {
        id: 'sp500',
        name: 'S&P 500 종합지수',
        nameEn: 'S&P 500 Index',
        value: sp500,
        unit: 'pt',
        changeRate: Number(((nasdaqWave * 0.25) / 5780 * 100).toFixed(2)),
        description: '미국을 대표하는 상위 500대 우량 기업들의 시가총액 가중 평균 지수입니다.',
        descriptionEn: 'Broad-based US market benchmark representing the top 500 large-cap corporations.',
        educationalTip: '워런 버핏이 가장 강력하게 추천하는 장기 분산 적립식 복리 투자의 대표적인 벤치마크입니다.',
        educationalTipEn: 'The primary benchmark recommended by Warren Buffett for long-term compounding index investing.',
      },
      {
        id: 'dxy',
        name: '달러 인덱스 (DXY)',
        nameEn: 'US Dollar Index (DXY)',
        value: dxy,
        unit: 'pt',
        changeRate: Number((microWave * 0.5).toFixed(2)),
        description: '유로, 엔, 파운드 등 주요 6개 통화 대비 미국 달러화의 상대적 강세 척도입니다.',
        descriptionEn: 'Geometric average measuring the US Dollar relative to a basket of 6 major foreign currencies.',
        educationalTip: 'DXY가 높을수록 킹달러 현상으로 신흥국 주식과 원자재 시장에서 자금이 이탈하는 경향이 있습니다.',
        educationalTipEn: 'A stronger dollar often pulls capital out of emerging markets and risk-on commodities.',
      },
      {
        id: 'us10y',
        name: '미국채 10년물 금리',
        nameEn: 'US 10-Year Treasury Yield',
        value: us10y,
        unit: '%',
        changeRate: Number((microWave * 0.08).toFixed(2)),
        description: '글로벌 무위험 이자율(Risk-free Rate)의 표준이자 자산 가치 평가의 할인율입니다.',
        descriptionEn: 'The global benchmark risk-free rate, used worldwide as the denominator in DCF asset pricing.',
        educationalTip: '10년물 국채 금리가 오르면 주식의 밸류에이션 매력도가 떨어져 주가 밸류에이션 조정이 발생합니다.',
        educationalTipEn: 'Higher yields make bonds attractive, compressing stock P/E valuation multiples.',
      },
    ];

    // 1 WLD 기준 실제 통화 환산 가치 (1 WLD = 100 KRW = $0.0723 USD)
    const exchangeRates: GlobalCurrencyRate[] = [
      {
        code: 'KRW',
        name: '대한민국 원',
        symbol: '₩',
        ratePerWld: 100,
        formatted: '100원',
      },
      {
        code: 'USD',
        name: '미국 달러',
        symbol: '$',
        ratePerWld: Number((100 / usdkrw).toFixed(4)),
        formatted: `$${(100 / usdkrw).toFixed(4)}`,
      },
      {
        code: 'JPY',
        name: '일본 엔',
        symbol: '¥',
        ratePerWld: Number(((100 / usdkrw) * 153.2).toFixed(2)),
        formatted: `¥${((100 / usdkrw) * 153.2).toFixed(2)}`,
      },
      {
        code: 'EUR',
        name: '유럽 유로',
        symbol: '€',
        ratePerWld: Number(((100 / usdkrw) * 0.92).toFixed(4)),
        formatted: `€${((100 / usdkrw) * 0.92).toFixed(4)}`,
      },
    ];

    const isRiskOn = nasdaqWave >= 0;
    const sentiment: 'RISK_ON' | 'NEUTRAL' | 'RISK_OFF' = isRiskOn ? 'RISK_ON' : 'RISK_OFF';

    const formatDateOffset = (days: number): string => {
      const d = new Date(timestamp + days * 86_400_000);
      return d.toISOString().slice(0, 10);
    };

    const economicCalendar: EconomicCalendarEvent[] = [
      {
        id: 'us-cpi',
        title: '미국 9월 소비자물가지수 (CPI) 발표',
        titleEn: 'US September Consumer Price Index (CPI)',
        scheduledDate: formatDateOffset(1),
        scheduledTime: '21:30 KST',
        dDay: 1,
        importance: 'HIGH',
        country: 'US',
        previousValue: '2.5% YoY',
        forecastValue: '2.3% YoY',
        analysisKo: '인플레이션 둔화세가 확인될 경우 미 연준의 연속 금리 인하 기대감이 폭발하여 기술 성장주에 강력한 호재로 작용합니다.',
        analysisEn: 'Confirmation of disinflation will fuel Fed rate cut bets, serving as a powerful catalyst for tech equities.',
        marketImpactTipKo: '예측치(2.3%) 하회 시 ➡️ 주식 급등, 달러 약세 / 예측치 상회 시 ➡️ 국채금리 반등, 단기 조정 주의',
        marketImpactTipEn: 'Below forecast ➡️ Stock rally, weaker USD / Above forecast ➡️ Yield rebound, risk-off pressure',
      },
      {
        id: 'fomc-rate',
        title: '미국 연준 FOMC 정례회의 기준금리 결정',
        titleEn: 'Federal Reserve FOMC Interest Rate Decision',
        scheduledDate: formatDateOffset(3),
        scheduledTime: '03:00 KST',
        dDay: 3,
        importance: 'HIGH',
        country: 'US',
        previousValue: '5.00%',
        forecastValue: '4.75% (-25bp)',
        analysisKo: '글로벌 유동성의 방향타를 결정짓는 핵심 이벤트입니다. 파월 의장의 기자회견과 점도표(Dot Plot) 코멘트가 관건입니다.',
        analysisEn: 'The definitive steering event for global liquidity. Focus is on Chair Powell press conference and Dot Plot trajectories.',
        marketImpactTipKo: '0.25%p 인하 기정사실화 국면. 향후 추가 인하 속도에 대한 가이던스에 따라 환율과 가상주식 변동성이 확대됩니다.',
        marketImpactTipEn: 'A 25bp cut is largely priced in. Forward guidance on subsequent easing will dictate FX and equity volatility.',
      },
      {
        id: 'us-nfp',
        title: '미국 비농업 고용보고서 (NFP) 및 실업률',
        titleEn: 'US Non-Farm Payrolls (NFP) & Unemployment Rate',
        scheduledDate: formatDateOffset(5),
        scheduledTime: '21:30 KST',
        dDay: 5,
        importance: 'HIGH',
        country: 'US',
        previousValue: '142K / 4.2%',
        forecastValue: '150K / 4.2%',
        analysisKo: '미국 노동시장의 냉각 속도를 측정하는 바로미터로, 경기 침체(Hard Landing) 우려 여부를 가르는 결정적 지표입니다.',
        analysisEn: 'The benchmark gauge of US labor cooling, pivotal for assessing soft landing vs recessionary headwinds.',
        marketImpactTipKo: '고용이 적당히 견조하면서 임금 상승률이 안정될 때 골디락스(Goldilocks) 장세가 연출됩니다.',
        marketImpactTipEn: 'Moderate job growth paired with contained wage gains creates ideal Goldilocks market conditions.',
      },
      {
        id: 'bok-rate',
        title: '한국은행 금융통화위원회 기준금리 결정',
        titleEn: 'Bank of Korea Monetary Policy Committee Decision',
        scheduledDate: formatDateOffset(7),
        scheduledTime: '10:00 KST',
        dDay: 7,
        importance: 'HIGH',
        country: 'KR',
        previousValue: '3.50%',
        forecastValue: '3.25% (-25bp 피벗)',
        analysisKo: '국내 가계부채와 부동산 시장 동향, 수도권 집값 안정을 저울질하며 3년여 만의 통화정책 전환(피벗) 가능성이 제기됩니다.',
        analysisEn: 'Balancing household debt and real estate stability, this marks the potential first monetary policy pivot in over 3 years.',
        marketImpactTipKo: '한은 금리 인하 시 시중 은행 예적금 금리가 하락하므로, 주식 및 채권 등 고수익 자산으로의 자금 이동이 촉진됩니다.',
        marketImpactTipEn: 'A BOK rate cut depresses savings deposit yields, accelerating retail capital migration into equities and bonds.',
      },
      {
        id: 'ecb-policy',
        title: '유럽중앙은행 (ECB) 통화정책 회의',
        titleEn: 'European Central Bank (ECB) Governing Council Meeting',
        scheduledDate: formatDateOffset(12),
        scheduledTime: '21:15 KST',
        dDay: 12,
        importance: 'MEDIUM',
        country: 'EU',
        previousValue: '3.65%',
        forecastValue: '3.40%',
        analysisKo: '유로존 제조업 경기 둔화에 대응하기 위한 완화적 금리 기조로, 유로화 환율 및 글로벌 국채 시장에 파급력을 갖습니다.',
        analysisEn: 'Easing monetary stance to counter eurozone industrial sluggishness, impacting EUR/USD and global sovereign yields.',
        marketImpactTipKo: '달러 인덱스(DXY)에서 유로화 비중이 57.6%로 가장 높기 때문에, ECB 금리 결정은 달러 환율에 직결됩니다.',
        marketImpactTipEn: 'Since EUR accounts for 57.6% of the DXY basket, ECB decisions have immediate feedback on dollar pricing.',
      },
    ];

    const marketSummary = {
      sentiment,
      summaryKo: isRiskOn
        ? '미국 기술주 랠리와 유동성 개선 신호로 글로벌 위험선호(Risk-On) 심리가 우세합니다. 첨단 가상 기술주(CHIPS, NEOCYBER) 중심의 매수세가 강합니다.'
        : '달러 강세 및 시장금리 관망세로 신중한 방어적 분산 투자(Risk-Off)가 유리한 국면입니다. 은행 복리 예금과 가상 국채의 비중을 높이세요.',
      summaryEn: isRiskOn
        ? 'Risk-on sentiment prevails driven by tech resilience. Favorable conditions for growth equities (CHIPS, NEOCYBER).'
        : 'Cautious risk-off environment amid dollar strength. Increasing allocations to compound banking pots and virtual bonds is prudent.',
      actionTipKo: '💡 실전 팁: 한미 기준금리 격차(1.50%p)를 이해하면 왜 주식과 예금 포트폴리오를 분산해야 하는지 체득할 수 있습니다.',
      actionTipEn: '💡 Pro Tip: Understanding the US-Korea rate spread clarifies why dynamic asset allocation between stocks and bonds is vital.',
    };

    return {
      updatedAt: new Date(timestamp).toISOString(),
      nextUpdateAt: new Date(timestamp + 10 * 60 * 1000).toISOString(),
      domestic,
      global,
      exchangeRates,
      economicCalendar,
      marketSummary,
    };
  }
}
