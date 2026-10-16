import type { BlogCategory, BlogPost, BlogTranslation } from './blog.types';

export const COUNTRY_EDITION_TOPICS = ['compound', 'tax', 'etf', 'loan', 'inflation', 'retirement'] as const;
export type CountryBlogTopic = (typeof COUNTRY_EDITION_TOPICS)[number];
type Region = 'ko' | 'en' | 'ja' | 'zh';

type Edition = {
  title: string;
  excerpt: string;
  question: string;
  method: string;
  workedExample: string;
  pitfalls: string;
  check: string;
  source: string;
  sourceName: string;
  tags: string[];
};

type Topic = {
  category: BlogCategory;
  calculatorHref: string;
  calculatorName: string;
  editions: Record<Region, Edition>;
};

// Every country edition is written independently around its own institutions and reader task.
// There is deliberately no invented rate, invented study, live-data label or legal eligibility promise.
const TOPICS: Record<CountryBlogTopic, Topic> = {
  compound: {
    category: 'COMPOUND', calculatorHref: '/tools/compound-calculator', calculatorName: '복리 계산기',
    editions: {
      ko: {
        title: '한국에서 복리 저축 계획 세우기: 납입 주기와 청년도약계좌 확인',
        excerpt: '원금, 월 납입액, 복리 주기를 구분하고 청년도약계좌의 현재 자격과 조건을 별도로 확인하는 실용적인 저축 계획.',
        question: '한국 거주자가 매월 저축을 시작할 때 원금과 이자를 어떻게 분리해 비교할 수 있을까요?',
        method: '복리는 이자가 다음 계산 기간의 원금에 합쳐지는 구조입니다. 월 납입액은 일시납과 결과가 다르므로 연 이율만 비교하지 말고 납입 시점, 이자 계산 주기, 세후 수령액을 따로 기록합니다.',
        workedExample: '예를 들어 월 10만 원을 12개월 납입할 때 납입 원금은 120만 원입니다. 이자는 각 납입분이 실제 예치된 기간에 따라 달라집니다. 계산기에는 납입일과 이자 주기, 수수료를 반영하고 결과를 예시로만 봅니다.',
        pitfalls: '청년도약계좌 등 정책 상품은 가입 자격·소득 요건·은행별 우대금리·정부 기여금이 수시로 바뀔 수 있습니다. 특정 만기 금액이나 정부 지원액을 확정 수익처럼 제시해서는 안 됩니다.',
        check: '가입 전 서민금융진흥원과 취급 은행의 최신 공시를 읽고, 중도해지 조건과 예금자보호 적용 여부를 확인하세요.',
        source: 'https://www.kinfa.or.kr/', sourceName: '서민금융진흥원',
        tags: ['복리', '월저축', '청년도약계좌', '저축계획'],
      },
      en: {
        title: 'United States compounding guide: compare monthly savings and IRA rules',
        excerpt: 'A US-focused guide to savings contributions, compounding frequency, and checking current IRA eligibility without claiming guaranteed returns.',
        question: 'How should a saver in the United States compare monthly contributions with an account that compounds interest?',
        method: 'Separate deposits from interest. The annual percentage yield (APY) incorporates compounding, while a nominal rate alone may not. Compare the same holding period, contribution schedule, and applicable account fees before judging two offers.',
        workedExample: 'Suppose you contribute $100 each month for twelve months. Your contributions total $1,200, but each deposit earns interest for a different length of time. Change the compounding frequency and deposit date in a calculator to understand that difference.',
        pitfalls: 'An IRA is not automatically a savings account and does not guarantee a return. Traditional and Roth IRA contribution and deduction rules depend on tax year, income and filing circumstances; do not assume eligibility from a headline.',
        check: 'Read the current IRS IRA guidance, identify whether the example is an insured deposit or a market investment, and compare after-fee results rather than a promised doubling date.',
        source: 'https://www.irs.gov/retirement-plans/individual-retirement-arrangements-iras', sourceName: 'Internal Revenue Service',
        tags: ['compound interest', 'APY', 'monthly savings', 'IRA'],
      },
      ja: {
        title: '日本の積立と複利を比較する：新NISAと預金の違い',
        excerpt: '日本の家計向けに毎月の積立、複利計算、新NISAの非課税制度を区別して確認するための教育ガイド。',
        question: '日本で毎月積立を始める場合、銀行預金と新NISAで運用する投資信託をどう比較すればよいでしょうか。',
        method: '最初に元本と運用損益を分けます。預金の利息計算と投資信託の基準価額変動は同じ仕組みではありません。毎月の積立日、運用期間、管理費用を揃えて比較し、複利を保証利回りと混同しないことが重要です。',
        workedExample: '毎月1万円を12か月積み立てた場合、拠出元本は12万円です。各回の積立が運用される期間は異なります。利回りを仮定した試算と実際の値動きによる結果を区別し、損失が発生する場合も検討してください。',
        pitfalls: '新NISAは非課税制度であり、元本保証の商品ではありません。対象商品、非課税保有限度額、口座手続きや課税上の条件は金融庁などの最新案内を確認する必要があります。',
        check: '家計の生活防衛資金を先に確認し、金融庁のNISA案内と金融機関の手数料説明を照合したうえで無理のない積立額を決めましょう。',
        source: 'https://www.fsa.go.jp/policy/nisa2/', sourceName: '金融庁 NISA',
        tags: ['複利', '新NISA', '積立投資', '預金'],
      },
      zh: {
        title: '中国家庭复利储蓄入门：定期存款与每月积累如何比较',
        excerpt: '面向中国家庭的本金、计息周期、存款保障及理财风险区分指南，不使用过期利率宣传。',
        question: '中国家庭准备每月存下一笔钱时，怎样理解复利和定期存款的实际收益？',
        method: '先区分本金、存入日期、计息方式与到期时间。不同产品可能采用单利、复利或不同付息安排，不能仅凭宣传的年化数字比较。应当结合合同、提前支取规则和真实到账金额判断。',
        workedExample: '假设每月存入100元，连续12个月累计存入本金1200元。由于每次存款的存续时间不同，利息不能直接用1200元乘以全年利率估算。应分别计算每笔资金实际存续时间。',
        pitfalls: '银行存款与净值型理财、基金投资的风险并不相同。不要把历史收益、模拟年化收益或营销示例写成保本承诺，也不能把其他国家的税收优惠直接套用到中国居民。',
        check: '核对银行正式产品说明、存款保险适用范围及监管部门公开提示，并保存产品费率和到期规则的查询日期。',
        source: 'https://www.pbc.gov.cn/', sourceName: '中国人民银行',
        tags: ['复利', '定期存款', '家庭储蓄', '利息计算'],
      },
    },
  },
  tax: {
    category: 'TAX', calculatorHref: '/tools/dividend-tax-calculator', calculatorName: '배당세 계산기',
    editions: {
      ko: { title: '한국 배당 투자자의 세금 점검: ISA와 일반 계좌 비교', excerpt: '한국 계좌 유형에 따른 배당 과세와 손익통산을 이해하고 최신 과세 요건을 확인하는 체크리스트.', question: '한국에서 받은 배당금은 투자 계좌 유형에 따라 어떻게 처리될까요?', method: '계좌별 과세 방식과 실제 세후 금액을 분리해 보세요. 일반 계좌의 원천징수와 ISA의 비과세·분리과세 요건은 동일하지 않으며, 금융소득 종합과세 대상 여부도 따로 확인해야 합니다.', workedExample: '같은 배당 수익을 가정하더라도 어떤 계좌에서 보유했는지, 투자 상품이 해당 계좌에 적격한지에 따라 결과가 달라집니다. 계산에는 과세 대상 수익과 비과세 한도를 별도 변수로 두세요.', pitfalls: '세율과 한도는 적용 연도 및 개인 상황에 따라 달라지므로 특정 절세 금액을 모두에게 보장할 수 없습니다.', check: '국세청의 세금 안내와 금융기관 ISA 상품 설명서를 함께 확인하고 적용 연도를 기록하세요.', source: 'https://www.nts.go.kr/', sourceName: '국세청', tags: ['배당소득세', 'ISA', '손익통산', '세후수익'] },
      en: { title: 'US dividend taxes: taxable brokerage versus retirement accounts', excerpt: 'Understand US dividend classifications and why tax treatment differs by account and filing circumstances.', question: 'Why might two investors in the United States owe different tax on the same nominal dividend?', method: 'Start by distinguishing qualified and ordinary dividends, then identify whether the holdings are in a taxable brokerage account or a tax-advantaged retirement account. Review the relevant IRS form instructions rather than applying a single rate.', workedExample: 'If two portfolios each receive a $100 dividend, the tax outcome can still differ because holding period, income, filing status and account wrapper matter. A gross return comparison is not a reliable after-tax comparison.', pitfalls: 'An IRA may defer or alter taxation but can involve withdrawal restrictions and penalties. No account guarantees performance or universal tax exemption.', check: 'Check the IRS dividend instructions for the applicable tax year and consult a qualified professional where individual circumstances are complex.', source: 'https://www.irs.gov/taxtopics/tc404', sourceName: 'IRS Topic 404', tags: ['US dividends', 'qualified dividends', 'brokerage', 'IRA tax'] },
      ja: { title: '日本の配当課税を整理する：特定口座とNISA', excerpt: '日本の投資家向けに口座区分、配当の受取方法、NISA適用条件を確認する税制教育記事。', question: '日本で同じ配当金を受け取っても口座区分で税務上の扱いが変わるのはなぜでしょうか。', method: '特定口座とNISA口座では制度が異なります。上場株式等の配当金の受取方式や損益通算の扱いについて、口座開設時の設定を確認してください。', workedExample: '年間の配当額が同じでも、保有口座と受取方式が異なる場合には手取りの見え方が変わります。税引前の配当利回りと実際の受取額を分けて試算しましょう。', pitfalls: 'NISAで買えばすべての配当が無条件に非課税になると断定するのは誤りです。受取方式や制度対象の条件を確認する必要があります。', check: '国税庁・金融庁の最新資料と証券会社の受取設定を確認し、投資年と課税年を混同しないでください。', source: 'https://www.nta.go.jp/', sourceName: '国税庁', tags: ['配当課税', '特定口座', 'NISA', '税引後利回り'] },
      zh: { title: '中国投资者如何理解股息税与持有期限', excerpt: '区分中国境内股票分红、账户与持有期限规则，避免套用境外税率。', question: '中国境内股票分红的税务处理为什么不能直接参考美国或韩国的案例？', method: '先确定证券市场、纳税人身份、股票类型及适用规定。境内上市公司股息红利的税务规则可能与持有期限相关，不能简单用海外文章中的固定比例替代。', workedExample: '两名投资者获得同样金额的现金分红，如果适用证券范围、持有期限或税务身份不同，最终处理可能不同。先记录交易与分红日期，再根据当期正式规定计算。', pitfalls: '不要以“免税诀窍”作为收益承诺，也不要把虚拟游戏资产 WLD 与真实人民币证券税负相混淆。', check: '查阅国家税务总局和证券交易所的最新公告，必要时向持牌机构咨询适用规则。', source: 'https://www.chinatax.gov.cn/', sourceName: '国家税务总局', tags: ['股息红利', '持有期限', '证券税收', '中国投资'] },
    },
  },
  etf: {
    category: 'STOCKS', calculatorHref: '/tools/stock-calculator', calculatorName: '주식 계산기',
    editions: {
      ko: { title: '한국 ETF 입문: KOSPI 추종과 총보수 비교', excerpt: '국내 상장 ETF의 추종지수, 총보수, 추적 오차를 비교하는 첫 투자 교육.', question: 'KOSPI를 추종하는 두 ETF는 왜 같은 수익률을 내지 않을까요?', method: '추종지수와 복제 방식이 같아도 보수, 현금 운용, 거래 비용과 추적 오차가 다를 수 있습니다. 먼저 운용보고서와 기초지수 방법론을 확인하세요.', workedExample: '동일한 지수를 추종하는 상품 두 개를 가정하고 지수 대비 성과 차이, 매매 스프레드와 거래량을 나란히 비교해 보세요. 비교 기간을 서로 맞춰야 합니다.', pitfalls: '상장 ETF는 예금이 아니며 원금 손실 가능성이 있습니다. 유동성이 낮은 상품은 호가 차이로 실제 매매 결과가 달라집니다.', check: '거래소의 상품 정보와 운용사의 최신 투자설명서를 읽고 레버리지·인버스 여부도 확인하세요.', source: 'https://www.krx.co.kr/', sourceName: '한국거래소', tags: ['국내ETF', 'KOSPI', '추적오차', '총보수'] },
      en: { title: 'US ETF comparison: expense ratios, tracking error, and spreads', excerpt: 'Compare US-listed ETFs with a focus on SEC disclosures, index exposure and trading costs.', question: 'What should a United States investor inspect beyond the headline ETF return?', method: 'Read the fund prospectus and understand its index or active mandate. Expense ratio, tracking difference, bid-ask spread and concentration all influence the result for a real investor.', workedExample: 'Compare two hypothetical US equity ETFs with identical gross market exposure. A lower management fee may help, but a wide trading spread can matter to a frequent trader. Separate the two effects.', pitfalls: 'Past performance is not a prediction, and ETF share prices may trade away from net asset value. Leveraged products carry additional risks.', check: 'Verify the prospectus and risk disclosures at the SEC and review the product issuer’s current cost information.', source: 'https://www.investor.gov/introduction-investing/investing-basics/investment-products/exchange-traded-funds-etfs', sourceName: 'SEC Investor.gov', tags: ['US ETF', 'expense ratio', 'tracking error', 'spreads'] },
      ja: { title: '日本のETF選び：TOPIX連動と売買コスト', excerpt: '東証上場ETFの指数、信託報酬、出来高、売買価格を比較する基礎ガイド。', question: '日本のTOPIX連動ETFを選ぶとき、指数以外にどのような情報が必要でしょうか。', method: '信託報酬、売買単位、出来高、流動性と指数との差を確認しましょう。投資信託とETFでは取引の仕組みも異なるため、取引時間と価格形成を理解することが大切です。', workedExample: '同じ指数を目指す二つの仮想ETFについて、年間の管理コストと購入時のスプレッドを分けて記録します。過去の成績だけでは実際の取引費用は把握できません。', pitfalls: '指数連動型であっても値下がりや為替変動が生じる場合があります。NISA対象かどうかは個別銘柄と適用年度で確認してください。', check: '日本取引所グループのETF情報と運用会社の交付目論見書を確認し、商品の仕組みを理解してから比較します。', source: 'https://www.jpx.co.jp/equities/products/etfs/', sourceName: '日本取引所グループ', tags: ['日本ETF', 'TOPIX', '信託報酬', '東証'] },
      zh: { title: '中国ETF基础：沪深指数、费用与跟踪误差', excerpt: '从中国市场角度理解ETF标的指数、基金费率、成交与跟踪误差。', question: '在中国市场选择跟踪沪深指数的ETF时，应该先看哪些指标？', method: '先阅读基金招募说明书，确认跟踪标的、成份集中度、管理费与托管费。再观察成交量、买卖价差与跟踪偏离情况，避免只以短期涨幅挑选。', workedExample: '假设两只ETF都跟踪同一指数，投资者应当对比费用、跟踪效果与实际交易价格。相同的指数名称不意味着在不同买入时间获得相同收益。', pitfalls: 'ETF净值会随市场波动，跨境ETF还可能涉及汇率或交易安排的额外风险。请勿将指数产品视为保本存款。', check: '以中国证券监督管理委员会、交易所与基金公司的正式披露为准，核对适用的交易规则。', source: 'https://www.sse.com.cn/assortment/fund/etf/', sourceName: '上海证券交易所', tags: ['中国ETF', '沪深指数', '跟踪误差', '基金费率'] },
    },
  },
  loan: {
    category: 'WEALTH', calculatorHref: '/tools/loan-interest-calculator', calculatorName: '대출이자 계산기',
    editions: {
      ko: { title: '한국 대출 상환표 읽기: DSR과 원리금 계산', excerpt: '한국 가계대출의 DSR 개념과 고정·변동금리 및 상환 일정을 살펴보는 안내.', question: '한국에서 대출을 비교할 때 단순 광고 금리만 보면 무엇을 놓칠까요?', method: '대출 원금, 금리 적용 방식, 만기, 거치 여부와 상환 방법을 확인합니다. DSR은 소득 대비 연간 원리금 상환 부담을 보는 지표이며 개별 심사 기준과 다를 수 있습니다.', workedExample: '가상의 대출에서 원리금균등과 원금균등 방식을 같은 만기·금리로 비교하면 초기 월 납입액과 총이자 규모가 달라질 수 있음을 확인할 수 있습니다.', pitfalls: '변동금리의 미래 경로나 대출 승인 여부를 확정적으로 예측하지 마세요. 중도상환 수수료와 보증 비용도 함께 계산해야 합니다.', check: '금융감독원의 대출 관련 소비자 안내와 실제 상품 약관에서 적용 조건을 확인하세요.', source: 'https://www.fss.or.kr/', sourceName: '금융감독원', tags: ['대출이자', 'DSR', '원리금균등', '한국대출'] },
      en: { title: 'US mortgage math: APR versus interest rate and amortization', excerpt: 'A US homeowner’s guide to comparing mortgage APR, fixed and adjustable loans, and total repayment.', question: 'Why can two United States mortgage offers share an interest rate but have different total borrowing costs?', method: 'Compare the Loan Estimate, APR, points, closing costs and whether the rate is fixed or adjustable. APR is designed to express broader borrowing cost, but the payment schedule must also be checked.', workedExample: 'On a hypothetical fixed-rate mortgage, earlier payments devote more to interest than later payments. Use an amortization table to test how an extra principal payment changes both total interest and maturity.', pitfalls: 'An adjustable-rate mortgage can reset. Never infer a guaranteed future rate from a teaser period, and budget for insurance and property taxes separately where appropriate.', check: 'Use the CFPB mortgage resources and lender Loan Estimates, comparing the same loan amount and term.', source: 'https://www.consumerfinance.gov/owning-a-home/', sourceName: 'Consumer Financial Protection Bureau', tags: ['US mortgage', 'APR', 'amortization', 'CFPB'] },
      ja: { title: '日本の住宅ローン：変動金利と返済計画の確認点', excerpt: '日本の住宅ローンを元利均等・元金均等、固定・変動金利から整理するための入門記事。', question: '日本で住宅ローンを選ぶとき、毎月の返済額以外にどのようなリスクがありますか。', method: '借入額、返済期間、金利種類、保証料と繰上返済の条件を比較します。元利均等返済と元金均等返済では返済額の推移や利息総額が異なります。', workedExample: '同じ借入元本について、金利が変わらない仮定と見直される仮定で二つの返済表を作ります。毎月の家計に余裕が残るかも確認してください。', pitfalls: '変動金利の商品ルールは金融機関によって異なります。広告の最優遇金利を誰でも利用できると考えたり、住宅ローン控除を無条件に期待したりしないでください。', check: '金融庁の利用者向け情報と金融機関の最新約款を読み、金利見直しと諸費用の条件を確認しましょう。', source: 'https://www.fsa.go.jp/', sourceName: '金融庁', tags: ['住宅ローン', '変動金利', '返済計画', '繰上返済'] },
      zh: { title: '中国房贷计算：LPR、等额本息和等额本金', excerpt: '中国家庭比较房贷报价和还款方式时，理解LPR与合同重定价条款。', question: '中国家庭为什么需要在房贷比较中区分LPR与实际执行利率？', method: '贷款市场报价利率LPR并不等于每个人的实际贷款利率。应同时核对加点安排、重新定价日期、贷款期限以及等额本息或等额本金的还款方式。', workedExample: '对同一笔假设贷款分别绘制两种还款表，观察每月本金和利息的结构。在变动利率情景下还需要估算可能的月供变化，而非只看首月数字。', pitfalls: '不能把过去某天的LPR当作今天的报价。提前还款条款、审批要求及政策调整应以合同和官方通知为准。', check: '查阅中国人民银行LPR相关公开信息，逐项核实银行正式合同及还款计划。', source: 'https://www.pbc.gov.cn/', sourceName: '中国人民银行', tags: ['房贷', 'LPR', '等额本息', '等额本金'] },
    },
  },
  inflation: {
    category: 'MACRO', calculatorHref: '/tools/compound-calculator', calculatorName: '복리 계산기',
    editions: {
      ko: { title: '한국 물가 지표 읽기: CPI와 실질 구매력', excerpt: '통계청 소비자물가지수와 개인 지출 체감 물가가 다른 이유를 살펴봅니다.', question: '소비자물가 상승률이 낮아졌는데 생활비는 왜 여전히 높게 느껴질까요?', method: '물가상승률은 가격 수준의 변동률이지 물가가 원래 수준으로 돌아왔다는 뜻은 아닙니다. 소비 품목의 가중치와 가구별 지출 비중 차이도 함께 봐야 합니다.', workedExample: '예시로 물가 지수가 100에서 105로 오른 뒤 이듬해 107이 되었다면 상승 속도는 둔화해도 가격 수준은 이전보다 높습니다.', pitfalls: '국가 CPI와 개별 가구의 실제 장바구니는 다릅니다. 인플레이션 수치로 특정 투자 수익률을 보장하지 마세요.', check: '통계청 국가통계포털의 지표 기준 시점과 품목 구성을 확인해 가계 예산에 적용하세요.', source: 'https://kosis.kr/', sourceName: '국가통계포털', tags: ['한국CPI', '물가상승률', '실질구매력', '가계예산'] },
      en: { title: 'United States CPI: what inflation slowing actually means', excerpt: 'Use US BLS CPI definitions to distinguish falling inflation rates from falling prices.', question: 'If US inflation eases, why might a household still spend more on groceries?', method: 'The CPI measures changes in the prices of a representative basket. Slower year-over-year growth means prices rise less quickly; it does not imply every price falls back to its previous level.', workedExample: 'In a purely illustrative index, a level moving from 100 to 105 and then to 107 represents continued price growth even though the second increase is smaller. Compare nominal savings growth with inflation to understand purchasing power.', pitfalls: 'Individual families do not consume the same basket as the national US average. Treat CPI releases as dated statistics, not a live forecast or a personal cost-of-living guarantee.', check: 'Use the BLS release date, series definition and comparison period before citing a CPI statistic in public commentary.', source: 'https://www.bls.gov/cpi/', sourceName: 'Bureau of Labor Statistics', tags: ['US CPI', 'inflation', 'purchasing power', 'BLS'] },
      ja: { title: '日本の消費者物価指数：物価上昇率と家計負担', excerpt: '総務省統計局のCPIを使い、指数の動きと家計の実感を分けて考える解説。', question: '日本の物価上昇率が下がったとき、スーパーの支出も必ず減るのでしょうか。', method: '消費者物価指数は代表的な品目を一定の方法で集計したものです。上昇率の鈍化と価格水準の下落は異なります。食費や住居費の比率が異なる世帯では実感も変わります。', workedExample: '指数が仮に100から105になり、次の期間に107となったとします。後半の伸びは小さくても価格水準は最初より高いため、家計の支出がすぐに元に戻るとは限りません。', pitfalls: '全国平均を個別家計の支出にそのまま当てはめないでください。統計の前年同月比と前月比を混同すると説明を誤ります。', check: '総務省統計局の公表日、季節調整の有無、対象品目を確認してから物価に関する記事を書きましょう。', source: 'https://www.stat.go.jp/data/cpi/', sourceName: '総務省統計局', tags: ['日本CPI', '物価高', '家計支出', '総務省'] },
      zh: { title: '中国居民消费价格指数：CPI变化与家庭开支', excerpt: '结合国家统计局CPI定义，理解价格水平与通胀增速的区别。', question: '中国公布的CPI同比变化为什么不一定等于每个家庭的日常开支变化？', method: '居民消费价格指数使用一定的商品与服务类别统计价格变动。同比变化和环比变化基期不同，家庭实际消费结构也不一定与统计权重相同。', workedExample: '假设指数从100变为103，下一年又到104，即使价格上涨速度减缓，价格水平仍高于最初。整理家庭账本时应结合具体品类，而不是只用全国一个数字。', pitfalls: '统计指标不等于个人预算，也不能将某月数据未经时间标记写成实时最新消息。涉及市场判断时应披露数据发布时点。', check: '使用国家统计局公布的CPI定义与公报，记录统计月份及同比、环比的区别。', source: 'https://www.stats.gov.cn/', sourceName: '国家统计局', tags: ['中国CPI', '居民消费', '物价指数', '家庭预算'] },
    },
  },
  retirement: {
    category: 'WEALTH', calculatorHref: '/tools/pension-tax-calculator', calculatorName: '연금 계산기',
    editions: {
      ko: { title: '한국 노후 자금 계획: 국민연금과 개인연금 구분하기', excerpt: '국민연금 예상급여 확인과 개인 저축 목표를 구분해 현실적인 노후 현금흐름을 점검합니다.', question: '한국에서 은퇴 준비를 시작할 때 왜 국민연금과 개인연금을 분리해 계산해야 할까요?', method: '공적연금 예상수급액은 개인 가입 이력에 따라 달라지며, 개인연금은 자산 가격과 수수료, 인출 방식에 영향을 받습니다. 두 현금흐름의 지급 시점부터 구분하세요.', workedExample: '가상의 은퇴 계획에 월 생활비 목표를 먼저 적고 공적연금 예상액과 추가로 필요한 개인 저축액을 나눠 표시합니다. 현재 물가 기준인지 미래 명목 금액인지도 함께 기록합니다.', pitfalls: '연금 지급액과 세액공제 규모를 소득이나 가입조건 확인 없이 확정해선 안 됩니다. 예상 수익률은 실제 보장 수익이 아닙니다.', check: '국민연금공단의 예상연금 조회와 개인 연금계약의 수수료·수령 규정을 각각 확인하세요.', source: 'https://www.nps.or.kr/', sourceName: '국민연금공단', tags: ['국민연금', '개인연금', '노후자금', '은퇴계획'] },
      en: { title: 'US retirement planning: Social Security versus 401(k) savings', excerpt: 'Understand how US Social Security benefits and personal 401(k) investments differ in retirement cash flow.', question: 'What is the difference between an estimated US Social Security benefit and a 401(k) account balance?', method: 'Social Security eligibility and estimated benefits follow a public program based on an individual earnings record, while a workplace 401(k) is an account whose value and distribution depend on contributions, investments and plan rules.', workedExample: 'Build an illustrative retirement budget using a monthly spending target. Place your Social Security estimate in one column and possible withdrawals from savings in another, making sure both are expressed in the same year’s dollars.', pitfalls: 'Investment return assumptions are not guarantees. Claiming dates, tax rules, employer matches and withdrawal restrictions differ by person and plan.', check: 'Use the Social Security Administration benefit estimator and your plan disclosure. Revisit assumptions when earnings or plan rules change.', source: 'https://www.ssa.gov/myaccount/', sourceName: 'Social Security Administration', tags: ['Social Security', '401k', 'retirement budget', 'US savings'] },
      ja: { title: '日本の老後資金：公的年金とiDeCoを分けて考える', excerpt: 'ねんきん定期便とiDeCoの特徴を整理し、老後の受給時期と生活費の差を見積もる入門記事。', question: '日本で老後資金を検討する際、公的年金とiDeCoを同じ残高として扱ってはいけないのはなぜでしょうか。', method: '公的年金の受給見込みと、個人で積み立てて運用するiDeCoの資産残高は仕組みが異なります。受給開始時期、税制、手数料、運用リスクを別々に記録します。', workedExample: '毎月の生活費目標を設定し、ねんきんネットの見込額を一欄に、個人の積立資金からの取り崩しを別の欄に置いて考えます。物価が変わった場合の費用も検討してください。', pitfalls: 'iDeCoは一般の普通預金ではなく、商品により元本割れの可能性があります。掛金や受給条件は加入者の属性によって異なります。', check: '日本年金機構の年金記録とiDeCo公式サイトの加入資格や運用商品の説明をそれぞれ確認しましょう。', source: 'https://www.nenkin.go.jp/', sourceName: '日本年金機構', tags: ['公的年金', 'iDeCo', '老後資金', 'ねんきんネット'] },
      zh: { title: '中国养老规划：基本养老保险与个人储蓄分开估算', excerpt: '从中国居民养老保障出发，区分基本养老保险、个人养老金与长期储蓄。', question: '中国家庭为什么应当分别规划基本养老保险待遇和个人长期储蓄？', method: '基本养老保险与个人养老金、普通储蓄产品具有不同的制度与风险结构。估算退休资金时，应区分参保缴费情况、可能的养老金待遇与个人账户的实际资产。', workedExample: '先列出每月退休支出目标，再将依法可查询的养老保险记录和个人储蓄情况分开计算。不要把模拟收益或预估待遇直接视为现在已到账的资金。', pitfalls: '地区政策、参保身份、领取条件与产品性质可能不同。不要未经核实宣传“保证领取”或一律适用的税收优惠。', check: '通过人力资源社会保障部门的官方渠道核实参保和待遇政策，再参考机构公布的个人养老金产品材料。', source: 'https://www.mohrss.gov.cn/', sourceName: '人力资源和社会保障部', tags: ['基本养老保险', '个人养老金', '退休规划', '中国家庭'] },
    },
  },
};

