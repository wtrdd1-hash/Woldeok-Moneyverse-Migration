export interface PortfolioHoldingInput {
  readonly stock_id: string;
  readonly symbol: string;
  readonly name: string;
  readonly quantity: string;
  readonly average_cost: string;
  readonly market_value: string;
  readonly current_price: string;
}

export interface PortfolioHoldingAnalysis extends PortfolioHoldingInput {
  readonly cost_basis: string;
  readonly unrealized_gain_loss: string;
  readonly allocation_bps: string;
}

export interface PortfolioAnalysis {
  readonly total_market_value: string;
  readonly total_cost_basis: string;
  readonly total_unrealized_gain_loss: string;
  readonly holdings: readonly PortfolioHoldingAnalysis[];
}

const INTEGER_TEXT = /^\d+$/;
const BPS = 10_000n;

function amount(value: string, field: string): bigint {
  if (!INTEGER_TEXT.test(value)) throw new Error(`${field} must be a non-negative integer string`);
  return BigInt(value);
}

export function analyzePortfolio(rows: readonly PortfolioHoldingInput[]): PortfolioAnalysis {
  const prepared = rows.map((row) => {
    const quantity = amount(row.quantity, 'quantity');
    const averageCost = amount(row.average_cost, 'average_cost');
    const marketValue = amount(row.market_value, 'market_value');
    const costBasis = quantity * averageCost;
    return { row, marketValue, costBasis, gainLoss: marketValue - costBasis };
  });

  const totalMarketValue = prepared.reduce((sum, item) => sum + item.marketValue, 0n);
  const totalCostBasis = prepared.reduce((sum, item) => sum + item.costBasis, 0n);

  return {
    total_market_value: totalMarketValue.toString(),
    total_cost_basis: totalCostBasis.toString(),
    total_unrealized_gain_loss: (totalMarketValue - totalCostBasis).toString(),
    holdings: prepared
      .map(({ row, marketValue, costBasis, gainLoss }) => ({
        ...row,
        cost_basis: costBasis.toString(),
        unrealized_gain_loss: gainLoss.toString(),
        allocation_bps: totalMarketValue === 0n ? '0' : ((marketValue * BPS) / totalMarketValue).toString(),
      }))
      .sort((a, b) => {
        const left = BigInt(a.market_value);
        const right = BigInt(b.market_value);
        return left === right ? a.symbol.localeCompare(b.symbol) : left > right ? -1 : 1;
      }),
  };
}
