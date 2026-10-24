const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../frontend/src/app/tools/loan-interest-calculator/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// replace description & header subtitle
content = content.replace(
  '<span>2026년 최신 은행 기준 금리 완벽 반영</span>',
  "<span>{localeLabel(locale, '2026년 최신 은행 기준 금리 완벽 반영', '2026 Updated Benchmark Rate Engine', '2026年最新銀行基準金利反映', '2026最新基准利率计算', 'Cập nhật lãi suất chuẩn ngân hàng 2026')}</span>"
);

content = content.replace(
  `<p className="text-sm text-zinc-400 leading-relaxed">
            대출 금액, 연 금리, 상환 기간에 따른 월별 상환금액과 총 이자를 즉시 비교 계산합니다.
          </p>`,
  `<p className="text-sm text-zinc-400 leading-relaxed">
            {localeLabel(
              locale,
              '대출 금액, 연 금리, 상환 기간에 따른 월별 상환금액과 총 이자를 즉시 비교 계산합니다.',
              'Instantly calculate monthly repayments and total interest across principal, interest rates, and loan terms.',
              '借入元金、年利、返済期間に応じた毎月の返済額と総支払利息を瞬時に試算します。',
              '根据贷款金额、年利率和还款期限，即时测算各月还款额与累计总利息。',
              'Tính toán ngay lập tức khoản trả góp hàng tháng và tổng lãi suất theo số tiền vay và kỳ hạn.'
            )}
          </p>`
);

// replace 3 methods guide
content = content.replace(
  `            <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-400" />
              대출 상환 방식 3가지 핵심 비교
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-zinc-400">
              <div className="p-3.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                <span className="font-semibold text-zinc-200 block mb-1">1. 원리금균등상환</span>
                매달 납부하는 원금과 이자의 합계가 동일합니다. 매월 일정한 지출 예산 관리가 가능해 가장 많이 선택합니다.
              </div>
              <div className="p-3.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                <span className="font-semibold text-zinc-200 block mb-1">2. 원금균등상환</span>
                매달 원금을 똑같이 나누어 갚으므로, 시간이 지날수록 이자가 줄어듭니다. 총 대출 이자가 가장 적습니다.
              </div>
              <div className="p-3.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                <span className="font-semibold text-zinc-200 block mb-1">3. 만기일시상환</span>
                대출 기간 동안 이자만 납부하다 만기에 원금을 전액 상환합니다. 초기 부담은 적으나 총 이자가 가장 많습니다.
              </div>
            </div>`,
  `            <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-400" />
              {localeLabel(locale, '대출 상환 방식 3가지 핵심 비교', '3 Core Loan Repayment Methods Compared', 'ローン返済方式3大比較', '三大主流还款方式核心对比', 'So sánh 3 phương thức trả góp chính')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-zinc-400">
              <div className="p-3.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                <span className="font-semibold text-zinc-200 block mb-1">
                  {localeLabel(locale, '1. 원리금균등상환', '1. Equal Amortization', '1. 元利均等返済', '1. 等额本息还款', '1. Gốc & Lãi đều')}
                </span>
                {localeLabel(
                  locale,
                  '매달 납부하는 원금과 이자의 합계가 동일합니다. 매월 일정한 지출 예산 관리가 가능해 가장 많이 선택합니다.',
                  'Monthly total payment remains identical. Best for predictable budgeting with steady monthly outlays.',
                  '毎月の返済総額（元金＋利息）が一定です。家計管理がしやすく最も広く利用されています。',
                  '每月偿还本息总额固定不变。便于规划日常收支预算，受众最广。',
                  'Tổng số tiền trả góp hàng tháng cố định, giúp quản lý chi tiêu dễ dàng.'
                )}
              </div>
              <div className="p-3.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                <span className="font-semibold text-zinc-200 block mb-1">
                  {localeLabel(locale, '2. 원금균등상환', '2. Equal Principal', '2. 元金均等返済', '2. 等额本金还款', '2. Gốc đều giảm dần')}
                </span>
                {localeLabel(
                  locale,
                  '매달 원금을 똑같이 나누어 갚으므로, 시간이 지날수록 이자가 줄어듭니다. 총 대출 이자가 가장 적습니다.',
                  'Principal is repaid evenly each month, causing interest to decline over time. Results in lowest total interest.',
                  '元金を均等に返済するため、利息は毎月減少します。総支払利息を最も抑えられます。',
                  '每月偿还相同数额本金，利息随本金减少递减。累计总利息支出最低。',
                  'Tiền gốc được chia đều trả mỗi tháng, tiền lãi giảm dần theo thời gian. Tổng lãi vay thấp nhất.'
                )}
              </div>
              <div className="p-3.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                <span className="font-semibold text-zinc-200 block mb-1">
                  {localeLabel(locale, '3. 만기일시상환', '3. Balloon / Interest-Only', '3. 期日一括返済', '3. 先息后本还款', '3. Trả lãi định kỳ, gốc cuối kỳ')}
                </span>
                {localeLabel(
                  locale,
                  '대출 기간 동안 이자만 납부하다 만기에 원금을 전액 상환합니다. 초기 부담은 적으나 총 이자가 가장 많습니다.',
                  'Pay only interest during the term, repaying full principal upon maturity. Low initial cost but highest cumulative interest.',
                  '期間中は利息のみを支払い、満期時に元金を一括返済します。初期負担は軽いですが総利息は最大となります。',
                  '借款期间仅按期付息，到期一次性偿还全部本金。前期压力小但总利息最高。',
                  'Trong kỳ chỉ trả lãi, đến hạn thanh toán toàn bộ tiền gốc. Chi phí ban đầu thấp nhưng tổng lãi cao nhất.'
                )}
              </div>
            </div>`
);