const EDITORIAL_HEADERS: Record<Region, { question: string; method: string; example: string; risk: string; action: string; sources: string; note: string }> = {
  ko: { question: '이 글이 다루는 질문', method: '원리를 먼저 이해하기', example: '계산 예시와 적용 방법', risk: '주의해야 할 오해', action: '실제로 확인할 자료', sources: '공식 참고 자료', note: '금융 교육 목적의 예시입니다. 특정 수익이나 세제 혜택을 보장하지 않습니다. 적용 시점과 개인 요건을 공식 자료에서 확인하세요.' },
  en: { question: 'The US reader’s question', method: 'How the mechanism works', example: 'A practical example', risk: 'What this does not promise', action: 'Verify before taking action', sources: 'Primary public reference', note: 'Educational context only. This is not an investment recommendation, a live market report, personalized tax advice or a guaranteed outcome. Check current rules and your circumstances before acting.' },
  ja: { question: '日本の読者が確認したいこと', method: '仕組みを理解する', example: '具体的な計算例', risk: '誤解しやすい点', action: '行動前の確認事項', sources: '公的な参考資料', note: 'この記事は金融教育を目的とした一般情報です。最新の金利や制度の適用、運用成果を保証するものではありません。各自の条件と公的な最新資料を確認してください。' },
  zh: { question: '中国读者需要解决的问题', method: '先理解基本机制', example: '用示例核对计算', risk: '常见误区及风险', action: '行动前的核实清单', sources: '官方参考资料', note: '本文仅用于金融知识普及，示例不代表实时行情、个性化税务建议或保本收益承诺。相关制度与产品条款可能调整，请以官方最新公布信息及个人情况为准。' },
};

