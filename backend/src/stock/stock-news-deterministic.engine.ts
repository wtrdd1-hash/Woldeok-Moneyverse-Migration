import type { ScenarioProposal } from '../admin/ai-news.repository';

interface StockContextItem {
  readonly symbol: string;
  readonly name?: string;
  readonly current_price?: number | string;
  readonly day_open_price?: number | string;
  readonly price_change_pct?: number;
}

interface SectorTemplate {
  readonly sector: string;
  readonly bullishEvents: readonly {
    readonly headline: string;
    readonly body: string;
    readonly rationale: string;
    readonly strength: 1 | 2;
  }[];
  readonly bearishEvents: readonly {
    readonly headline: string;
    readonly body: string;
    readonly rationale: string;
    readonly strength: 1 | 2;
  }[];
}

const SECTOR_NEWS_TEMPLATES: Record<string, SectorTemplate> = {
  CHIPS: {
    sector: '신소재 · 초전도',
    bullishEvents: [
      {
        headline: '[속보] 치무 초전도, 3세대 상온 무손실 송전 케이블 양산 공정 실증 완료',
        body: '치무 초전도 연구진이 차세대 고온 임계 전류 밀도를 35% 개선한 3세대 상온 송전선 양산 수율 92%를 달성했다고 공시했습니다. 대규모 AI 데이터센터 전력망 공급 계약 기대감이 고조되고 있습니다.',
        rationale: '초전도 신소재 수율 돌파와 데이터센터 전력망 수주 가시화에 따른 기술적 모멘텀 호재입니다.',
        strength: 2,
      },
      {
        headline: '[시장 분석] 치무 초전도, 글로벌 첨단 양자컴퓨터 차폐 모듈 독점 공급 논의',
        body: '글로벌 테크 연합체와의 차세대 양자 컴퓨팅 극저온 차폐 모듈 공급 협상이 막바지 단계에 진입했다는 외신 보도가 전해지며 외국인 매수세가 집중되고 있습니다.',
        rationale: '양자컴퓨팅 부품 공급망 진입으로 장기 밸류에이션 리레이팅이 기대됩니다.',
        strength: 1,
      },
    ],
    bearishEvents: [
      {
        headline: '[공시] 치무 초전도, 희토류 원자재 수급 일시 지연에 따른 납품 일정 조정',
        body: '글로벌 광물 공급망 재편으로 일부 희소 금속 원자재의 입고가 지연되어 2분기 출하 목표치가 일시 조정되었습니다. 사측은 대체 공급선 확보로 연간 실적 목표는 유지한다고 밝혔습니다.',
        rationale: '원자재 공급망 이슈에 따른 단기 출하 차질 우려로 숨고르기 국면이 전개됩니다.',
        strength: 1,
      },
    ],
  },
  CHIMU314: {
    sector: '시스템 반도체 · AI 가속기',
    bullishEvents: [
      {
        headline: '[속보] 치무전자, 차세대 2나노 초저전력 AI 추론 칩 테이프아웃 성공',
        body: '치무전자가 독자 설계한 2나노 공정 기반 초저전력 NPU 프로세서 시제품 테스트에서 전력 효율 40% 향상을 기록했습니다. 하반기 대형 클라우드사 양산 공급이 유력시됩니다.',
        rationale: '첨단 미세공정 성과와 신규 NPU 파이프라인 확보에 따른 강력한 펀더멘털 개선입니다.',
        strength: 2,
      },
    ],
    bearishEvents: [
      {
        headline: '[마켓 체크] 치무전자, 단기 급등 후 기관 차익실현 매물 출회에 따른 숨고르기',
        body: '최근 5거래일 연속 상승에 따른 단기 기술적 과열권 진입으로 고점 부근에서 기관의 차익 실현성 분할 매도세가 관측되었습니다.',
        rationale: '단기 급등에 따른 정상적인 기술적 건전 조정 국면입니다.',
        strength: 1,
      },
    ],
  },
  DUCK: {
    sector: '종합 물류 · 글로벌 원자재',
    bullishEvents: [
      {
        headline: '[속보] 덕덕 물산, 아시아-북미 자율운항 초대형 컨테이너 항로 정식 개통',
        body: '덕덕 물산이 친환경 스마트 자율운항 선단을 투입한 태평양 횡단 항로 운항을 시작했습니다. 운항 비용 18% 절감 효과로 연간 영업이익 극대화가 예상됩니다.',
        rationale: '자율운항 항로 효율성 개선으로 물류 부문 수익성 레벨업이 기대됩니다.',
        strength: 2,
      },
    ],
    bearishEvents: [
      {
        headline: '[시황] 덕덕 물산, 글로벌 해상 운임 지수 BDI 단기 조정에 따른 횡보',
        body: '글로벌 발틱 건화물선 지수(BDI)의 계절적 비수기 진입으로 해상 물동량 단기 둔화세가 반영되며 완만한 횡보 흐름을 보이고 있습니다.',
        rationale: '해운 지수의 계절적 비수기에 따른 단기 실적 관망세입니다.',
        strength: 1,
      },
    ],
  },
  MYUY: {
    sector: '글로벌 엔터 · K-컬처 팬덤',
    bullishEvents: [
      {
        headline: '[단독] 뮤야 엔터, 소속 아티스트 월드투어 30개 도시 전석 매진 신기록',
        body: '뮤야 엔터테인먼트의 간판 아티스트 글로벌 스타디움 투어가 티켓 오픈 15분 만에 전 회차 매진을 기록했습니다. 앨범 및 글로벌 MD 부가 매출이 사상 최대치를 경신할 전망입니다.',
        rationale: '글로벌 팬덤 집결과 티켓/MD 올타임 하이 매출 달성에 따른 직관적 실적 호재입니다.',
        strength: 2,
      },
    ],
    bearishEvents: [
      {
        headline: '[업계 동향] 뮤야 엔터, 차세대 IP 제작비 선투자 증가로 단기 마진 보수적 접근',
        body: '글로벌 신인 데뷔 및 메타버스 가상 아이돌 콘텐츠 대규모 제작비가 당기 비용으로 선반영되며 단기 영업이익률 둔화 가능성이 제기되었습니다.',
        rationale: '신규 IP 런칭 전 선제적 투자비용 집행에 따른 단기 마진 압박입니다.',
        strength: 1,
      },
    ],
  },
  SPACE: {
    sector: '우주항공 · 저궤도 위성통신',
    bullishEvents: [
      {
        headline: '[속보] 월덱 우주항공, 차세대 통신위성 64기 군집 궤도 안착 100% 성공',
        body: '월덱 우주항공의 7차 상업 위성 발사체가 목표 저궤도에 위성 64기를 오차 없이 투입했습니다. 전 지구 초고속 위성 인터넷 커버리지가 완성 단계에 돌입했습니다.',
        rationale: '위성 발사 성공률 100% 지속과 글로벌 B2B 통신망 상용화 가속화입니다.',
        strength: 2,
      },
    ],
    bearishEvents: [
      {
        headline: '[현장 뉴스] 월덱 우주항공, 기상 악화로 차세대 재사용 발사체 시험 일정 연기',
        body: '해상 발사장 상공의 강풍 및 기상 불안정으로 인해 계획되었던 발사체 재사용 회수 시험이 안전을 위해 차주로 순연되었습니다.',
        rationale: '기상 요인에 따른 단기 일정 지연으로 투자자들의 관망세가 짙어졌습니다.',
        strength: 1,
      },
    ],
  },
  WDB: {
    sector: '바이오 테크 · 신약 파이프라인',
    bullishEvents: [
      {
        headline: '[속보] 월덱 바이오, 차세대 면역항암제 글로벌 임상 3상 안전성 유효성 입증',
        body: '월덱 바이오가 개발 중인 혁신 면역항암 후보물질이 독립적 데이터 모니터링 위원회(IDMC)로부터 임상 지속 권고를 받으며 기술 수출(L/O) 가능성이 대폭 상승했습니다.',
        rationale: '임상 3상 데이터 발표 기대감과 빅파마 기술이전 모멘텀 호재입니다.',
        strength: 2,
      },
    ],
    bearishEvents: [
      {
        headline: '[공시] 월덱 바이오, 당국 보완 자료 요청에 따른 허가 심사 기간 소폭 연장',
        body: '신약 제조 및 품질관리(GMP) 기준에 대한 규제 당국의 통상적인 보완 서류 요청이 접수되어 최종 허가 일정이 45일 연장되었습니다.',
        rationale: '인허가 타임라인 지연 우려로 단기 매도 압력이 유입되었습니다.',
        strength: 1,
      },
    ],
  },
  WDG: {
    sector: '게임 · 인터랙티브 미디어',
    bullishEvents: [
      {
        headline: '[흥행 돌풍] 월덱 게임즈, 글로벌 스팀 동시 접속자 80만 명 돌파',
        body: '월덱 게임즈의 오픈월드 RPG 신작이 글로벌 플랫폼 출시 주말에 동시 접속자 80만 명을 기록하며 글로벌 매출 1위에 등극했습니다. DLC 유료 결제율도 급증세입니다.',
        rationale: '글로벌 메가히트 지표 달성과 IP 수수료 수입 확대에 따른 강력한 실적 반등입니다.',
        strength: 2,
      },
    ],
    bearishEvents: [
      {
        headline: '[서버 점검] 월덱 게임즈, 신작 접속 폭주로 긴급 임시 점검 진행',
        body: '동시 접속자 폭증으로 인한 데이터베이스 병목 해소를 위해 4시간 동안 긴급 서버 증설 및 안정화 패치가 진행되며 일시적 트래픽 공백이 발생했습니다.',
        rationale: '서버 점검에 따른 단기 이용 지연 소식입니다.',
        strength: 1,
      },
    ],
  },
  WDM: {
    sector: '전기차 · 자율주행 모빌리티',
    bullishEvents: [
      {
        headline: '[기술 발표] 월덱 모빌리티, 레벨 4 도심 무인 로보택시 상용 주행 승인',
        body: '월덱 모빌리티의 AI 비전 기반 자율주행 시스템이 수도권 주요 도심 50km 구간에서 운전석 무인 자율주행 최종 안전 승인을 획득했습니다. 하반기 요금 부과 서비스가 개시됩니다.',
        rationale: '로보택시 사업화 승인과 모빌리티 구독 수익 파이프라인 신설 호재입니다.',
        strength: 2,
      },
    ],
    bearishEvents: [
      {
        headline: '[시장 분석] 월덱 모빌리티, 배터리 원가 하락에도 경쟁사 할인 공세에 마진 경쟁 심화',
        body: '글로벌 완성차 시장의 가격 인하 경쟁 여파로 단기 프로모션 지출이 증가하여 영업이익률 전망치가 일부 조정되었습니다.',
        rationale: '완성차 업계 가격 경쟁 심화에 따른 단기 수익성 우려입니다.',
        strength: 1,
      },
    ],
  },
  WDT: {
    sector: '클라우드 · 엔터프라이즈 AI',
    bullishEvents: [
      {
        headline: '[대규모 수주] 월덱 테크, 금융 공공기관 차세대 프라이빗 클라우드 전환 수주',
        body: '월덱 테크가 대형 공공 금융기관의 디지털 전환 및 제로 트러스트 보안 인프라 구축 단독 사업자로 선정되었습니다. 5년간 450억 WLD 규모의 안정적 매출이 확보되었습니다.',
        rationale: '대규모 공공 수주와 장기 구독 기반 ARR 확대로 안정적 성장 기반을 확보했습니다.',
        strength: 2,
      },
    ],
    bearishEvents: [
      {
        headline: '[산업 리포트] 월덱 테크, 데이터센터 냉각 인프라 전력비 상승으로 유지비 소폭 증가',
        body: '하절기 전력 수요 급증과 데이터센터 냉각 설비 가동비 상승으로 3분기 인프라 운영 비용이 전 분기 대비 4.2% 증가했습니다.',
        rationale: '인프라 유지보수 비용 증가에 따른 단기 손익 변동입니다.',
        strength: 1,
      },
    ],
  },
  WFIN: {
    sector: '디지털 금융 · 핀테크 인프라',
    bullishEvents: [
      {
        headline: '[어닝 서프라이즈] 월덱 파이낸셜, 3분기 순이익 28% 급증… 주당 배당금 15% 상향',
        body: '가상경제 머니버스 내 P2P 결제 및 예적금 수수료 수입 호조로 분기 사상 최대 당기순이익을 달성했습니다. 이사회는 적극적인 주주환원 정책으로 분기 배당금을 15% 인상한다고 의결했습니다.',
        rationale: '호실적 발표와 고배당 정책 확정에 따른 배당 매력 부각 호재입니다.',
        strength: 2,
      },
    ],
    bearishEvents: [
      {
        headline: '[금융 규제] 월덱 파이낸셜, 중앙은행 대출 규제 강화에 따른 예대마진 소폭 축소',
        body: '중앙은행의 통화 유동성 조절을 위한 대출 충당금 적립 가이드라인이 발표되며 단기 대출 취급액 성장이 소폭 둔화될 전망입니다.',
        rationale: '긴축적 금융 환경에 따른 예대마진 압박입니다.',
        strength: 1,
      },
    ],
  },
};

