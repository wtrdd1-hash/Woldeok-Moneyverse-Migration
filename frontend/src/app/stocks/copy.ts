import type { Copy } from '@/lib/copy';

/**
 * Copy for the exchange landing page `/stocks` and the pieces it renders from this directory: the
 * sub navigation, the live badge and move line, and the trade dialog and form. Stock names come from
 * `getStockName` and server data; order results come from the server action.
 */
export const COPY = {
  // Landing page (page.tsx)
  filterAll: { ko: '전체 {count}종목', en: 'All {count}', ja: '全{count}銘柄', zh: '全部{count}只', vi: 'Tất cả {count} mã' },
  filterChange: { ko: '급등·급락순', en: 'Top Movers', ja: '変動率順', zh: '涨跌幅榜', vi: 'Biến động mạnh' },
  filterPrice: { ko: '가격순', en: 'By Price', ja: '価格順', zh: '价格高低', vi: 'Theo giá' },
  filterName: { ko: '이름순', en: 'By Name', ja: '名前順', zh: '名称排序', vi: 'Theo tên' },
  marketSummary: { ko: '시장 요약', en: 'Market summary', ja: '市場サマリー', zh: '市场概要', vi: 'Tóm tắt thị trường' },
  listed: { ko: '상장 종목', en: 'Listed', ja: '上場銘柄', zh: '上市标的', vi: 'Niêm yết' },
  advancing: { ko: '상승', en: 'Advancing', ja: '上昇', zh: '上涨', vi: 'Tăng' },
  declining: { ko: '하락', en: 'Declining', ja: '下落', zh: '下跌', vi: 'Giảm' },
  listedCount: {
    ko: '총 {count}개 종목 상장 중',
    en: '{count} stocks listed',
    ja: '計{count}銘柄上場中',
    zh: '现已上市{count}只股票',
    vi: 'Đang niêm yết {count} mã cổ phiếu',
  },
  noStocks: {
    ko: '거래 가능한 종목이 없습니다.',
    en: 'No tradable stocks available.',
    ja: '取引可能な銘柄がありません。',
    zh: '暂无可交易股票。',
    vi: 'Không có mã cổ phiếu nào có thể giao dịch.',
  },
  halted: { ko: '거래정지', en: 'HALTED', ja: '取引停止', zh: '暂停交易', vi: 'TẠM NGỪNG' },
  safetyTitle: {
    ko: '100% 안전한 가상 모의투자 안내',
    en: '100% Risk-Free Trading Simulation',
    ja: '100%安全な仮想模擬投資ガイド',
    zh: '100%安全的模拟投资提示',
    vi: 'Mô phỏng đầu tư ảo an toàn 100%',
  },
  safetyBody: {
    ko: '월덕 머니버스의 모든 종목 시세와 재화(WLD)는 게임 내 알고리즘에 의해 움직이는 가상 경제이며, 실제 현금 입출금이나 실제 주식 투자 상품이 아닙니다.',
    en: 'All stock prices and WLD currency are algorithm-driven virtual game assets, not actual money or real financial securities.',
    ja: 'ウォルドク・マネーバースのすべての銘柄相場と通貨(WLD)はゲーム内アルゴリズムにより動作する仮想経済であり、実際の現金や実在の株式商品ではありません。',
    zh: '月德Moneyverse内所有标的行情与WLD货币均为由算法驱动的虚拟游戏资产，非真实现金或真实证券。',
    vi: 'Mọi giá cổ phiếu và tiền tệ WLD trong Woldeok Moneyverse là nền kinh tế ảo vận hành bằng thuật toán trong trò chơi, không phải tiền mặt thật hay sản phẩm đầu tư chứng khoán thật.',
  },

  // Buy/sell (trade-dialog.tsx, trade-form.tsx)
  buy: { ko: '매수', en: 'Buy', ja: '買い', zh: '买入', vi: 'Mua' },
  sell: { ko: '매도', en: 'Sell', ja: '売り', zh: '卖出', vi: 'Bán' },
  dialogTitle: { ko: '{symbol} · {name} {side}', en: '{side} {symbol} · {name}', ja: '{symbol} · {name} {side}', zh: '{side} {symbol} · {name}', vi: '{side} {symbol} · {name}' },
  dialogNote: {
    ko: '체결가는 주문 시점에 서버가 다시 읽습니다.',
    en: 'Execution price is re-evaluated by the server at the moment of order.',
    ja: '約定価格は注文時にサーバーが改めて確認します。',
    zh: '成交价将在下单时由服务器重新读取。',
    vi: 'Giá khớp lệnh được máy chủ đọc lại tại thời điểm đặt lệnh.',
  },
  quantityLabel: { ko: '{side} 수량', en: '{side} Quantity', ja: '{side}数量', zh: '{side}数量', vi: 'Số lượng {side}' },
  marketAvailable: {
    ko: '시장 유통 잔여: {count}주',
    en: 'Market available: {count} sh',
    ja: '市場流通残り: {count}株',
    zh: '市场剩余流通: {count}股',
    vi: 'Còn lưu hành trên thị trường: {count} cp',
  },
  held: { ko: '보유 수량: {count}주', en: 'Held: {count} sh', ja: '保有数: {count}株', zh: '持有数量: {count}股', vi: 'Đang nắm giữ: {count} cp' },
  sharesUnit: { ko: '주', en: 'shares', ja: '株', zh: '股', vi: 'cp' },
  oneShare: { ko: '1주', en: '1sh', ja: '1株', zh: '1股', vi: '1 cp' },
  unitPrice: { ko: '주문 기준 단가', en: 'Order Unit Price', ja: '注文基準単価', zh: '下单基准单价', vi: 'Đơn giá đặt lệnh' },
  grossTotal: { ko: '주문 총액', en: 'Gross Total', ja: '注文総額', zh: '订单总额', vi: 'Tổng giá trị lệnh' },
  estTax: {
    ko: '예상 거래세 (0.3%)',
    en: 'Est. Securities Tax (0.3%)',
    ja: '予想取引税 (0.3%)',
    zh: '预计交易税 (0.3%)',
    vi: 'Thuế giao dịch dự kiến (0.3%)',
  },
  estPayment: { ko: '예상 결제 금액', en: 'Est. Payment', ja: '予想決済金額', zh: '预计支付金额', vi: 'Số tiền thanh toán dự kiến' },
  estRefund: { ko: '예상 수령 금액', en: 'Est. Net Refund', ja: '予想受取金額', zh: '预计到账金额', vi: 'Số tiền nhận dự kiến' },
  confirmOrder: { ko: '{side} 주문 확정', en: 'Confirm {side}', ja: '{side}注文を確定', zh: '确认{side}订单', vi: 'Xác nhận lệnh {side}' },

  // Shared by every stocks route (stocks-sub-nav.tsx, live.tsx)
  navLabel: {
    ko: '가상 주식 주요 메뉴',
    en: 'Virtual Stock Navigation',
    ja: '仮想株式メインメニュー',
    zh: '虚拟股票主菜单',
    vi: 'Menu chính cổ phiếu ảo',
  },
  navMarket: { ko: '거래소', en: 'Market', ja: '取引所', zh: '交易所', vi: 'Sàn giao dịch' },
  navWatchlist: { ko: '관심 종목', en: 'Watchlist', ja: 'ウォッチリスト', zh: '自选股', vi: 'Danh sách theo dõi' },
  navPortfolio: { ko: '포트폴리오', en: 'Portfolio', ja: 'ポートフォリオ', zh: '投资组合', vi: 'Danh mục' },
  navCompare: { ko: '종목 비교', en: 'Compare', ja: '銘柄比較', zh: '股票对比', vi: 'So sánh' },
  navAlerts: { ko: '조건부 알림', en: 'Alerts', ja: '条件付きアラート', zh: '条件提醒', vi: 'Cảnh báo' },
  navHistory: { ko: '거래 내역', en: 'History', ja: '取引履歴', zh: '交易记录', vi: 'Lịch sử' },
  navLounge: { ko: '주주 라운지', en: 'Lounge', ja: '株主ラウンジ', zh: '股东休息室', vi: 'Phòng cổ đông' },
  noChangeToday: { ko: '오늘 변동 없음', en: 'No change today', ja: '本日変動なし', zh: '今日无变动', vi: 'Hôm nay không đổi' },
  todayPrefix: { ko: '오늘 ', en: 'Today ', ja: '本日 ', zh: '今日 ', vi: 'Hôm nay ' },
  live: { ko: '실시간', en: 'Live', ja: 'リアルタイム', zh: '实时', vi: 'Trực tiếp' },
} satisfies Record<string, Copy>;
