import { STOCK_SECTOR_MAP } from '@/config/stock-disclosures.config';
import type { PortfolioHoldingInput } from '@/app/stocks/portfolio/analysis';

export interface SectorAllocation {
  readonly sector: string;
  readonly marketValue: string;
  readonly percentageBps: number; // 0 ~ 10000 (100.00%)
  readonly symbols: readonly string[];
}

export interface PortfolioDiagnosticResult {
  readonly totalMarketValue: string;
  readonly distinctSectorCount: number;
  readonly isThreeSectorDiversified: boolean;
  readonly hhiScore: number; // Herfindahl-Hirschman Index (0 ~ 10,000)
  readonly riskGrade: 'A' | 'B' | 'C';
  readonly gradeTitle: string;
  readonly gradeDescription: string;
  readonly sectorAllocations: readonly SectorAllocation[];
  readonly topConcentratedSector: string | null;
  readonly marketMasteryXpBonus: number;
  readonly recommendationMessage: string;
}

const BPS = 10_000n;

export function diagnosePortfolioDiversification(
  holdings: readonly PortfolioHoldingInput[],
): PortfolioDiagnosticResult {
  if (holdings.length === 0) {
    return {
      totalMarketValue: '0',
      distinctSectorCount: 0,
      isThreeSectorDiversified: false,
      hhiScore: 0,
      riskGrade: 'A',
      gradeTitle: '보유 자산 없음',
      gradeDescription: '아직 보유 중인 가상 주식이 없습니다. 모의 투자를 시작해 보세요.',
      sectorAllocations: [],
      topConcentratedSector: null,
      marketMasteryXpBonus: 0,
      recommendationMessage: '서로 다른 3개 섹터의 종목을 분산 매수하여 안정적인 포트폴리오를 구성해 보세요.',
    };
  }

  // 1. Calculate market values per sector
  const sectorValueMap = new Map<string, { value: bigint; symbols: string[] }>();
  let totalValue = 0n;

  for (const item of holdings) {
    const rawVal = BigInt(item.market_value || '0');
    totalValue += rawVal;

    const sector = STOCK_SECTOR_MAP[item.symbol] ?? '기타';
    const current = sectorValueMap.get(sector) ?? { value: 0n, symbols: [] };
    current.value += rawVal;
    if (!current.symbols.includes(item.symbol)) {
      current.symbols.push(item.symbol);
    }
    sectorValueMap.set(sector, current);
  }

  if (totalValue === 0n) {
    return {
      totalMarketValue: '0',
      distinctSectorCount: 0,
      isThreeSectorDiversified: false,
      hhiScore: 0,
      riskGrade: 'A',
      gradeTitle: '평가액 0 WLD',
      gradeDescription: '보유 주식의 현재 평가액이 없습니다.',
      sectorAllocations: [],
      topConcentratedSector: null,
      marketMasteryXpBonus: 0,
      recommendationMessage: '주식 거래소에서 관심 종목을 확인해 보세요.',
    };
  }

  // 2. Build sector allocations and calculate HHI
  const sectorAllocations: SectorAllocation[] = [];
  let hhi = 0; // HHI = sum of (weight in percent)^2. Range: 0 to 10,000

  for (const [sector, data] of sectorValueMap.entries()) {
    const bps = Number((data.value * BPS) / totalValue);
    const weightPercent = bps / 100; // e.g., 50.00% -> 50
    hhi += Math.round(weightPercent * weightPercent);

    sectorAllocations.push({
      sector,
      marketValue: data.value.toString(),
      percentageBps: bps,
      symbols: data.symbols,
    });
  }

  // Sort by allocation descending
  sectorAllocations.sort((a, b) => b.percentageBps - a.percentageBps);

  const distinctSectorCount = sectorAllocations.length;
  const isThreeSectorDiversified = distinctSectorCount >= 3;
  const topConcentratedSector = sectorAllocations[0]?.sector ?? null;

  // 3. Determine Risk Grade
  let riskGrade: 'A' | 'B' | 'C';
  let gradeTitle: string;
  let gradeDescription: string;
  let marketMasteryXpBonus = 0;
  let recommendationMessage: string;

  if (isThreeSectorDiversified && hhi < 3500) {
    riskGrade = 'A';
    gradeTitle = '최우수 분산 포트폴리오 (안정형)';
    gradeDescription = '3개 이상의 섹터에 이상적으로 분산되어 단일 섹터 충격에 안전합니다.';
    marketMasteryXpBonus = 150;
    recommendationMessage = '훌륭한 분산 투자입니다! 시장 숙련도 배지와 +150 XP 획득 조건을 만족했습니다.';
  } else if (distinctSectorCount >= 2 && hhi < 6000) {
    riskGrade = 'B';
    gradeTitle = '보통 분산 포트폴리오 (균형형)';
    gradeDescription = `${topConcentratedSector} 섹터 비중이 다소 높지만 2개 이상의 섹터로 나뉘어 있습니다.`;
    marketMasteryXpBonus = 75;
    recommendationMessage = `다른 성장 섹터(바이오/엔터/물류 등)를 추가 매수하면 3섹터 분산 보너스(+150 XP)를 획득할 수 있습니다.`;
  } else {
    riskGrade = 'C';
    gradeTitle = '고위험 집중 포트폴리오 (몰빵형)';
    gradeDescription = `${topConcentratedSector} 특정 섹터/종목에 자산이 집중되어 변동성 리스크가 매우 큽니다.`;
    marketMasteryXpBonus = 0;
    recommendationMessage = `특정 종목 악재 발생 시 큰 손실 위험이 있습니다. 비상관 섹터로 포트폴리오를 다변화하세요.`;
  }

  return {
    totalMarketValue: totalValue.toString(),
    distinctSectorCount,
    isThreeSectorDiversified,
    hhiScore: hhi,
    riskGrade,
    gradeTitle,
    gradeDescription,
    sectorAllocations,
    topConcentratedSector,
    marketMasteryXpBonus,
    recommendationMessage,
  };
}