function localizedArticle(edition: Edition, locale: Region): string {
  const headings = EDITORIAL_HEADERS[locale];
  return `## ${headings.question}\n\n${edition.question}\n\n## ${headings.method}\n\n${edition.method}\n\n## ${headings.example}\n\n${edition.workedExample}\n\n## ${headings.risk}\n\n${edition.pitfalls}\n\n## ${headings.action}\n\n${edition.check}\n\n## ${headings.sources}\n\n${edition.sourceName}: ${edition.source}\n\n${headings.note}`;
}

export function createCountryBlogPost(topic: CountryBlogTopic): BlogPost {
  const definition = TOPICS[topic];
  const date = new Date('2026-10-15T14:00:00.000Z');
  const translations = Object.fromEntries(
    (['en', 'ja', 'zh'] as const).map((locale) => {
      const edition = definition.editions[locale];
      return [locale, {
        title: edition.title, excerpt: edition.excerpt,
        content: localizedArticle(edition, locale), tags: edition.tags,
      } satisfies BlogTranslation];
    }),
  ) as NonNullable<BlogPost['translations']>;
  return {
    slug: `country-guide-${topic}`,
    title: definition.editions.ko.title,
    excerpt: definition.editions.ko.excerpt,
    content: localizedArticle(definition.editions.ko, 'ko'),
    category: definition.category,
    categoryLabel: { COMPOUND: '복리 & 저축', TAX: '세금 & 제도', STOCKS: 'ETF & 주식', WEALTH: '자산 설계', MACRO: '거시 경제' }[definition.category],
    author: { name: '월덕 금융 교육 편집팀', role: '공식 자료 기반 금융 교육', badge: 'Editorial' },
    publishedAt: date.toISOString(), updatedAt: date.toISOString(), readTimeMinutes: 4,
    tags: definition.editions.ko.tags,
    relatedCalculatorHref: definition.calculatorHref, relatedCalculatorName: definition.calculatorName,
    isAiGenerated: false, views: 0, translations,
  };
}
