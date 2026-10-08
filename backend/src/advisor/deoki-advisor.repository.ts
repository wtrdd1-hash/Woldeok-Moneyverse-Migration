import type { Queryable } from '../core/db';

export interface AssetSummary {
  readonly cash: number;
  readonly savings: number;
  readonly stocks: number;
  readonly bonds: number;
  readonly total: number;
  readonly stockCount: number;
  readonly topStockSymbol: string | null;
  readonly topStockRatio: number;
}

export interface RebalanceSuggestion {
  readonly assetClass: string;
  readonly currentRatio: number;
  readonly targetRatio: number;
  readonly action: 'BUY' | 'SELL' | 'HOLD' | 'DEPOSIT';
  readonly advice: string;
}

export interface DeokiDiagnosis {
  readonly id: string;
  readonly userId: string;
  readonly prIndex: number;
  readonly riskLevel: 'VERY_LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  readonly assetSummary: AssetSummary;
  readonly diagnosticNotes: string[];
  readonly rebalanceSuggestions: RebalanceSuggestion[];
  readonly createdAt: string;
}

export class DeokiAdvisorRepository {
  constructor(private readonly db: Queryable) {}

  async diagnoseUserPortfolio(userId: string): Promise<DeokiDiagnosis> {
    // 1. 현금 잔액 조회
    const cashRes = await this.db.query(
      `SELECT balance FROM public.accounts WHERE user_id = $1 AND account_type = 'USER_CASH' LIMIT 1`,
      [userId]
    );
    const firstCash = cashRes.rows[0];
    const cash = firstCash ? Math.max(0, Number(firstCash.balance)) : 0;

    // 2. 예금/세이빙스 잔액 조회
    const savingsRes = await this.db.query(
      `SELECT balance FROM public.accounts WHERE user_id = $1 AND account_type = 'USER_SAVINGS' LIMIT 1`,
      [userId]
    );
    const firstSavings = savingsRes.rows[0];
    const savings = firstSavings ? Math.max(0, Number(firstSavings.balance)) : 0;

    // 3. 보유 주식 평가액 조회
    const stocksRes = await this.db.query(
      `SELECT us.symbol, us.shares, COALESCE(sp.current_price, 1000) as current_price,
              (us.shares * COALESCE(sp.current_price, 1000)) as eval_value
       FROM public.user_stocks us
       LEFT JOIN public.stock_prices sp ON sp.symbol = us.symbol
       WHERE us.user_id = $1 AND us.shares > 0
       ORDER BY eval_value DESC`,
      [userId]
    );

    let totalStockVal = 0;
    const holdingStocks: Array<{ symbol: string; shares: number; price: number; evalVal: number }> = [];

    for (const row of stocksRes.rows) {
      const val = Math.max(0, Number(row.eval_value));
      totalStockVal += val;
      holdingStocks.push({
        symbol: row.symbol,
        shares: Number(row.shares),
        price: Number(row.current_price),
        evalVal: val,
      });
    }

    // 4. 국채 보유액 조회 (테이블 존재 시)
    let bondsVal = 0;
    try {
      const bondsRes = await this.db.query(
        `SELECT COALESCE(SUM(amount), 0) as total_bonds
         FROM public.government_bonds
         WHERE user_id = $1 AND status = 'active'`,
        [userId]
      );
      const firstBond = bondsRes.rows[0];
      if (firstBond) {
        bondsVal = Number(firstBond.total_bonds);
      }
    } catch {
      bondsVal = 0;
    }

    const totalAsset = Math.max(1, cash + savings + totalStockVal + bondsVal);

    // 5. 비중 및 집중도(HHI) 계산
    const cashRatio = (cash + savings) / totalAsset;
    const stockRatio = totalStockVal / totalAsset;
    const bondRatio = bondsVal / totalAsset;

    let hhi = 0;
    let topSymbol: string | null = null;
    let topStockRatio = 0;

    if (totalStockVal > 0 && holdingStocks.length > 0) {
      topSymbol = holdingStocks[0] ? holdingStocks[0].symbol : null;
      topStockRatio = holdingStocks[0] ? holdingStocks[0].evalVal / totalStockVal : 0;

      for (const st of holdingStocks) {
        const weight = (st.evalVal / totalStockVal) * 100;
        hhi += weight * weight;
      }
    }

    // 6. PR-Index(0~100) 점수 산정
    let prIndex = 50;

    // 현금 비중 점수 (15~35%가 이상적)
    if (cashRatio >= 0.15 && cashRatio <= 0.4) {
      prIndex += 25;
    } else if (cashRatio > 0.4 && cashRatio <= 0.7) {
      prIndex += 15;
    } else if (cashRatio < 0.05) {
      prIndex -= 20; // 긴급 유동성 고갈 위험
    } else if (cashRatio > 0.9) {
      prIndex -= 10; // 과도한 유휴 현금 방치
    }

    // 주식 집중도 점수
    if (totalStockVal === 0) {
      prIndex += 10; // 무주식
    } else if (hhi < 2500 && holdingStocks.length >= 3) {
      prIndex += 25; // 훌륭한 분산
    } else if (hhi >= 5000 || topStockRatio >= 0.7) {
      prIndex -= 25; // 단일 종목 몰빵 위험
    } else {
      prIndex += 10;
    }

    // 자산 다각화 점수 (채권/예금 연계)
    if (bondRatio > 0.05 || savings > 0) {
      prIndex += 15;
    }

    // 범위 제한 (10 ~ 98)
    prIndex = Math.min(98, Math.max(12, Math.round(prIndex)));

    // 7. 리스크 레벨 분류 및 덕이의 처방전 생성
    let riskLevel: 'VERY_LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'MODERATE';
    const notes: string[] = [];
    const suggestions: RebalanceSuggestion[] = [];

    if (prIndex >= 80) {
      riskLevel = 'VERY_LOW';
      notes.push('🦆 덕이 진단: 완벽한 자산 밸런스입니다! 주식과 안전자산의 균형이 모범적이에요.');
      notes.push('📈 현재 시장 변동성에도 흔들리지 않는 견고한 방어력을 갖추고 있습니다.');
    } else if (prIndex >= 60) {
      riskLevel = 'MODERATE';
      notes.push('🦆 덕이 진단: 비교적 균형 잡힌 포트폴리오이나, 일부 성장 자산으로의 리밸런싱 여지가 있습니다.');
      notes.push('💡 14일 주식 챔피언십 리그 참가 또는 고래 카피 트레이딩을 통해 초과 수익을 노려보세요.');
    } else if (prIndex >= 35) {
      riskLevel = 'HIGH';
      notes.push('⚠️ 덕이의 주의보: 특정 자산 또는 단일 종목에 비중이 쏠려 있어 급락 시 리스크가 큽니다.');
      if (topSymbol && topStockRatio >= 0.5) {
        notes.push(`🚨 [${topSymbol}] 종목이 주식 자산의 ${(topStockRatio * 100).toFixed(0)}%를 차지하고 있어요. 분할 매도로 차익을 실현하고 분산하세요.`);
      }
    } else {
      riskLevel = 'CRITICAL';
      notes.push('🚨 덕이의 비상 경고: 극단적인 몰빵 투자 또는 현금 바닥 상태입니다! 서킷브레이커 시 치명적입니다.');
      notes.push('🛡️ 즉시 최소 20%의 현금을 확보하거나 국가지정 확정금리 국채로 긴급 대피하세요.');
    }

    // 리밸런싱 권장안
    suggestions.push({
      assetClass: '현금/예금',
      currentRatio: Math.round(cashRatio * 100),
      targetRatio: 25,
      action: cashRatio < 0.15 ? 'DEPOSIT' : cashRatio > 0.45 ? 'BUY' : 'HOLD',
      advice: cashRatio < 0.15 ? '비상금 계좌에 현금을 최소 20% 이상 채워두세요.' : '적정 현금을 유지 중입니다.',
    });

    suggestions.push({
      assetClass: '가상 주식 (WDX)',
      currentRatio: Math.round(stockRatio * 100),
      targetRatio: 55,
      action: stockRatio > 0.75 ? 'SELL' : stockRatio < 0.3 ? 'BUY' : 'HOLD',
      advice: stockRatio > 0.75 ? '수익 종목을 분할 매도하여 국채나 세이빙스로 이전하세요.' : '우량주 위주 분할 매수가 유리합니다.',
    });

    suggestions.push({
      assetClass: '국가지정 국채 (KTB)',
      currentRatio: Math.round(bondRatio * 100),
      targetRatio: 20,
      action: bondRatio < 0.1 ? 'BUY' : 'HOLD',
      advice: '시간당 연 4~7% 확정 쿠폰 이자를 지급하는 국채에 안전 분산하세요.',
    });

    const assetSummary: AssetSummary = {
      cash,
      savings,
      stocks: totalStockVal,
      bonds: bondsVal,
      total: totalAsset,
      stockCount: holdingStocks.length,
      topStockSymbol: topSymbol,
      topStockRatio: Math.round(topStockRatio * 100),
    };

    // 8. 진단 결과 DB 원장 기록 (게스트 지원 및 안전 폴백)
    let diagId = '00000000-0000-0000-0000-000000000000';
    let createdAt = new Date().toISOString();

    const targetUserId = (userId && userId !== '00000000-0000-0000-0000-000000000000') ? userId : null;

    try {
      const insertRes = await this.db.query(
        `INSERT INTO public.ai_financial_diagnoses (
           user_id, pr_index, risk_level, asset_summary, diagnostic_notes, rebalance_suggestions
         ) VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, created_at`,
        [
          targetUserId,
          prIndex,
          riskLevel,
          JSON.stringify(assetSummary),
          JSON.stringify(notes),
          JSON.stringify(suggestions),
        ]
      );

      const row = insertRes.rows[0];
      if (row) {
        diagId = row.id;
        createdAt = row.created_at;
      }
    } catch {
      // 게스트 유저이거나 DB 쓰기 경합 시에도 진단 결과는 정상 반환
    }

    return {
      id: diagId,
      userId: userId || '00000000-0000-0000-0000-000000000000',
      prIndex,
      riskLevel,
      assetSummary,
      diagnosticNotes: notes,
      rebalanceSuggestions: suggestions,
      createdAt,
    };
  }