// replace FAQ section
content = content.replace(
  `            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              자주 묻는 질문 (FAQ)
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-semibold text-zinc-200 mb-1">Q. 주택담보대출 이자 소득공제 혜택은 어떻게 되나요?</h4>
                <p className="text-zinc-400 leading-relaxed">
                  무주택 또는 1주택 세대주가 취득 당시 기준시가 6억원 이하의 주택을 구입하기 위해 만기 15년 이상의 장기주택저당차입금을 이용하는 경우, 상환 방식에 따라 연간 최대 2,000만원 한도로 이자 상환액 전액을 근로소득에서 공제받을 수 있습니다.
                </p>
              </div>
              <div className="pt-3 border-t border-zinc-800">
                <h4 className="font-semibold text-zinc-200 mb-1">Q. 금리인하요구권은 언제 신청할 수 있나요?</h4>
                <p className="text-zinc-400 leading-relaxed">
                  취업, 승진, 급여 인상, 신용점수 상승, 부채 감소 등 신용 상태가 개선된 경우 은행에 언제든 금리 인하를 요구할 수 있습니다.
                </p>
              </div>
            </div>`,
  `            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              {localeLabel(locale, '자주 묻는 질문 (FAQ)', 'Frequently Asked Questions (FAQ)', 'よくある質問 (FAQ)', '常见问题 (FAQ)', 'Câu hỏi thường gặp (FAQ)')}
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-semibold text-zinc-200 mb-1">
                  {localeLabel(
                    locale,
                    'Q. 주택담보대출 이자 소득공제 혜택은 어떻게 되나요?',
                    'Q. How does the mortgage interest tax deduction work?',
                    'Q. 住宅ローン利息控除（減税）の仕組みは？',
                    'Q. 房贷利息税前专项扣除政策是什么？',
                    'Q. Chính sách giảm trừ thuế đối với lãi vay mua nhà như thế nào?'
                  )}
                </h4>
                <p className="text-zinc-400 leading-relaxed">
                  {localeLabel(
                    locale,
                    '무주택 또는 1주택 세대주가 취득 당시 기준시가 6억원 이하의 주택을 구입하기 위해 만기 15년 이상의 장기주택저당차입금을 이용하는 경우, 상환 방식에 따라 연간 최대 2,000만원 한도로 이자 상환액 전액을 근로소득에서 공제받을 수 있습니다.',
                    'Eligible homeowners with long-term mortgages over 15 years may qualify for annual income tax deductions up to statutory caps on interest paid.',
                    '一定要件を満たす長期住宅ローンを組んでいる場合、年間支払利息に応じて所得税控除を受けることができます。',
                    '符合特定条件的长期住房按揭贷款借款人，可在个人所得税申报中按规定享受利息专项附加扣除。',
                    'Người vay mua nhà dài hạn đáp ứng các tiêu chuẩn có thể được hưởng chính sách khấu trừ thuế trên số tiền lãi đã trả.'
                  )}
                </p>
              </div>
              <div className="pt-3 border-t border-zinc-800">
                <h4 className="font-semibold text-zinc-200 mb-1">
                  {localeLabel(
                    locale,
                    'Q. 금리인하요구권은 언제 신청할 수 있나요?',
                    'Q. When can I apply for an interest rate reduction?',
                    'Q. 金利引き下げ要求権はいつ申請できますか？',
                    'Q. 什么时候可以申请调降贷款利率？',
                    'Q. Khi nào tôi có thể yêu cầu giảm lãi suất vay?'
                  )}
                </h4>
                <p className="text-zinc-400 leading-relaxed">
                  {localeLabel(
                    locale,
                    '취업, 승진, 급여 인상, 신용점수 상승, 부채 감소 등 신용 상태가 개선된 경우 은행에 언제든 금리 인하를 요구할 수 있습니다.',
                    'You may request a rate cut from lenders whenever your credit rating improves, such as via salary raises, promotions, or debt reduction.',
                    '就職、昇進、年収増加、クレジットスコアの上昇など信用状態が改善された場合、いつでも金融機関に金利引き下げを請求できます。',
                    '当个人信用状况明显改善（如晋升提薪、信用分提升、还清大额债务）时，可随时向金融机构申请调降贷款利息。',
                    'Bất cứ khi nào điểm tín dụng được cải thiện (tăng lương, trả bớt nợ), bạn đều có quyền yêu cầu ngân hàng xem xét giảm lãi suất.'
                  )}
                </p>
              </div>
            </div>`
);

// replace disclaimer
content = content.replace(
  '<span>본 계산기는 모의 시뮬레이션용이며, 실제 금융기관의 대출 실행 시점 및 세부 약정에 따라 차이가 발생할 수 있습니다.</span>',
  "<span>{localeLabel(locale, '본 계산기는 모의 시뮬레이션용이며, 실제 금융기관의 대출 실행 시점 및 세부 약정에 따라 차이가 발생할 수 있습니다.', 'This tool provides estimates for simulation purposes. Actual loan terms depend on financial institution agreements.', '本ツールは試算用シミュレーションであり、実際の金融機関の審査結果や契約条件により異なる場合があります。', '本计算器仅供测算参考，实际贷款审批利率与月供以金融机构正式签署合同为准。', 'Công cụ này dùng cho mục đích ước tính. Điều khoản thực tế phụ thuộc vào ngân hàng cho vay.')}</span>"
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Localizing loan interest calculator page done.');