/**
 * 10대 가상 상장사 실시간 시세 및 모멘텀 기반 결정론적 주식 속보 생성 엔진
 * - 외부 LLM API 연결 장애나 키 누락 시에도 100% 무중단 발행 보장.
 */
export function generateDeterministicStockNews(context: Record<string, unknown>): ScenarioProposal[] {
  const stocks = Array.isArray(context.stocks) ? (context.stocks as StockContextItem[]) : [];
  if (stocks.length === 0) return [];

  // 1. 등록된 종목 중 시세 변동률 또는 거래량이 가장 큰 종목을 타겟으로 선정
  const ranked = [...stocks].sort((a, b) => {
    const changeA = Math.abs(typeof a.price_change_pct === 'number' ? a.price_change_pct : 0);
    const changeB = Math.abs(typeof b.price_change_pct === 'number' ? b.price_change_pct : 0);
    return changeB - changeA;
  });

  // 타겟 종목들 (상위 2개)
  const targets = ranked.slice(0, 2);
  const proposals: ScenarioProposal[] = [];

  for (const stock of targets) {
    const symbol = stock.symbol.toUpperCase();
    const template = SECTOR_NEWS_TEMPLATES[symbol] ?? {
      sector: '가상경제 기업',
      bullishEvents: [
        {
          headline: `[공시] ${symbol}, 글로벌 전략 파트너십 체결 및 신사업 본격 진출`,
          body: `${symbol}이 차세대 디지털 경제 생태계 확장을 위해 전략적 제휴를 맺고 해외 시장 공략에 착수한다고 밝혔습니다.`,
          rationale: '신규 성장 동력 확보에 따른 긍정적 모멘텀 호재입니다.',
          strength: 1,
        },
      ],
      bearishEvents: [
        {
          headline: `[시황] ${symbol}, 단기 급등 후 숨고르기 매물 출회에 따른 조정`,
          body: `${symbol} 주가가 단기 상승 피로감으로 인해 완만한 차익 실현 매물을 소화하며 횡보 흐름을 나타내고 있습니다.`,
          rationale: '기술적 지지선 테스트를 위한 건전한 완만 조정입니다.',
          strength: 1,
        },
      ],
    };

    const isBullish = (stock.price_change_pct ?? 0) >= 0;
    const pool = isBullish ? template.bullishEvents : template.bearishEvents;
    const chosen = pool[Math.floor(Math.random() * pool.length)] ?? pool[0]!;

    proposals.push({
      headline: chosen.headline,
      body: chosen.body,
      rationale: chosen.rationale,
      hours: 12, // 12시간 지속
      effects: [
        {
          stock_symbol: symbol,
          direction: isBullish ? 'up' : 'down',
          strength: chosen.strength,
        },
      ],
    });
  }

  return proposals;
}