  async askDeoki(userId: string, question: string): Promise<{ answer: string; tips: string[] }> {
    const trimmed = question.trim().toLowerCase();
    const diagnosis = await this.diagnoseUserPortfolio(userId);

    const tips: string[] = [
      '14일 가상 주식 챔피언십 리그에서 상위 1% 고래 포트폴리오를 1클릭 복제할 수 있어요.',
      '심야 23:00 비밀 암시장에서 거래세 영구 면제 카드를 노려보세요.',
      '현금 비중이 20% 이하로 떨어지면 시장 급락 시 물타기를 할 수 없으니 주의하세요.',
    ];

    let answer = `꽥! 덕이가 분석해 드릴게요!\n\n현재 주인님의 포트폴리오 안전 점수(PR-Index)는 **${diagnosis.prIndex}점 / 100점**이에요.\n`;

    if (trimmed.includes('추천') || trimmed.includes('종목') || trimmed.includes('주식')) {
      answer += `현재 자산 중 주식 비중은 **${Math.round((diagnosis.assetSummary.stocks / diagnosis.assetSummary.total) * 100)}%**예요. `;
      if (diagnosis.assetSummary.topStockSymbol) {
        answer += `가장 많이 보유하신 종목은 [${diagnosis.assetSummary.topStockSymbol}](${diagnosis.assetSummary.topStockRatio}%)입니다. `;
      }
      answer += `\n실전 챔피언십 리그의 수익률 상위 1% 고래 트레이더들을 카피 트레이딩하시면 검증된 포트폴리오를 1초 만에 따라갈 수 있어요!`;
    } else if (trimmed.includes('위험') || trimmed.includes('리스크') || trimmed.includes('안전')) {
      answer += `현재 리스크 등급은 **[${diagnosis.riskLevel}]** 수준입니다.\n`;
      if (diagnosis.riskLevel === 'CRITICAL' || diagnosis.riskLevel === 'HIGH') {
        answer += `경고! 단일 자산 몰빵 비중이 높아 시장 변동에 매우 취약해요. 즉시 20% 이상의 현금을 확보하고 국채를 편입하세요!`;
      } else {
        answer += `안정적으로 관리되고 있어요! 매시간 지급되는 국채 쿠폰 이자와 정기 복리 예금을 병행하시면 안전하게 자산이 우상향합니다.`;
      }
    } else if (trimmed.includes('세금') || trimmed.includes('절세') || trimmed.includes('수수료')) {
      answer += `주식 거래 시 0.15%의 증권거래세가 국고로 납부돼요. 매일 밤 23:00 심야 비밀 암시장에서 '국가지정 영구 거래세 면제 카드'를 낙찰받으시면 평생 세금 0원으로 매매하실 수 있어요!`;
    } else {
      answer += `총 자산은 **${diagnosis.assetSummary.total.toLocaleString()} WLD** (현금 ${diagnosis.assetSummary.cash.toLocaleString()} WLD, 주식 ${diagnosis.assetSummary.stocks.toLocaleString()} WLD)입니다.\n\n`;
      answer += diagnosis.diagnosticNotes.join('\n');
    }

    return { answer, tips };
  }
}
