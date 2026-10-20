/**
 * Reviewed, deliberately short native-language finance copy. All illustrative
 * loans are in KRW and must not be confused with live lender quotations.
 */
export const LOAN_LOCALES = {
  en: {
    title: 'Loan Repayment Calculator — Monthly Payments & Total Interest',
    description: 'Calculate monthly payments and total interest for a loan in your selected currency. Compare fixed monthly payments, equal-principal payments and interest-only loans with a final balloon payment.',
    heading: 'Loan Repayment Calculator',
    lead: 'Compare three repayment methods using your loan amount, annual interest rate and term.',
    assumptions: 'Amounts use the selected country currency. Results are estimates, not lender offers. Fees, taxes and rate changes are excluded. Changing country resets the amount; it does not convert currencies.',
    amount: 'Loan amount', rate: 'Annual interest rate (%)', term: 'Loan term (years)',
    equalPayment: 'Fixed monthly payment', equalPrincipal: 'Equal principal payments', bullet: 'Interest-only, balloon at maturity',
    monthly: 'First monthly payment', last: 'Final monthly payment', totalInterest: 'Total interest', total: 'Total amount repaid',
    comparison: 'Compare total interest by method', years: 'years', won: 'KRW', result: 'Estimated repayment',
    country: 'Country and currency', guideTitle: 'How repayment methods differ',
    guide: 'With fixed monthly payments, principal and interest together stay roughly the same each month. With equal-principal repayment, payments generally decline over time. With interest-only repayment, principal is due at maturity.',
    cta: 'Explore more calculators',
  },
  ja: {
    title: 'ローン返済シミュレーター｜毎月の返済額と総利息を比較',
    description: '借入額・年利・返済期間から毎月の返済額と総利息を試算。元利均等返済・元金均等返済・満期一括返済を選択した通貨で比較できます。',
    heading: 'ローン返済シミュレーター',
    lead: '借入額・金利・返済期間を入力して、3つの返済方式を比較できます。',
    assumptions: '金額は選択した国の通貨で表示します。金融機関の見積もりではなく概算で、税金・手数料・金利変動は含みません。国を切り替えると借入額が初期値に戻り、為替換算は行いません。',
    amount: '借入金額', rate: '年利（%）', term: '返済期間（年）',
    equalPayment: '元利均等返済', equalPrincipal: '元金均等返済', bullet: '満期一括返済',
    monthly: '初回の返済額', last: '最終回の返済額', totalInterest: '支払利息の合計', total: '返済総額',
    comparison: '返済方式別・総利息の比較', years: '年', won: 'KRW', result: '返済額の試算結果',
    country: '国・通貨', guideTitle: '返済方式の違い',
    guide: '元利均等返済は毎月の元金と利息の合計がほぼ一定です。元金均等返済は返済が進むにつれて毎月の負担が軽くなります。満期一括返済では期間中に利息を払い、満期時に元金をまとめて返済します。',
    cta: 'ほかの計算ツールを見る',
  },
  zh: {
    title: '贷款还款计算器｜比较每月还款额与总利息',
    description: '输入贷款本金、年利率和期限，估算所选币种的月供及总利息。对比等额本息、等额本金和到期一次还本三种方式。',
    heading: '贷款还款计算器',
    lead: '输入贷款金额、年利率和期限，对比三种还款方式的成本。',
    assumptions: '金额以所选国家的货币显示，仅为计算示例，并非银行报价；不含手续费、税费及利率变化。切换国家时本金重置为示例值，不按汇率换算。',
    amount: '贷款本金', rate: '年利率（%）', term: '贷款期限（年）',
    equalPayment: '等额本息', equalPrincipal: '等额本金', bullet: '按月付息、到期还本',
    monthly: '首月还款额', last: '最后一期还款额', totalInterest: '总利息', total: '还款总额',
    comparison: '不同还款方式的总利息', years: '年', won: 'KRW', result: '预计还款结果',
    country: '国家及货币', guideTitle: '三种还款方式有什么区别？',
    guide: '等额本息的每月本金和利息之和基本固定；等额本金的月供通常逐月递减；到期一次还本则在期限内支付利息，并在到期时一次偿还本金。',
    cta: '查看更多计算工具',
  },
} as const;

export type LoanLocale = keyof typeof LOAN_LOCALES;

export function isLoanLocale(value: string): value is LoanLocale {
  return value === 'en' || value === 'ja' || value === 'zh';
}
