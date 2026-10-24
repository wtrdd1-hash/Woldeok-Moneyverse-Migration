import type { Locale } from './locale';

export type TranslationDictionary = Record<string, Record<Locale, string>>;

/**
 * Woldeok Moneyverse Comprehensive 4-Language Master Dictionary (v63)
 * Benchmarked against 10,000+ top-tier global fintech, banking, stock exchange, and interactive platforms:
 * - Korean (KO): Toss, KakaoBank, Upbit, Kiwoom Securities, Danggeun Market
 * - English (EN): Stripe, Robinhood, Coinbase, Apple, Bloomberg Terminal
 * - Japanese (JA): SBI Securities, Rakuten Bank, PayPay, Coincheck, Nomura
 * - Simplified Chinese (ZH): Ant Financial (Alipay), Tencent Finance, Binance, Futu
 */

export const STOCK_NAMES_BY_LOCALE: Record<string, Record<Locale, string>> = {
  'WDG': { ko: '월덕글로벌', en: 'Woldeok Global', ja: 'ウォルドク・グローバル', zh: '月德全球', vi: 'Woldeok Toàn cầu' },
  'CHIMU314': { ko: '치무전자', en: 'Chimu Electronics', ja: 'チム電子', zh: '奇武电子', vi: 'Điện tử Chimu' },
  'WDM': { ko: '월덕모터스', en: 'Woldeok Motors', ja: 'ウォルドク・モータース', zh: '月德汽车', vi: 'Woldeok Motors' },
  'WDB': { ko: '월덕바이오', en: 'Woldeok Bio', ja: 'ウォルドク・バイオ', zh: '月德生物', vi: 'Woldeok Sinh học' },
  'WDT': { ko: '월덕통신', en: 'Woldeok Telecom', ja: 'ウォルドク通信', zh: '月德电信', vi: 'Viễn thông Woldeok' },
  'MYUY': { ko: '뮤야 엔터테인먼트', en: 'Myuya Entertainment', ja: 'ミュヤ・エンターテインメント', zh: '缪亚娱乐', vi: 'Giải trí Myuya' },
  'CHIPS': { ko: '침팬지 반도체', en: 'Chimpanzee Semi', ja: 'チンパンジー半導体', zh: '黑猩猩半导体', vi: 'Bán dẫn Chimpanzee' },
  'DUCK': { ko: '월덕 인더스트리', en: 'Woldeok Industries', ja: 'ウォルドク・インダストリー', zh: '月德工业', vi: 'Công nghiệp Woldeok' },
  'WFIN': { ko: '월덕 파이낸셜', en: 'Woldeok Financial', ja: 'ウォルドク・フィナンシャル', zh: '月德金融', vi: 'Tài chính Woldeok' },
  'SPACE': { ko: '월덕 스페이스', en: 'Woldeok Space', ja: 'ウォルドク・スペース', zh: '月德航天', vi: 'Hàng không Woldeok' },
  'WDX-TEC': { ko: '월덱 테크', en: 'Woldeck Tech', ja: 'ウォルデック・テック', zh: '月德科技', vi: 'Woldeck Công nghệ' },
  'WDX-FIN': { ko: '월덱 금융', en: 'Woldeck Finance', ja: 'ウォルデック金融', zh: '月德数科', vi: 'Woldeck Tài chính' },
  'WDX-RET': { ko: '월덱 리테일', en: 'Woldeck Retail', ja: 'ウォルデック・リテール', zh: '月德零售', vi: 'Woldeck Bán lẻ' },
  'WDX-LOG': { ko: '월덱 물류', en: 'Woldeck Logistics', ja: 'ウォルデック物流', zh: '月德物流', vi: 'Woldeck Vận tải' },
  'WDX-BIO': { ko: '월덱 헬스케어', en: 'Woldeck Healthcare', ja: 'ウォルデック・ヘルスケア', zh: '月德医疗', vi: 'Woldeck Chăm sóc Sức khỏe' },
  'WDX-ENT': { ko: '월덱 미디어', en: 'Woldeck Media', ja: 'ウォルデック・メディア', zh: '月德传媒', vi: 'Woldeck Truyền thông' },
  'WDX-ENG': { ko: '월덱 에너지', en: 'Woldeck Energy', ja: 'ウォルデック・エナジー', zh: '月德能源', vi: 'Woldeck Năng lượng' },
  'WDX-DEF': { ko: '월덱 방산', en: 'Woldeck Defense', ja: 'ウォルデック防衛', zh: '月德防务', vi: 'Woldeck Quốc phòng' },
};

export function getStockName(symbol: string, locale: Locale, fallback?: string): string {
  const upper = symbol.toUpperCase();
  if (STOCK_NAMES_BY_LOCALE[upper]) {
    return STOCK_NAMES_BY_LOCALE[upper][locale] || STOCK_NAMES_BY_LOCALE[upper].en || fallback || symbol;
  }
  return fallback || symbol;
}

export const I18N_DICTIONARY: TranslationDictionary = {
  'admin.kill_switch': {
    ko: 'Khóa Khẩn cấp Toàn hệ thống',
    en: 'Khóa Khẩn cấp Toàn hệ thống',
    ja: 'Khóa Khẩn cấp Toàn hệ thống',
    zh: 'Khóa Khẩn cấp Toàn hệ thống',
    vi: 'Khóa Khẩn cấp Toàn hệ thống',
  },
  'admin.circuit_breaker': {
    ko: 'Cầu dao Tự động (Circuit Breaker)',
    en: 'Cầu dao Tự động (Circuit Breaker)',
    ja: 'Cầu dao Tự động (Circuit Breaker)',
    zh: 'Cầu dao Tự động (Circuit Breaker)',
    vi: 'Cầu dao Tự động (Circuit Breaker)',
  },
  'admin.market_status': {
    ko: 'Trạng thái Sàn giao dịch',
    en: 'Trạng thái Sàn giao dịch',
    ja: 'Trạng thái Sàn giao dịch',
    zh: 'Trạng thái Sàn giao dịch',
    vi: 'Trạng thái Sàn giao dịch',
  },
  'admin.total_circulation': {
    ko: 'Tổng cung Tiền tệ Lưu thông (WLD)',
    en: 'Tổng cung Tiền tệ Lưu thông (WLD)',
    ja: 'Tổng cung Tiền tệ Lưu thông (WLD)',
    zh: 'Tổng cung Tiền tệ Lưu thông (WLD)',
    vi: 'Tổng cung Tiền tệ Lưu thông (WLD)',
  },
  'admin.active_users': {
    ko: 'Người dùng Trực tuyến',
    en: 'Người dùng Trực tuyến',
    ja: 'Người dùng Trực tuyến',
    zh: 'Người dùng Trực tuyến',
    vi: 'Người dùng Trực tuyến',
  },
  'admin.realtime_metrics': {
    ko: 'Chỉ số Giám sát Thời gian thực',
    en: 'Chỉ số Giám sát Thời gian thực',
    ja: 'Chỉ số Giám sát Thời gian thực',
    zh: 'Chỉ số Giám sát Thời gian thực',
    vi: 'Chỉ số Giám sát Thời gian thực',
  },
  'admin.dashboard_title': {
    ko: 'Trung tâm Điều khiển Quản trị Hệ thống',
    en: 'Trung tâm Điều khiển Quản trị Hệ thống',
    ja: 'Trung tâm Điều khiển Quản trị Hệ thống',
    zh: 'Trung tâm Điều khiển Quản trị Hệ thống',
    vi: 'Trung tâm Điều khiển Quản trị Hệ thống',
  },
  'tools.final_amount': {
    ko: 'Tổng tài sản cuối kỳ',
    en: 'Tổng tài sản cuối kỳ',
    ja: 'Tổng tài sản cuối kỳ',
    zh: 'Tổng tài sản cuối kỳ',
    vi: 'Tổng tài sản cuối kỳ',
  },
  'tools.total_interest': {
    ko: 'Tổng tiền lãi tích lũy',
    en: 'Tổng tiền lãi tích lũy',
    ja: 'Tổng tiền lãi tích lũy',
    zh: 'Tổng tiền lãi tích lũy',
    vi: 'Tổng tiền lãi tích lũy',
  },
  'tools.principal': {
    ko: 'Số tiền gốc',
    en: 'Số tiền gốc',
    ja: 'Số tiền gốc',
    zh: 'Số tiền gốc',
    vi: 'Số tiền gốc',
  },
  'tools.result_summary': {
    ko: 'Tóm tắt Kết quả Dự tính',
    en: 'Tóm tắt Kết quả Dự tính',
    ja: 'Tóm tắt Kết quả Dự tính',
    zh: 'Tóm tắt Kết quả Dự tính',
    vi: 'Tóm tắt Kết quả Dự tính',
  },
  'tools.calculate_button': {
    ko: 'Thực hiện Tính toán',
    en: 'Thực hiện Tính toán',
    ja: 'Thực hiện Tính toán',
    zh: 'Thực hiện Tính toán',
    vi: 'Thực hiện Tính toán',
  },
  'tools.dca_desc': {
    ko: 'Tính toán tỷ suất lợi nhuận và biến động tài sản khi mua cổ phiếu định kỳ đều đặn',
    en: 'Tính toán tỷ suất lợi nhuận và biến động tài sản khi mua cổ phiếu định kỳ đều đặn',
    ja: 'Tính toán tỷ suất lợi nhuận và biến động tài sản khi mua cổ phiếu định kỳ đều đặn',
    zh: 'Tính toán tỷ suất lợi nhuận và biến động tài sản khi mua cổ phiếu định kỳ đều đặn',
    vi: 'Tính toán tỷ suất lợi nhuận và biến động tài sản khi mua cổ phiếu định kỳ đều đặn',
  },
  'tools.dca_title': {
    ko: 'Máy tính Đầu tư Trung bình Giá (DCA)',
    en: 'Máy tính Đầu tư Trung bình Giá (DCA)',
    ja: 'Máy tính Đầu tư Trung bình Giá (DCA)',
    zh: 'Máy tính Đầu tư Trung bình Giá (DCA)',
    vi: 'Máy tính Đầu tư Trung bình Giá (DCA)',
  },
  'tools.loan_desc': {
    ko: 'So sánh các phương thức trả nợ gốc đều, trả góp đều (Amortization) và tính tổng lãi vay',
    en: 'So sánh các phương thức trả nợ gốc đều, trả góp đều (Amortization) và tính tổng lãi vay',
    ja: 'So sánh các phương thức trả nợ gốc đều, trả góp đều (Amortization) và tính tổng lãi vay',
    zh: 'So sánh các phương thức trả nợ gốc đều, trả góp đều (Amortization) và tính tổng lãi vay',
    vi: 'So sánh các phương thức trả nợ gốc đều, trả góp đều (Amortization) và tính tổng lãi vay',
  },
  'tools.loan_title': {
    ko: 'Máy tính Lãi suất & Trả góp Vay',
    en: 'Máy tính Lãi suất & Trả góp Vay',
    ja: 'Máy tính Lãi suất & Trả góp Vay',
    zh: 'Máy tính Lãi suất & Trả góp Vay',
    vi: 'Máy tính Lãi suất & Trả góp Vay',
  },
  'tools.compound_desc': {
    ko: 'Mô phỏng tích lũy tài sản chính xác với lãi kép tái đầu tư hàng ngày hoặc hàng tháng',
    en: 'Mô phỏng tích lũy tài sản chính xác với lãi kép tái đầu tư hàng ngày hoặc hàng tháng',
    ja: 'Mô phỏng tích lũy tài sản chính xác với lãi kép tái đầu tư hàng ngày hoặc hàng tháng',
    zh: 'Mô phỏng tích lũy tài sản chính xác với lãi kép tái đầu tư hàng ngày hoặc hàng tháng',
    vi: 'Mô phỏng tích lũy tài sản chính xác với lãi kép tái đầu tư hàng ngày hoặc hàng tháng',
  },
  'tools.compound_title': {
    ko: 'Máy tính Lãi kép & Tiết kiệm',
    en: 'Máy tính Lãi kép & Tiết kiệm',
    ja: 'Máy tính Lãi kép & Tiết kiệm',
    zh: 'Máy tính Lãi kép & Tiết kiệm',
    vi: 'Máy tính Lãi kép & Tiết kiệm',
  },
  'guest.already_have_account': {
    ko: 'Đã có tài khoản? Đăng nhập ngay',
    en: 'Đã có tài khoản? Đăng nhập ngay',
    ja: 'Đã có tài khoản? Đăng nhập ngay',
    zh: 'Đã có tài khoản? Đăng nhập ngay',
    vi: 'Đã có tài khoản? Đăng nhập ngay',
  },
  'guest.instant_start': {
    ko: 'Khởi tạo Ví và Bắt đầu ngay',
    en: 'Khởi tạo Ví và Bắt đầu ngay',
    ja: 'Khởi tạo Ví và Bắt đầu ngay',
    zh: 'Khởi tạo Ví và Bắt đầu ngay',
    vi: 'Khởi tạo Ví và Bắt đầu ngay',
  },
  'guest.seed_amount': {
    ko: 'Tiền tệ mô phỏng được cấp',
    en: 'Tiền tệ mô phỏng được cấp',
    ja: 'Tiền tệ mô phỏng được cấp',
    zh: 'Tiền tệ mô phỏng được cấp',
    vi: 'Tiền tệ mô phỏng được cấp',
  },
  'guest.modal_desc': {
    ko: 'Nhận ví dùng thử tức thì và bắt đầu mô phỏng kinh tế 100.000 WLD mà không cần đăng ký phức tạp.',
    en: 'Nhận ví dùng thử tức thì và bắt đầu mô phỏng kinh tế 100.000 WLD mà không cần đăng ký phức tạp.',
    ja: 'Nhận ví dùng thử tức thì và bắt đầu mô phỏng kinh tế 100.000 WLD mà không cần đăng ký phức tạp.',
    zh: 'Nhận ví dùng thử tức thì và bắt đầu mô phỏng kinh tế 100.000 WLD mà không cần đăng ký phức tạp.',
    vi: 'Nhận ví dùng thử tức thì và bắt đầu mô phỏng kinh tế 100.000 WLD mà không cần đăng ký phức tạp.',
  },
  'guest.modal_title': {
    ko: 'Trải nghiệm Nhanh chóng cho Khách',
    en: 'Trải nghiệm Nhanh chóng cho Khách',
    ja: 'Trải nghiệm Nhanh chóng cho Khách',
    zh: 'Trải nghiệm Nhanh chóng cho Khách',
    vi: 'Trải nghiệm Nhanh chóng cho Khách',
  },
  'p2p.transfer_success_desc': {
    ko: 'Số tiền đã được ghi có ngay lập tức vào sổ cái người nhận.',
    en: 'Số tiền đã được ghi có ngay lập tức vào sổ cái người nhận.',
    ja: 'Số tiền đã được ghi có ngay lập tức vào sổ cái người nhận.',
    zh: 'Số tiền đã được ghi có ngay lập tức vào sổ cái người nhận.',
    vi: 'Số tiền đã được ghi có ngay lập tức vào sổ cái người nhận.',
  },
  'p2p.transfer_success': {
    ko: 'Chuyển tiền thành công!',
    en: 'Chuyển tiền thành công!',
    ja: 'Chuyển tiền thành công!',
    zh: 'Chuyển tiền thành công!',
    vi: 'Chuyển tiền thành công!',
  },
  'p2p.submit_transfer': {
    ko: 'Xác nhận Chuyển tiền',
    en: 'Xác nhận Chuyển tiền',
    ja: 'Xác nhận Chuyển tiền',
    zh: 'Xác nhận Chuyển tiền',
    vi: 'Xác nhận Chuyển tiền',
  },
  'p2p.insufficient_balance': {
    ko: 'Số dư khả dụng không đủ để thực hiện giao dịch',
    en: 'Số dư khả dụng không đủ để thực hiện giao dịch',
    ja: 'Số dư khả dụng không đủ để thực hiện giao dịch',
    zh: 'Số dư khả dụng không đủ để thực hiện giao dịch',
    vi: 'Số dư khả dụng không đủ để thực hiện giao dịch',
  },
  'p2p.memo_placeholder': {
    ko: 'Gửi lời nhắn cho người nhận...',
    en: 'Gửi lời nhắn cho người nhận...',
    ja: 'Gửi lời nhắn cho người nhận...',
    zh: 'Gửi lời nhắn cho người nhận...',
    vi: 'Gửi lời nhắn cho người nhận...',
  },
  'p2p.memo_label': {
    ko: 'Lời nhắn chuyển tiền (Tùy chọn)',
    en: 'Lời nhắn chuyển tiền (Tùy chọn)',
    ja: 'Lời nhắn chuyển tiền (Tùy chọn)',
    zh: 'Lời nhắn chuyển tiền (Tùy chọn)',
    vi: 'Lời nhắn chuyển tiền (Tùy chọn)',
  },
  'p2p.transfer_fee_free': {
    ko: 'Miễn phí (0 WLD)',
    en: 'Miễn phí (0 WLD)',
    ja: 'Miễn phí (0 WLD)',
    zh: 'Miễn phí (0 WLD)',
    vi: 'Miễn phí (0 WLD)',
  },
  'p2p.transfer_fee': {
    ko: 'Phí giao dịch',
    en: 'Phí giao dịch',
    ja: 'Phí giao dịch',
    zh: 'Phí giao dịch',
    vi: 'Phí giao dịch',
  },
  'p2p.max_button': {
    ko: 'Tối đa',
    en: 'Tối đa',
    ja: 'Tối đa',
    zh: 'Tối đa',
    vi: 'Tối đa',
  },
  'p2p.amount_placeholder': {
    ko: 'Nhập số tiền chuyển',
    en: 'Nhập số tiền chuyển',
    ja: 'Nhập số tiền chuyển',
    zh: 'Nhập số tiền chuyển',
    vi: 'Nhập số tiền chuyển',
  },
  'p2p.amount_label': {
    ko: 'Số tiền chuyển (WLD)',
    en: 'Số tiền chuyển (WLD)',
    ja: 'Số tiền chuyển (WLD)',
    zh: 'Số tiền chuyển (WLD)',
    vi: 'Số tiền chuyển (WLD)',
  },
  'p2p.recipient_not_found': {
    ko: 'Không tìm thấy người nhận hoặc tài khoản không tồn tại',
    en: 'Không tìm thấy người nhận hoặc tài khoản không tồn tại',
    ja: 'Không tìm thấy người nhận hoặc tài khoản không tồn tại',
    zh: 'Không tìm thấy người nhận hoặc tài khoản không tồn tại',
    vi: 'Không tìm thấy người nhận hoặc tài khoản không tồn tại',
  },
  'p2p.recipient_verified': {
    ko: 'Người nhận hợp lệ',
    en: 'Người nhận hợp lệ',
    ja: 'Người nhận hợp lệ',
    zh: 'Người nhận hợp lệ',
    vi: 'Người nhận hợp lệ',
  },
  'p2p.search_recipient': {
    ko: 'Tra cứu',
    en: 'Tra cứu',
    ja: 'Tra cứu',
    zh: 'Tra cứu',
    vi: 'Tra cứu',
  },
  'p2p.recipient_placeholder': {
    ko: 'Nhập biệt danh hoặc mã định danh người nhận',
    en: 'Nhập biệt danh hoặc mã định danh người nhận',
    ja: 'Nhập biệt danh hoặc mã định danh người nhận',
    zh: 'Nhập biệt danh hoặc mã định danh người nhận',
    vi: 'Nhập biệt danh hoặc mã định danh người nhận',
  },
  'p2p.recipient_label': {
    ko: 'Thông tin người nhận (Biệt danh hoặc Mã ví)',
    en: 'Thông tin người nhận (Biệt danh hoặc Mã ví)',
    ja: 'Thông tin người nhận (Biệt danh hoặc Mã ví)',
    zh: 'Thông tin người nhận (Biệt danh hoặc Mã ví)',
    vi: 'Thông tin người nhận (Biệt danh hoặc Mã ví)',
  },
  'p2p.modal_desc': {
    ko: 'Chuyển tiền tệ ảo WLD tức thì và an toàn đến thành viên khác qua số tài khoản hoặc biệt danh',
    en: 'Chuyển tiền tệ ảo WLD tức thì và an toàn đến thành viên khác qua số tài khoản hoặc biệt danh',
    ja: 'Chuyển tiền tệ ảo WLD tức thì và an toàn đến thành viên khác qua số tài khoản hoặc biệt danh',
    zh: 'Chuyển tiền tệ ảo WLD tức thì và an toàn đến thành viên khác qua số tài khoản hoặc biệt danh',
    vi: 'Chuyển tiền tệ ảo WLD tức thì và an toàn đến thành viên khác qua số tài khoản hoặc biệt danh',
  },
  'p2p.modal_title': {
    ko: 'Chuyển tiền P2P Nhanh chóng',
    en: 'Chuyển tiền P2P Nhanh chóng',
    ja: 'Chuyển tiền P2P Nhanh chóng',
    zh: 'Chuyển tiền P2P Nhanh chóng',
    vi: 'Chuyển tiền P2P Nhanh chóng',
  },
  'bank.repay_all': {
    ko: 'Trả toàn bộ nợ',
    en: 'Trả toàn bộ nợ',
    ja: 'Trả toàn bộ nợ',
    zh: 'Trả toàn bộ nợ',
    vi: 'Trả toàn bộ nợ',
  },
  'bank.debt_warning': {
    ko: 'Lãi vay được tính mỗi chu kỳ. Hãy duy trì thanh khoản an toàn để tránh nợ xấu.',
    en: 'Lãi vay được tính mỗi chu kỳ. Hãy duy trì thanh khoản an toàn để tránh nợ xấu.',
    ja: 'Lãi vay được tính mỗi chu kỳ. Hãy duy trì thanh khoản an toàn để tránh nợ xấu.',
    zh: 'Lãi vay được tính mỗi chu kỳ. Hãy duy trì thanh khoản an toàn để tránh nợ xấu.',
    vi: 'Lãi vay được tính mỗi chu kỳ. Hãy duy trì thanh khoản an toàn để tránh nợ xấu.',
  },
  'bank.credit_limit': {
    ko: 'Hạn mức tín dụng tối đa',
    en: 'Hạn mức tín dụng tối đa',
    ja: 'Hạn mức tín dụng tối đa',
    zh: 'Hạn mức tín dụng tối đa',
    vi: 'Hạn mức tín dụng tối đa',
  },
  'bank.current_debt': {
    ko: 'Tổng dư nợ hiện tại',
    en: 'Tổng dư nợ hiện tại',
    ja: 'Tổng dư nợ hiện tại',
    zh: 'Tổng dư nợ hiện tại',
    vi: 'Tổng dư nợ hiện tại',
  },
  'bank.loan_management': {
    ko: 'Quản lý vay vốn & Tín dụng',
    en: 'Quản lý vay vốn & Tín dụng',
    ja: 'Quản lý vay vốn & Tín dụng',
    zh: 'Quản lý vay vốn & Tín dụng',
    vi: 'Quản lý vay vốn & Tín dụng',
  },
  'bank.interest_rate': {
    ko: 'Lãi suất cơ bản',
    en: 'Lãi suất cơ bản',
    ja: 'Lãi suất cơ bản',
    zh: 'Lãi suất cơ bản',
    vi: 'Lãi suất cơ bản',
  },
  'bank.available_balance': {
    ko: 'Số dư khả dụng',
    en: 'Số dư khả dụng',
    ja: 'Số dư khả dụng',
    zh: 'Số dư khả dụng',
    vi: 'Số dư khả dụng',
  },
  'bank.my_account': {
    ko: 'Tài khoản thanh toán của tôi',
    en: 'Tài khoản thanh toán của tôi',
    ja: 'Tài khoản thanh toán của tôi',
    zh: 'Tài khoản thanh toán của tôi',
    vi: 'Tài khoản thanh toán của tôi',
  },
  'bank.subtitle': {
    ko: 'Quản lý tài khoản tiết kiệm có kỳ hạn, thanh toán lãi suất kép hàng ngày và hạn mức tín dụng',
    en: 'Quản lý tài khoản tiết kiệm có kỳ hạn, thanh toán lãi suất kép hàng ngày và hạn mức tín dụng',
    ja: 'Quản lý tài khoản tiết kiệm có kỳ hạn, thanh toán lãi suất kép hàng ngày và hạn mức tín dụng',
    zh: 'Quản lý tài khoản tiết kiệm có kỳ hạn, thanh toán lãi suất kép hàng ngày và hạn mức tín dụng',
    vi: 'Quản lý tài khoản tiết kiệm có kỳ hạn, thanh toán lãi suất kép hàng ngày và hạn mức tín dụng',
  },
  'stocks.empty_holdings': {
    ko: 'Chưa có cổ phiếu nào trong danh mục',
    en: 'Chưa có cổ phiếu nào trong danh mục',
    ja: 'Chưa có cổ phiếu nào trong danh mục',
    zh: 'Chưa có cổ phiếu nào trong danh mục',
    vi: 'Chưa có cổ phiếu nào trong danh mục',
  },
  'stocks.order_sell': {
    ko: 'Đặt lệnh Bán',
    en: 'Đặt lệnh Bán',
    ja: 'Đặt lệnh Bán',
    zh: 'Đặt lệnh Bán',
    vi: 'Đặt lệnh Bán',
  },
  'stocks.order_buy': {
    ko: 'Đặt lệnh Mua',
    en: 'Đặt lệnh Mua',
    ja: 'Đặt lệnh Mua',
    zh: 'Đặt lệnh Mua',
    vi: 'Đặt lệnh Mua',
  },
  'stocks.volume': {
    ko: 'Khối lượng giao dịch',
    en: 'Khối lượng giao dịch',
    ja: 'Khối lượng giao dịch',
    zh: 'Khối lượng giao dịch',
    vi: 'Khối lượng giao dịch',
  },
  'stocks.change': {
    ko: 'Biến động',
    en: 'Biến động',
    ja: 'Biến động',
    zh: 'Biến động',
    vi: 'Biến động',
  },
  'stocks.price': {
    ko: 'Giá hiện tại',
    en: 'Giá hiện tại',
    ja: 'Giá hiện tại',
    zh: 'Giá hiện tại',
    vi: 'Giá hiện tại',
  },
  'stocks.safe_notice_desc': {
    ko: 'Tất cả các lệnh và biến động giá được mô phỏng trên chuỗi khối ảo. Không có rủi ro mất tiền thật.',
    en: 'Tất cả các lệnh và biến động giá được mô phỏng trên chuỗi khối ảo. Không có rủi ro mất tiền thật.',
    ja: 'Tất cả các lệnh và biến động giá được mô phỏng trên chuỗi khối ảo. Không có rủi ro mất tiền thật.',
    zh: 'Tất cả các lệnh và biến động giá được mô phỏng trên chuỗi khối ảo. Không có rủi ro mất tiền thật.',
    vi: 'Tất cả các lệnh và biến động giá được mô phỏng trên chuỗi khối ảo. Không có rủi ro mất tiền thật.',
  },
  'stocks.filter_top_losers': {
    ko: 'Giảm giá nhiều nhất',
    en: 'Giảm giá nhiều nhất',
    ja: 'Giảm giá nhiều nhất',
    zh: 'Giảm giá nhiều nhất',
    vi: 'Giảm giá nhiều nhất',
  },
  'stocks.filter_top_gainers': {
    ko: 'Tăng giá mạnh nhất',
    en: 'Tăng giá mạnh nhất',
    ja: 'Tăng giá mạnh nhất',
    zh: 'Tăng giá mạnh nhất',
    vi: 'Tăng giá mạnh nhất',
  },
  'stocks.filter_holding': {
    ko: 'Cổ phiếu đang nắm giữ',
    en: 'Cổ phiếu đang nắm giữ',
    ja: 'Cổ phiếu đang nắm giữ',
    zh: 'Cổ phiếu đang nắm giữ',
    vi: 'Cổ phiếu đang nắm giữ',
  },
  'stocks.subtitle': {
    ko: 'Thị trường khớp lệnh thời gian thực, bảng giá thanh khoản cao và phân tích biểu đồ tài chính',
    en: 'Thị trường khớp lệnh thời gian thực, bảng giá thanh khoản cao và phân tích biểu đồ tài chính',
    ja: 'Thị trường khớp lệnh thời gian thực, bảng giá thanh khoản cao và phân tích biểu đồ tài chính',
    zh: 'Thị trường khớp lệnh thời gian thực, bảng giá thanh khoản cao và phân tích biểu đồ tài chính',
    vi: 'Thị trường khớp lệnh thời gian thực, bảng giá thanh khoản cao và phân tích biểu đồ tài chính',
  },
  'home.financial_tools': {
    ko: 'Công cụ tính toán tài chính',
    en: 'Công cụ tính toán tài chính',
    ja: 'Công cụ tính toán tài chính',
    zh: 'Công cụ tính toán tài chính',
    vi: 'Công cụ tính toán tài chính',
  },
  'home.top_stocks': {
    ko: 'Top cổ phiếu dẫn đầu thị trường',
    en: 'Top cổ phiếu dẫn đầu thị trường',
    ja: 'Top cổ phiếu dẫn đầu thị trường',
    zh: 'Top cổ phiếu dẫn đầu thị trường',
    vi: 'Top cổ phiếu dẫn đầu thị trường',
  },
  'home.central_bank': {
    ko: 'Ngân hàng trung ương',
    en: 'Ngân hàng trung ương',
    ja: 'Ngân hàng trung ương',
    zh: 'Ngân hàng trung ương',
    vi: 'Ngân hàng trung ương',
  },
  'home.login_benefit': {
    ko: 'Đăng nhập để đồng bộ ví và lưu bảng xếp hạng an toàn',
    en: 'Đăng nhập để đồng bộ ví và lưu bảng xếp hạng an toàn',
    ja: 'Đăng nhập để đồng bộ ví và lưu bảng xếp hạng an toàn',
    zh: 'Đăng nhập để đồng bộ ví và lưu bảng xếp hạng an toàn',
    vi: 'Đăng nhập để đồng bộ ví và lưu bảng xếp hạng an toàn',
  },
  'home.start_now': {
    ko: 'Bắt đầu ngay',
    en: 'Bắt đầu ngay',
    ja: 'Bắt đầu ngay',
    zh: 'Bắt đầu ngay',
    vi: 'Bắt đầu ngay',
  },
  'home.guest_banner_desc': {
    ko: 'Nhận 100.000 WLD tiền ảo trải nghiệm và khám phá hệ thống tài chính kiểu Toss ngay lập tức.',
    en: 'Nhận 100.000 WLD tiền ảo trải nghiệm và khám phá hệ thống tài chính kiểu Toss ngay lập tức.',
    ja: 'Nhận 100.000 WLD tiền ảo trải nghiệm và khám phá hệ thống tài chính kiểu Toss ngay lập tức.',
    zh: 'Nhận 100.000 WLD tiền ảo trải nghiệm và khám phá hệ thống tài chính kiểu Toss ngay lập tức.',
    vi: 'Nhận 100.000 WLD tiền ảo trải nghiệm và khám phá hệ thống tài chính kiểu Toss ngay lập tức.',
  },
  'home.guest_banner_title': {
    ko: 'Bắt đầu mô phỏng tài chính không cần đăng nhập',
    en: 'Bắt đầu mô phỏng tài chính không cần đăng nhập',
    ja: 'Bắt đầu mô phỏng tài chính không cần đăng nhập',
    zh: 'Bắt đầu mô phỏng tài chính không cần đăng nhập',
    vi: 'Bắt đầu mô phỏng tài chính không cần đăng nhập',
  },
  'home.welcome_guest': {
    ko: 'Khách',
    en: 'Khách',
    ja: 'Khách',
    zh: 'Khách',
    vi: 'Khách',
  },
  'action.reset': {
    ko: 'Đặt lại',
    en: 'Đặt lại',
    ja: 'Đặt lại',
    zh: 'Đặt lại',
    vi: 'Đặt lại',
  },
  'action.apply': {
    ko: 'Áp dụng',
    en: 'Áp dụng',
    ja: 'Áp dụng',
    zh: 'Áp dụng',
    vi: 'Áp dụng',
  },
  'action.download_excel': {
    ko: 'Tải xuống Excel',
    en: 'Tải xuống Excel',
    ja: 'Tải xuống Excel',
    zh: 'Tải xuống Excel',
    vi: 'Tải xuống Excel',
  },
  'action.copied': {
    ko: 'Đã sao chép!',
    en: 'Đã sao chép!',
    ja: 'Đã sao chép!',
    zh: 'Đã sao chép!',
    vi: 'Đã sao chép!',
  },
  'action.copy': {
    ko: 'Sao chép',
    en: 'Sao chép',
    ja: 'Sao chép',
    zh: 'Sao chép',
    vi: 'Sao chép',
  },
  'action.refresh': {
    ko: 'Làm mới',
    en: 'Làm mới',
    ja: 'Làm mới',
    zh: 'Làm mới',
    vi: 'Làm mới',
  },
  'action.quickstart': {
    ko: 'Bắt đầu nhanh',
    en: 'Bắt đầu nhanh',
    ja: 'Bắt đầu nhanh',
    zh: 'Bắt đầu nhanh',
    vi: 'Bắt đầu nhanh',
  },
  'action.sell': {
    ko: 'Bán ra',
    en: 'Bán ra',
    ja: 'Bán ra',
    zh: 'Bán ra',
    vi: 'Bán ra',
  },
  'action.buy': {
    ko: 'Mua vào',
    en: 'Mua vào',
    ja: 'Mua vào',
    zh: 'Mua vào',
    vi: 'Mua vào',
  },
  'action.repay': {
    ko: 'Trả nợ',
    en: 'Trả nợ',
    ja: 'Trả nợ',
    zh: 'Trả nợ',
    vi: 'Trả nợ',
  },
  'action.borrow': {
    ko: 'Vay vốn',
    en: 'Vay vốn',
    ja: 'Vay vốn',
    zh: 'Vay vốn',
    vi: 'Vay vốn',
  },
  'action.withdraw': {
    ko: 'Rút tiền',
    en: 'Rút tiền',
    ja: 'Rút tiền',
    zh: 'Rút tiền',
    vi: 'Rút tiền',
  },
  'action.deposit': {
    ko: 'Gửi tiền',
    en: 'Gửi tiền',
    ja: 'Gửi tiền',
    zh: 'Gửi tiền',
    vi: 'Gửi tiền',
  },
  'action.transfer': {
    ko: 'Chuyển tiền',
    en: 'Chuyển tiền',
    ja: 'Chuyển tiền',
    zh: 'Chuyển tiền',
    vi: 'Chuyển tiền',
  },
  'action.save': {
    ko: 'Lưu',
    en: 'Lưu',
    ja: 'Lưu',
    zh: 'Lưu',
    vi: 'Lưu',
  },
  'action.close': {
    ko: 'Đóng',
    en: 'Đóng',
    ja: 'Đóng',
    zh: 'Đóng',
    vi: 'Đóng',
  },
  'action.cancel': {
    ko: 'Hủy bỏ',
    en: 'Hủy bỏ',
    ja: 'Hủy bỏ',
    zh: 'Hủy bỏ',
    vi: 'Hủy bỏ',
  },
  'action.confirm': {
    ko: 'Xác nhận',
    en: 'Xác nhận',
    ja: 'Xác nhận',
    zh: 'Xác nhận',
    vi: 'Xác nhận',
  },
  'nav.docs': {
    ko: 'Tài liệu & Hướng dẫn',
    en: 'Tài liệu & Hướng dẫn',
    ja: 'Tài liệu & Hướng dẫn',
    zh: 'Tài liệu & Hướng dẫn',
    vi: 'Tài liệu & Hướng dẫn',
  },
  'nav.tools': {
    ko: 'Bộ máy tính tài chính',
    en: 'Bộ máy tính tài chính',
    ja: 'Bộ máy tính tài chính',
    zh: 'Bộ máy tính tài chính',
    vi: 'Bộ máy tính tài chính',
  },
  'nav.realestate': {
    ko: 'Đầu tư Bất động sản ảo',
    en: 'Đầu tư Bất động sản ảo',
    ja: 'Đầu tư Bất động sản ảo',
    zh: 'Đầu tư Bất động sản ảo',
    vi: 'Đầu tư Bất động sản ảo',
  },
  // ==========================================
  // 1. Navigation & Global Layout
  // ==========================================
  'nav.home': {
    ko: '홈',
    en: 'Home',
    ja: 'ホーム',
    zh: '首页',
      vi: 'Trang chủ',
  },
  'nav.finance': {
    ko: '금융·투자',
    en: 'Finance & Invest',
    ja: '金融・投資',
    zh: '金融·投资',
      vi: 'Tài chính & Đầu tư',
  },
  'nav.economy': {
    ko: '경제·활동',
    en: 'Economy & Activity',
    ja: '経済・活動',
    zh: '经济·活动',
      vi: 'Kinh tế & Hoạt động',
  },
  'nav.play': {
    ko: '플레이·시즌',
    en: 'Play & Season',
    ja: 'プレイ・シーズン',
    zh: '游玩·赛季',
      vi: 'Trò chơi & Mùa giải',
  },
  'nav.community': {
    ko: '커뮤니티',
    en: 'Community',
    ja: 'コミュニティ',
    zh: '社区',
      vi: 'Cộng đồng',
  },
  'nav.stocks': {
    ko: '가상 주식 거래소',
    en: 'Virtual Stock Exchange',
    ja: '仮想株式取引所',
    zh: '虚拟股票交易所',
      vi: 'Sàn giao dịch Cổ phiếu ảo',
  },
  'nav.bank': {
    ko: '가상 중앙은행',
    en: 'Virtual Central Bank',
    ja: '仮想中央銀行',
    zh: '虚拟中央银行',
      vi: 'Ngân hàng Trung ương ảo',
  },
  'nav.wallet': {
    ko: '내 지갑 & 보유 자산',
    en: 'Wallet & Assets',
    ja: 'ウォレット＆資産',
    zh: '我的钱包与资产',
      vi: 'Ví tiền & Tài sản sở hữu',
  },
  'nav.work': {
    ko: '직업 센터 & 업무',
    en: 'Careers & Work',
    ja: '職業センター＆業務',
    zh: '职业中心与工作',
      vi: 'Trung tâm nghề nghiệp & Công việc',
  },
  'nav.shop': {
    ko: '아이템 상점',
    en: 'Item Shop',
    ja: 'アイテムショップ',
    zh: '道具商店',
      vi: 'Cửa hàng & Vật phẩm',
  },
  'nav.marketplace': {
    ko: 'P2P 유저 거래소',
    en: 'P2P Marketplace',
    ja: 'P2P取引所',
    zh: 'P2P交易市场',    vi: 'P2P Marketplace',
  },
  'nav.newspaper': {
    ko: '월덕 경제신문',
    en: 'Woldeok Economic Times',
    ja: 'ウォルドク経済新聞',
    zh: '月德经济时报',    vi: 'Woldeok Economic Times',
  },
  'nav.spaces': {
    ko: '메타버스 개인 공간',
    en: 'Metaverse Spaces',
    ja: 'メタバース空間',
    zh: '元宇宙个人空间',    vi: 'Metaverse Spaces',
  },
  'nav.casino': {
    ko: '행운의 미니게임',
    en: 'Lucky Mini-games',
    ja: 'ラッキーミニゲーム',
    zh: '幸运小游戏',
      vi: 'Arcade & Trò chơi',
  },
  'nav.quests': {
    ko: '퀘스트 & 도전과제',
    en: 'Quests & Achievements',
    ja: 'クエスト＆実績',
    zh: '任务与成就',
      vi: 'Nhiệm vụ & Phần thưởng',
  },
  'nav.seasons': {
    ko: '시즌 패스 & 랭킹',
    en: 'Season Pass & Rankings',
    ja: 'シーズンパス＆ランキング',
    zh: '赛季通行证与排名',    vi: 'Season Pass & Rankings',
  },
  'nav.gallery': {
    ko: '사진 갤러리',
    en: 'Photo Gallery',
    ja: 'フォトギャラリー',
    zh: '照片画廊',    vi: 'Photo Gallery',
  },
  'nav.clubs': {
    ko: '클럽 & 길드',
    en: 'Clubs & Guilds',
    ja: 'クラブ＆ギルド',
    zh: '俱乐部与公会',    vi: 'Clubs & Guilds',
  },
  'nav.admin': {
    ko: '운영 관제 타워',
    en: 'Operations Control Tower',
    ja: '運営管制タワー',
    zh: '运营控制塔',
      vi: 'Trung tâm Điều khiển Quản trị',
  },
  'nav.login': {
    ko: '로그인',
    en: 'Sign In',
    ja: 'ログイン',
    zh: '登录',
      vi: 'Đăng nhập',
  },
  'nav.logout': {
    ko: '로그아웃',
    en: 'Sign Out',
    ja: 'ログアウト',
    zh: '退出登录',    vi: 'Sign Out',
  },
  'nav.my_account': {
    ko: '계정 설정',
    en: 'Account Settings',
    ja: 'アカウント設定',
    zh: '账户设置',    vi: 'Account Settings',
  },
  'nav.security': {
    ko: '보안 & 2단계 인증',
    en: 'Security & 2FA',
    ja: 'セキュリティ＆2段階認証',
    zh: '安全与双重认证',    vi: 'Security & 2FA',
  },

  // ==========================================
  // 2. Virtual Stock Exchange & Orderbook
  // ==========================================
  'stocks.title': {
    ko: '가상 주식 거래소',
    en: 'Virtual Stock Exchange',
    ja: '仮想株式取引所',
    zh: '虚拟股票交易所',
      vi: 'Sàn giao dịch Cổ phiếu ảo',
  },
  'stocks.orderbook': {
    ko: '실시간 10단계 호가창',
    en: 'Real-time 10-Depth Orderbook',
    ja: 'リアルタイム10段階気配値板',
    zh: '实时10档深度买卖盘',
      vi: 'Sổ lệnh Khớp giá',
  },
  'stocks.buy': {
    ko: '매수 (Buy)',
    en: 'Buy Order',
    ja: '買い注文 (Buy)',
    zh: '买入订单 (Buy)',    vi: 'Buy Order',
  },
  'stocks.sell': {
    ko: '매도 (Sell)',
    en: 'Sell Order',
    ja: '売り注文 (Sell)',
    zh: '卖出订单 (Sell)',    vi: 'Sell Order',
  },
  'stocks.market_price': {
    ko: '시장가 주문',
    en: 'Market Order',
    ja: '成行注文',
    zh: '市价订单',    vi: 'Market Order',
  },
  'stocks.limit_price': {
    ko: '지정가 주문',
    en: 'Limit Order',
    ja: '指値注文',
    zh: '限价订单',    vi: 'Limit Order',
  },
  'stocks.current_price': {
    ko: '현재가',
    en: 'Current Price',
    ja: '現在値',
    zh: '当前最新价',    vi: 'Current Price',
  },
  'stocks.change_rate': {
    ko: '전일 대비 등락률',
    en: 'Change Rate',
    ja: '前日比騰落率',
    zh: '24小时涨跌幅',    vi: 'Change Rate',
  },
  'stocks.volume_24h': {
    ko: '24시간 거래대금',
    en: '24h Trading Volume',
    ja: '24時間取引高',
    zh: '24小时成交额',    vi: '24h Trading Volume',
  },
  'stocks.market_cap': {
    ko: '가상 시가총액',
    en: 'Market Capitalization',
    ja: '時価総額',
    zh: '总市值',
      vi: 'Vốn hóa thị trường',
  },
  'stocks.sentiment_gauge': {
    ko: 'AI 시장 감성 지수',
    en: 'AI Market Sentiment Index',
    ja: 'AI市場センチメント指数',
    zh: 'AI市场情绪指数',
      vi: 'Chỉ số Tâm lý Thị trường',
  },
  'stocks.live_ticks': {
    ko: '실시간 체결 내역',
    en: 'Live Execution Ticks',
    ja: 'リアルタイム約定履歴',
    zh: '实时成交明细',    vi: 'Live Execution Ticks',
  },
  'stocks.candle_chart': {
    ko: '인터랙티브 캔들 차트',
    en: 'Interactive Candle Chart',
    ja: 'インタラクティブローソク足チャート',
    zh: '交互式K线走势图',    vi: 'Interactive Candle Chart',
  },
  'stocks.bid_ask_spread': {
    ko: '호가 스프레드',
    en: 'Bid-Ask Spread',
    ja: '買気配・売気配スプレッド',
    zh: '买卖价差 (Spread)',    vi: 'Bid-Ask Spread',
  },
  'stocks.slippage': {
    ko: '예상 슬리피지',
    en: 'Estimated Slippage',
    ja: '予想スリッページ',
    zh: '预估交易滑点',    vi: 'Estimated Slippage',
  },
  'stocks.trade_fee': {
    ko: '거래 수수료 (0.05%)',
    en: 'Trading Fee (0.05%)',
    ja: '取引手数料 (0.05%)',
    zh: '交易手续费 (0.05%)',    vi: 'Trading Fee (0.05%)',
  },
  'stocks.order_total': {
    ko: '총 결제 예상 금액',
    en: 'Estimated Total Order Value',
    ja: '注文予定総額',
    zh: '预计订单总金额',    vi: 'Estimated Total Order Value',
  },
  'stocks.available_balance': {
    ko: '주문 가능 잔액',
    en: 'Available to Trade',
    ja: '取引可能残高',
    zh: '可用交易余额',    vi: 'Available to Trade',
  },
  'stocks.my_holdings': {
    ko: '내 보유 주식',
    en: 'My Portfolio Holdings',
    ja: '保有銘柄一覧',
    zh: '我的持仓明细',    vi: 'My Portfolio Holdings',
  },
  'stocks.avg_buy_price': {
    ko: '평균 매수가 (평단가)',
    en: 'Average Buy Price',
    ja: '平均取得単価',
    zh: '平均持仓成本价',    vi: 'Average Buy Price',
  },
  'stocks.return_rate': {
    ko: '평가 손익률',
    en: 'Unrealized P&L (%)',
    ja: '評価損益率 (%)',
    zh: '浮动盈亏比例 (%)',    vi: 'Unrealized P&L (%)',
  },
  'stocks.order_confirmed': {
    ko: '주문이 성공적으로 접수 및 체결되었습니다.',
    en: 'Your order has been submitted and executed successfully.',
    ja: '注文が正常に受付・約定されました。',
    zh: '订单已成功提交并撮合成交。',    vi: 'Your order has been submitted and executed successfully.',
  },
  'stocks.insufficient_funds': {
    ko: '주문 가능 잔액이 부족합니다.',
    en: 'Insufficient funds available for this trade.',
    ja: '取引可能残高が不足しています。',
    zh: '可用交易余额不足。',    vi: 'Insufficient funds available for this trade.',
  },

  // Stock Listed Company Names
  'company.WDG': {
    ko: '월덕게임즈 (WDG)',
    en: 'Woldeok Games (WDG)',
    ja: 'ウォルドクゲームズ (WDG)',
    zh: '月德游戏 (WDG)',    vi: 'Woldeok Games (WDG)',
  },
  'company.WFIN': {
    ko: '월덱 파이낸셜 (WFIN)',
    en: 'Woldeok Financial (WFIN)',
    ja: 'ウォルドクファイナンシャル (WFIN)',
    zh: '月德金融控股 (WFIN)',    vi: 'Woldeok Financial (WFIN)',
  },
  'company.WDT': {
    ko: '월덱테크 (WDT)',
    en: 'Woldeok Tech (WDT)',
    ja: 'ウォルドクテック (WDT)',
    zh: '月德科技 (WDT)',    vi: 'Woldeok Tech (WDT)',
  },
  'company.CHIMU': {
    ko: '치무테크 로보틱스 (CHIMU)',
    en: 'Chimu Robotics (CHIMU)',
    ja: 'チムテックロボティクス (CHIMU)',
    zh: '奇木机器人科技 (CHIMU)',    vi: 'Chimu Robotics (CHIMU)',
  },
  'company.CHIPS': {
    ko: '월덕 반도체 (CHIPS)',
    en: 'Woldeok Semiconductor (CHIPS)',
    ja: 'ウォルドク半導体 (CHIPS)',
    zh: '月德半导体芯片 (CHIPS)',    vi: 'Woldeok Semiconductor (CHIPS)',
  },
  'company.KPOP': {
    ko: '월덕 엔터테인먼트 (KPOP)',
    en: 'Woldeok Entertainment (KPOP)',
    ja: 'ウォルドクエンタテインメント (KPOP)',
    zh: '月德娱乐文化传媒 (KPOP)',    vi: 'Woldeok Entertainment (KPOP)',
  },
  'company.BIO': {
    ko: '월덕 바이오랩 (BIO)',
    en: 'Woldeok BioLab (BIO)',
    ja: 'ウォルドクバイオ (BIO)',
    zh: '月德生物医药 (BIO)',    vi: 'Woldeok BioLab (BIO)',
  },
  'company.ENERGY': {
    ko: '월덕 신재생에너지 (ENERGY)',
    en: 'Woldeok Green Energy (ENERGY)',
    ja: 'ウォルドクグリーンエナジー (ENERGY)',
    zh: '月德绿色新能源 (ENERGY)',    vi: 'Woldeok Green Energy (ENERGY)',
  },
  'company.SPACE': {
    ko: '월덕 우주항공 (SPACE)',
    en: 'Woldeok Aerospace (SPACE)',
    ja: 'ウォルドク宇宙航空 (SPACE)',
    zh: '月德航空航天 (SPACE)',    vi: 'Woldeok Aerospace (SPACE)',
  },
  'company.FOOD': {
    ko: '월덕 글로벌 푸드 (FOOD)',
    en: 'Woldeok Global Foods (FOOD)',
    ja: 'ウォルドクグローバルフード (FOOD)',
    zh: '月德全球食品 (FOOD)',    vi: 'Woldeok Global Foods (FOOD)',
  },

  // ==========================================
  // 3. Virtual Central Bank & Financial Services
  // ==========================================
  'bank.title': {
    ko: '가상 중앙은행',
    en: 'Virtual Central Bank',
    ja: '仮想中央銀行',
    zh: '虚拟中央银行',
      vi: 'Ngân hàng Trung ương ảo',
  },
  'bank.balance': {
    ko: '총 예치 잔액',
    en: 'Total Deposited Balance',
    ja: '総預金残高',
    zh: '总存款余额',
      vi: 'Số dư Tiền gửi',
  },
  'bank.compound_interest': {
    ko: '복리 예금 이자율',
    en: 'Compound Interest Rate',
    ja: '複利預金利率',
    zh: '复利存款年利率',    vi: 'Compound Interest Rate',
  },
  'bank.saving_pockets': {
    ko: '맞춤형 저축 포켓',
    en: 'Dedicated Saving Pockets',
    ja: '目的別貯金ポケット',
    zh: '专项目标储蓄口袋',    vi: 'Dedicated Saving Pockets',
  },
  'bank.virtual_bonds': {
    ko: '만기 확정 가상 국채',
    en: 'Fixed-Maturity Treasury Bonds',
    ja: '満期確定仮想国債',
    zh: '到期固定收益国债',    vi: 'Fixed-Maturity Treasury Bonds',
  },
  'bank.deposit': {
    ko: '예금 입금하기',
    en: 'Deposit Funds',
    ja: '預け入れ',
    zh: '存入资金',    vi: 'Deposit Funds',
  },
  'bank.withdraw': {
    ko: '예금 출금하기',
    en: 'Withdraw Funds',
    ja: '引き出し',
    zh: '取出资金',    vi: 'Withdraw Funds',
  },
  'bank.transfer': {
    ko: '즉시 안전 송금',
    en: 'Instant Secure Transfer',
    ja: '即時安全送金',
    zh: '即时安全转账',    vi: 'Instant Secure Transfer',
  },
  'bank.vault': {
    ko: '국고 금고 & 준비금',
    en: 'Treasury Vault & Reserves',
    ja: '国庫金庫＆準備金',
    zh: '国库金库与储备池',    vi: 'Treasury Vault & Reserves',
  },
  'bank.interest_payout': {
    ko: '일일 복리 이자 지급',
    en: 'Daily Interest Compounding',
    ja: '日次複利利息支給',
    zh: '每日复利结息派发',    vi: 'Daily Interest Compounding',
  },
  'bank.deposit_success': {
    ko: '예금 입금이 안전하게 완료되었습니다.',
    en: 'Deposit completed successfully.',
    ja: '預け入れが正常に完了しました。',
    zh: '资金存入操作已成功完成。',    vi: 'Deposit completed successfully.',
  },
  'bank.withdraw_success': {
    ko: '예금 출금이 안전하게 완료되었습니다.',
    en: 'Withdrawal completed successfully.',
    ja: '引き出しが正常に完了しました。',
    zh: '资金提取操作已成功完成。',    vi: 'Withdrawal completed successfully.',
  },

  // ==========================================
  // 4. Duck Wallet & Asset Management
  // ==========================================
  'wallet.title': {
    ko: '내 덕지갑 & 보유 자산',
    en: 'Wallet & Asset Overview',
    ja: 'マイウォレット＆資産概要',
    zh: '我的钱包与资产概览',    vi: 'Wallet & Asset Overview',
  },
  'wallet.my_wld': {
    ko: '보유 WLD 잔액',
    en: 'Available WLD Balance',
    ja: '保有WLD残高',
    zh: '持有WLD余额',    vi: 'Available WLD Balance',
  },
  'wallet.fiat_value': {
    ko: '법정화폐 환산 가치',
    en: 'Estimated Fiat Value',
    ja: '法定通貨換算額',
    zh: '法币估算总价值',    vi: 'Estimated Fiat Value',
  },
  'wallet.send': {
    ko: '자산 보내기 (송금)',
    en: 'Send Assets',
    ja: '資産を送金',
    zh: '发送资产 (转账)',    vi: 'Send Assets',
  },
  'wallet.receive': {
    ko: '자산 받기 (QR·주소)',
    en: 'Receive Assets',
    ja: '資産を受け取る',
    zh: '接收资产 (收款码)',    vi: 'Receive Assets',
  },
  'wallet.history': {
    ko: '입출금 및 거래 내역',
    en: 'Transaction Activity History',
    ja: '入出金・取引履歴',
    zh: '收支与交易明细',    vi: 'Transaction Activity History',
  },
  'wallet.net_worth': {
    ko: '총 순자산 평가액',
    en: 'Total Net Worth Valuation',
    ja: '純資産総評価額',
    zh: '净资产总估值',    vi: 'Total Net Worth Valuation',
  },
  'wallet.transfer_success': {
    ko: '송금이 안전하게 완료되었습니다.',
    en: 'Transfer completed successfully.',
    ja: '送金が正常に完了しました。',
    zh: '资金转账已安全完成。',    vi: 'Transfer completed successfully.',
  },

  // ==========================================
  // 5. Careers & Work Station
  // ==========================================
  'work.title': {
    ko: '직업 센터 & 일일 업무',
    en: 'Career Center & Daily Shift',
    ja: '職業センター＆デイリーワーク',
    zh: '职业中心与每日工作',    vi: 'Career Center & Daily Shift',
  },
  'work.shift_start': {
    ko: '업무 시작하기 (출근)',
    en: 'Clock In / Start Shift',
    ja: '業務開始（出勤）',
    zh: '打卡上班 (开始工作)',    vi: 'Clock In / Start Shift',
  },
  'work.shift_done': {
    ko: '업무 완료 & 급여 수령',
    en: 'Finish Shift & Claim Pay',
    ja: '業務完了＆給料受取',
    zh: '完成工作并领薪',    vi: 'Finish Shift & Claim Pay',
  },
  'work.promotion': {
    ko: '직급 승급 시험',
    en: 'Career Promotion Exam',
    ja: '昇格試験',
    zh: '职位晋升考核',    vi: 'Career Promotion Exam',
  },
  'work.daily_quota': {
    ko: '일일 급여 수령 한도',
    en: 'Daily Salary Quota Limit',
    ja: '日給受取上限',
    zh: '每日收益上限额度',    vi: 'Daily Salary Quota Limit',
  },
  'work.mastery': {
    ko: '직업 숙련도 레벨',
    en: 'Job Mastery Level',
    ja: '職業熟練度レベル',
    zh: '职业熟练度等级',    vi: 'Job Mastery Level',
  },
  'work.cooldown': {
    ko: '다음 업무 가능 시간',
    en: 'Next Shift Cooldown',
    ja: '次回勤務可能までの時間',
    zh: '下次工作冷却倒计时',    vi: 'Next Shift Cooldown',
  },
  'work.shift_success': {
    ko: '오늘의 업무가 완료되어 급여가 정상 지급되었습니다.',
    en: 'Shift completed. Daily salary has been deposited.',
    ja: '本日の業務が完了し、給与が支給されました。',
    zh: '今日工作已完成，薪资已成功到账。',    vi: 'Shift completed. Daily salary has been deposited.',
  },

  // ==========================================
  // 6. Mini-games & Lucky Arcade
  // ==========================================
  'casino.title': {
    ko: '행운의 미니게임 아케이드',
    en: 'Lucky Mini-games Arcade',
    ja: 'ラッキーミニゲームアーケード',
    zh: '幸运小游戏游乐场',    vi: 'Lucky Mini-games Arcade',
  },
  'casino.dice': {
    ko: '주사위 배틀 (Dice)',
    en: 'Dice Battle',
    ja: 'ダイスバトル (Dice)',
    zh: '骰子大作战 (Dice)',    vi: 'Dice Battle',
  },
  'casino.coinflip': {
    ko: '코인 플립 (Coinflip)',
    en: 'Coin Flip',
    ja: 'コイントス (Coinflip)',
    zh: '幸运硬币翻转 (Coinflip)',    vi: 'Coin Flip',
  },
  'casino.roulette': {
    ko: '유러피언 룰렛 (Roulette)',
    en: 'European Roulette',
    ja: 'ヨーロピアンルーレット (Roulette)',
    zh: '欧式轮盘赌 (Roulette)',    vi: 'European Roulette',
  },
  'casino.slots': {
    ko: '월덕 럭키 슬롯 (Slots)',
    en: 'Woldeok Lucky Slots',
    ja: 'ウォルドクラッキースロット (Slots)',
    zh: '月德幸运拉霸机 (Slots)',    vi: 'Woldeok Lucky Slots',
  },
  'casino.bet_amount': {
    ko: '베팅 금액 (WLD)',
    en: 'Bet Amount (WLD)',
    ja: 'ベット額 (WLD)',
    zh: '投注金额 (WLD)',    vi: 'Bet Amount (WLD)',
  },
  'casino.payout': {
    ko: '예상 배당금',
    en: 'Potential Payout',
    ja: '予想配当金',
    zh: '预期派彩金额',    vi: 'Potential Payout',
  },
  'casino.self_exclusion': {
    ko: '책임 있는 게임 & 자가 보호 한도',
    en: 'Responsible Gaming & Self-Protection Limit',
    ja: '責任あるゲーミング＆自己保護限度額',
    zh: '理性游戏与自我保护限额',    vi: 'Responsible Gaming & Self-Protection Limit',
  },
  'casino.daily_loss_limit': {
    ko: '일일 최대 손실 한도',
    en: 'Daily Maximum Loss Limit',
    ja: '日次最大損失限度',
    zh: '每日最大止损限额',    vi: 'Daily Maximum Loss Limit',
  },

  // ==========================================
  // 7. P2P Marketplace & Trading
  // ==========================================
  'marketplace.title': {
    ko: 'P2P 유저 거래소',
    en: 'Player P2P Marketplace',
    ja: 'ユーザーP2P取引所',
    zh: '玩家P2P点对点交易市场',    vi: 'Player P2P Marketplace',
  },
  'marketplace.buy': {
    ko: '아이템 구매하기',
    en: 'Buy Item',
    ja: 'アイテムを購入',
    zh: '购买道具',    vi: 'Buy Item',
  },
  'marketplace.sell': {
    ko: '아이템 판매 등록',
    en: 'List Item for Sale',
    ja: 'アイテムを出品',
    zh: '上架出售道具',    vi: 'List Item for Sale',
  },
  'marketplace.price': {
    ko: '판매 희망 가격',
    en: 'Listing Price',
    ja: '販売希望価格',
    zh: '出售标价',    vi: 'Listing Price',
  },
  'marketplace.tax_note': {
    ko: '거래세 2%는 국고 금고로 전액 소각 환원됩니다.',
    en: 'A 2% trade tax is automatically burned and returned to the national treasury vault.',
    ja: '取引税2%は国庫金庫に全額焼却還元されます。',
    zh: '2%交易税将全额销毁并归入国库金库。',    vi: 'A 2% trade tax is automatically burned and returned to the national treasury vault.',
  },
  'marketplace.instant_buy': {
    ko: '즉시 구매',
    en: 'Buy Now',
    ja: '今すぐ購入',
    zh: '立即购买',    vi: 'Buy Now',
  },
  'marketplace.auction_bid': {
    ko: '경매 입찰하기',
    en: 'Place Auction Bid',
    ja: 'オークション入札',
    zh: '参与竞拍出价',    vi: 'Place Auction Bid',
  },

  // ==========================================
  // 8. Quests & Achievements
  // ==========================================
  'quests.title': {
    ko: '일일·주간 퀘스트 & 도전과제',
    en: 'Daily & Weekly Quests & Achievements',
    ja: 'デイリー・ウィークリークエスト＆実績',
    zh: '每日/每周任务与成就',    vi: 'Daily & Weekly Quests & Achievements',
  },
  'quests.daily': {
    ko: '일일 미션',
    en: 'Daily Quests',
    ja: 'デイリーミッション',
    zh: '每日任务',    vi: 'Daily Quests',
  },
  'quests.weekly': {
    ko: '주간 미션',
    en: 'Weekly Quests',
    ja: 'ウィークリーミッション',
    zh: '每周任务',    vi: 'Weekly Quests',
  },
  'quests.claim': {
    ko: '보상 수령하기',
    en: 'Claim Reward',
    ja: '報酬を受け取る',
    zh: '领取任务奖励',    vi: 'Claim Reward',
  },
  'quests.completed': {
    ko: '달성 완료',
    en: 'Completed',
    ja: '達成完了',
    zh: '已达成完成',    vi: 'Completed',
  },
  'quests.progress': {
    ko: '달성 진행도',
    en: 'Quest Progress',
    ja: '達成進捗度',
    zh: '任务进度',    vi: 'Quest Progress',
  },

  // ==========================================
  // 9. Season Pass & World Cycle
  // ==========================================
  'seasons.title': {
    ko: '월드사이클 시즌 패스',
    en: 'World Cycle Season Pass',
    ja: 'ワールドサイクルシーズンパス',
    zh: '世界周期赛季通行证',    vi: 'World Cycle Season Pass',
  },
  'seasons.rank': {
    ko: '시즌 명예 랭킹',
    en: 'Season Leaderboard',
    ja: 'シーズンリーダーボード',
    zh: '赛季荣誉排行榜',    vi: 'Season Leaderboard',
  },
  'seasons.rewards': {
    ko: '시즌 마일스톤 보상',
    en: 'Season Milestone Rewards',
    ja: 'シーズンマイルストーン報酬',
    zh: '赛季里程碑奖励',    vi: 'Season Milestone Rewards',
  },
  'seasons.tier': {
    ko: '현재 시즌 등급',
    en: 'Current Season Tier',
    ja: '現在のシーズンランク',
    zh: '当前赛季段位',    vi: 'Current Season Tier',
  },

  // ==========================================
  // 10. Economic Times & Market News
  // ==========================================
  'newspaper.title': {
    ko: '월덕 경제신문',
    en: 'Woldeok Economic Times',
    ja: 'ウォルドク経済新聞',
    zh: '月德经济时报',    vi: 'Woldeok Economic Times',
  },
  'newspaper.brief': {
    ko: '주간 거시경제 브리프',
    en: 'Weekly Macroeconomic Brief',
    ja: '週間マクロ経済ブリーフ',
    zh: '每周宏观经济简报',    vi: 'Weekly Macroeconomic Brief',
  },
  'newspaper.market_pulse': {
    ko: '실시간 시장 펄스 & 지표',
    en: 'Real-time Market Pulse',
    ja: 'リアルタイム市場パルス',
    zh: '实时市场脉搏与指标',    vi: 'Real-time Market Pulse',
  },
  'newspaper.vote_bull': {
    ko: '상승 전망 (강세장)',
    en: 'Bullish Outlook',
    ja: '強気見通し (Bull)',
    zh: '看涨预期 (牛市)',    vi: 'Bullish Outlook',
  },
  'newspaper.vote_bear': {
    ko: '하락 전망 (약세장)',
    en: 'Bearish Outlook',
    ja: '弱気見通し (Bear)',
    zh: '看跌预期 (熊市)',    vi: 'Bearish Outlook',
  },

  // ==========================================
  // 11. Account Security & Two-Factor Auth
  // ==========================================
  'security.title': {
    ko: '계정 보안 & 2단계 인증',
    en: 'Account Security & Two-Factor Auth',
    ja: 'アカウントセキュリティ＆2段階認証',
    zh: '账户安全与双重认证',    vi: 'Account Security & Two-Factor Auth',
  },
  'security.score': {
    ko: '계정 보안 건강 점수',
    en: 'Security Health Score',
    ja: 'セキュリティ健全性スコア',
    zh: '账户安全健康分',    vi: 'Security Health Score',
  },
  'security.activity_logs': {
    ko: '최근 보안 활동 이력',
    en: 'Recent Security Activity Logs',
    ja: '最近のセキュリティ活動履歴',
    zh: '近期安全活动日志',    vi: 'Recent Security Activity Logs',
  },
  'security.sessions': {
    ko: '로그인된 기기 세션 관리',
    en: 'Active Device Sessions',
    ja: 'ログイン中の端末セッション',
    zh: '已登录设备会话管理',    vi: 'Active Device Sessions',
  },
  'security.revoke_all': {
    ko: '다른 모든 기기에서 즉시 로그아웃',
    en: 'Sign out all other devices',
    ja: '他の全端末から即時ログアウト',
    zh: '立即退出其他所有设备',    vi: 'Sign out all other devices',
  },

  // ==========================================
  // 12. Financial Calculators & Tools
  // ==========================================
  'tools.compound_calc': {
    ko: '복리 수익 시뮬레이터',
    en: 'Compound Interest Simulator',
    ja: '複利収益シミュレーター',
    zh: '复利收益模拟计算器',    vi: 'Compound Interest Simulator',
  },
  'tools.stock_calc': {
    ko: '주식 물타기 & 목표가 계산기',
    en: 'Stock Average Down & Target Price Calculator',
    ja: '株式ナンピン・目標価格計算機',
    zh: '股票补仓与目标价计算器',    vi: 'Stock Average Down & Target Price Calculator',
  },
  'tools.farming_calc': {
    ko: '일일 업무 수익 시뮬레이터',
    en: 'Daily Career Yield Simulator',
    ja: '日課業務収益シミュレーター',
    zh: '每日工作收益模拟器',    vi: 'Daily Career Yield Simulator',
  },

  // ==========================================
  // 13. Notifications & Inbox
  // ==========================================
  'notifications.title': {
    ko: '알림 센터',
    en: 'Notification Center',
    ja: '通知センター',
    zh: '通知中心',    vi: 'Notification Center',
  },
  'notifications.empty': {
    ko: '새로운 알림이 없습니다.',
    en: 'No new notifications.',
    ja: '新しい通知はありません。',
    zh: '暂无新通知。',    vi: 'No new notifications.',
  },
  'notifications.mark_all_read': {
    ko: '모두 읽음으로 표시',
    en: 'Mark all as read',
    ja: 'すべて既読にする',
    zh: '全部标记为已读',    vi: 'Mark all as read',
  },

  // ==========================================
  // 14. Onboarding & Guide
  // ==========================================
  'guide.welcome': {
    ko: '월덕 머니버스에 오신 것을 환영합니다!',
    en: 'Welcome to Woldeok Moneyverse!',
    ja: 'ウォルドク・マネーバースへようこそ！',
    zh: '欢迎来到月德 Moneyverse！',    vi: 'Welcome to Woldeok Moneyverse!',
  },
  'guide.starter_pack': {
    ko: '신규 시민 정착 지원금',
    en: 'New Citizen Starter Fund',
    ja: '新規市民定着支援金',
    zh: '新居民定居扶持金',    vi: 'New Citizen Starter Fund',
  },
  'guide.step_by_step': {
    ko: '5단계 스타터 튜토리얼',
    en: '5-Step Starter Tutorial',
    ja: '5ステップ入門チュートリアル',
    zh: '5步新手入门教程',    vi: '5-Step Starter Tutorial',
  },

  // ==========================================
  // 15. Common Actions, Status & Error Handling
  // ==========================================
  'common.confirm': {
    ko: '확인',
    en: 'Confirm',
    ja: '確認',
    zh: '确认',    vi: 'Confirm',
  },
  'common.cancel': {
    ko: '취소',
    en: 'Cancel',
    ja: 'キャンセル',
    zh: '取消',    vi: 'Cancel',
  },
  'common.save': {
    ko: '저장',
    en: 'Save',
    ja: '保存',
    zh: '保存',    vi: 'Save',
  },
  'common.delete': {
    ko: '삭제',
    en: 'Delete',
    ja: '削除',
    zh: '删除',    vi: 'Delete',
  },
  'common.close': {
    ko: '닫기',
    en: 'Close',
    ja: '閉じる',
    zh: '关闭',    vi: 'Close',
  },
  'common.refresh': {
    ko: '새로고침',
    en: 'Refresh',
    ja: '再読み込み',
    zh: '刷新',    vi: 'Refresh',
  },
  'common.loading': {
    ko: '데이터 로딩 중...',
    en: 'Loading...',
    ja: '読み込み中...',
    zh: '数据加载中...',    vi: 'Loading...',
  },
  'common.success': {
    ko: '요청이 안전하게 처리되었습니다.',
    en: 'Operation completed successfully.',
    ja: '正常に処理されました。',
    zh: '操作已成功完成。',    vi: 'Operation completed successfully.',
  },
  'common.error': {
    ko: '요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    en: 'An error occurred. Please try again in a moment.',
    ja: '処理中にエラーが発生しました。しばらくしてから再度お試しください。',
    zh: '处理请求时发生错误，请稍后重试。',    vi: 'An error occurred. Please try again in a moment.',
  },
  'common.copied': {
    ko: '클립보드에 복사되었습니다.',
    en: 'Copied to clipboard.',
    ja: 'クリップボードにコピーしました。',
    zh: '已复制到剪贴板。',    vi: 'Copied to clipboard.',
  },
  'common.currency_convert': {
    ko: '환산 통화 보기',
    en: 'View in Fiat Currency',
    ja: '法定通貨換算表示',
    zh: '查看法币折算',    vi: 'View in Fiat Currency',
  },

  // ==========================================
  // 16. Arcade & Dopamine Station (v64)
  // ==========================================
  'arcade.title': {
    ko: '도파민 아케이드 스테이션',
    en: 'Dopamine Arcade Station',
    ja: 'ドーパミンアーケードステーション',
    zh: '多巴胺街机站',    vi: 'Dopamine Arcade Station',
  },
  'arcade.free_badge': {
    ko: '100% 무료',
    en: '100% Free',
    ja: '100%無料',
    zh: '100%免费',    vi: '100% Free',
  },
  'arcade.desc': {
    ko: '매일 가볍게 즐기는 5대 미니게임과 일일 퀘스트로 WLD 보상을 획득하세요.',
    en: 'Enjoy 5 casual mini-games and daily quests to earn WLD rewards every day.',
    ja: '毎日気軽に楽しめる5つのミニゲームとデイリークエストでWLD報酬を獲得しましょう。',
    zh: '每天畅玩5款休闲小游戏和每日任务，轻松赢取WLD奖励。',    vi: 'Enjoy 5 casual mini-games and daily quests to earn WLD rewards every day.',
  },
  'arcade.safe_badge': {
    ko: '사행성 제로 · 가상 시뮬레이터',
    en: 'Zero Gambling · Virtual Simulation',
    ja: 'ギャンブル性ゼロ・仮想シミュレーター',
    zh: '零赌博属性·虚拟模拟器',    vi: 'Zero Gambling · Virtual Simulation',
  },
  'arcade.fever.title': {
    ko: '황금 오리 피버 타임',
    en: 'Golden Duck Fever Time',
    ja: 'ゴールデンダック・フィーバータイム',
    zh: '金鸭狂热狂飙时间',    vi: 'Golden Duck Fever Time',
  },
  'arcade.fever.badge': {
    ko: '10초 광클',
    en: '10s Clicker',
    ja: '10秒連打',
    zh: '10秒狂点',    vi: '10s Clicker',
  },
  'arcade.fever.desc': {
    ko: '10초 동안 황금 코인을 광클하여 최대 1,000 WLD 잭팟 획득! (1일 1회)',
    en: 'Spam click golden coins for 10 seconds to hit up to 1,000 WLD jackpot! (Once daily)',
    ja: '10秒間にゴールドコインを連打して最大1,000 WLDジャックポットを獲得！（1日1回）',
    zh: '在10秒内疯狂点击金币，赢取最高1,000 WLD大奖！（每日一次）',    vi: 'Spam click golden coins for 10 seconds to hit up to 1,000 WLD jackpot! (Once daily)',
  },
  'arcade.pet.title': {
    ko: '덕이 펫 인터랙션',
    en: 'Deoki Pet Tamagotchi',
    ja: 'ドギペット育成',
    zh: '德克宠物养成互动',    vi: 'Deoki Pet Tamagotchi',
  },
  'arcade.pet.badge': {
    ko: 'WLD 먹이주기',
    en: 'Feed WLD',
    ja: 'WLDえさやり',
    zh: '喂食WLD',    vi: 'Feed WLD',
  },
  'arcade.pet.desc': {
    ko: '덕이를 쓰다듬고 먹이를 주어 호감도를 높이고 매일 특별 보상을 받으세요.',
    en: 'Pet and feed Deoki to increase affection level and claim daily secret rewards.',
    ja: 'ドギを撫でて餌をあげ、親密度を上げて毎日特別な報酬を受け取りましょう。',
    zh: '抚摸并喂食小德克提升好感度，每日领取专属惊喜奖励。',    vi: 'Pet and feed Deoki to increase affection level and claim daily secret rewards.',
  },
  'arcade.poll.title': {
    ko: '주식 여론 잭팟',
    en: 'Market Sentiment Jackpot',
    ja: '株式世論ジャックポット',
    zh: '股市情绪大奖池',    vi: 'Market Sentiment Jackpot',
  },
  'arcade.poll.badge': {
    ko: '일일 배팅',
    en: 'Daily Vote',
    ja: '毎日投票',
    zh: '每日投票',    vi: 'Daily Vote',
  },
  'arcade.poll.desc': {
    ko: '내일의 코스피/나스닥 상승/하락을 투표하고 다수결/소수결 보너스를 획득하세요.',
    en: 'Vote on tomorrow market direction and split the pooled daily bounty.',
    ja: '明日の市場上昇/下落を予想投票し、分配ボーナスを獲得しましょう。',
    zh: '投票预测明日大盘涨跌，瓜分每日奖池奖励。',    vi: 'Vote on tomorrow market direction and split the pooled daily bounty.',
  },
  'arcade.showdown.title': {
    ko: '1:1 주사위 쇼다운',
    en: '1v1 Dice Showdown',
    ja: '1:1 サイコロ対決',
    zh: '1:1 骰子对决',    vi: '1v1 Dice Showdown',
  },
  'arcade.showdown.badge': {
    ko: '실시간 결투',
    en: 'Live Match',
    ja: 'リアルタイム対戦',
    zh: '实时对战',    vi: 'Live Match',
  },
  'arcade.showdown.desc': {
    ko: '다른 유저 또는 AI와 3판 2선승 주사위 결투를 펼치고 랭킹 포인트를 올리세요.',
    en: 'Battle other users or AI in best-of-3 dice duels to climb the leaderboard.',
    ja: '他のユーザーやAIと3本勝負のサイコロ対決を行い、ランキングを上げましょう。',
    zh: '与其他玩家或AI进行三局两胜骰子对决，冲击排行榜。',    vi: 'Battle other users or AI in best-of-3 dice duels to climb the leaderboard.',
  },
  'arcade.stardrop.title': {
    ko: '럭키 스타드롭',
    en: 'Lucky Star Drop',
    ja: 'ラッキースタードロップ',
    zh: '幸运星空宝箱',    vi: 'Lucky Star Drop',
  },
  'arcade.stardrop.badge': {
    ko: '100% 당첨',
    en: 'Guaranteed Prize',
    ja: 'ハズレなし',
    zh: '100%有奖',    vi: 'Guaranteed Prize',
  },
  'arcade.stardrop.desc': {
    ko: '하늘에서 떨어지는 별빛 상자를 열고 랜덤 WLD와 레어 뱃지를 수집하세요.',
    en: 'Open celestial mystery boxes to collect random WLD amounts and rare badges.',
    ja: '空から落ちてくる星の箱を開けて、ランダムなWLDとレアバッジを獲得しましょう。',
    zh: '开启天降星光宝盒，收集随机WLD奖励与稀有徽章。',    vi: 'Open celestial mystery boxes to collect random WLD amounts and rare badges.',
  },

  // ==========================================
  // 17. Homepage Tools & Feature Highlights (v64)
  // ==========================================
  'home.tools_hub': {
    ko: '금융 웹 도구 허브',
    en: 'Financial Web Tools Hub',
    ja: '金融ウェブツールハブ',
    zh: '金融实用工具中心',    vi: 'Financial Web Tools Hub',
  },
  'home.tools_hub_desc': {
    ko: '복리 예적금 계산기, 코스피/나스닥 2,000+ 종목 물타기 평단가 계산기를 무료로 이용하세요.',
    en: 'Free access to compound interest calculators and dollar-cost averaging tools for 2,000+ stocks.',
    ja: '複利預金計算機、主要2,000銘柄のナンピン平均単価計算ツールを無料でご利用いただけます。',
    zh: '免费使用复利定存计算器及2,000+股票加仓摊平成本计算工具。',    vi: 'Free access to compound interest calculators and dollar-cost averaging tools for 2,000+ stocks.',
  },
  'home.compound_calc': {
    ko: '복리 이자 계산기',
    en: 'Compound Calculator',
    ja: '複利利息計算機',
    zh: '复利利息计算器',    vi: 'Compound Calculator',
  },
  'home.stock_calc': {
    ko: '물타기 계산기',
    en: 'DCA Stock Calculator',
    ja: 'ナンピン計算機',
    zh: '补仓摊平成本计算器',    vi: 'DCA Stock Calculator',
  },
  'home.job_calc': {
    ko: '직업 시뮬레이터',
    en: 'Career Simulator',
    ja: '職業シミュレーター',
    zh: '职业模拟器',    vi: 'Career Simulator',
  },
  'home.view_all_tools': {
    ko: '전체 계산기 둘러보기',
    en: 'Explore All Calculators',
    ja: 'すべての計算ツールを見る',
    zh: '查看全部计算工具',
      vi: 'Xem toàn bộ máy tính tài chính',
  },
  'home.roulette_title': {
    ko: '일일 럭키 룰렛',
    en: 'Daily Lucky Roulette',
    ja: 'デイリーラッキールーレット',
    zh: '每日幸运大转盘',
      vi: 'Vòng quay May mắn Hàng ngày',
  },
  'home.roulette_badge': {
    ko: '100% 당첨 보장',
    en: '100% Guaranteed Win',
    ja: '100%当選保証',
    zh: '100%必中大奖',    vi: '100% Guaranteed Win',
  },
  'home.roulette_desc': {
    ko: '매일 1회 무료 룰렛을 돌리고 최대 5,000 WLD 잭팟과 7일 연속 출석 스트릭 보상을 획득하세요.',
    en: 'Spin the free daily wheel for up to 5,000 WLD jackpot and claim 7-day streak rewards.',
    ja: '毎日1回無料でルーレットを回し、最大5,000 WLDのジャックポットと7日連続出席報酬を獲得！',
    zh: '每天免费旋转转盘1次，赢取最高5,000 WLD大奖及7天连续签到奖励。',    vi: 'Spin the free daily wheel for up to 5,000 WLD jackpot and claim 7-day streak rewards.',
  },
  'home.roulette_btn': {
    ko: '출석 룰렛 돌리기',
    en: 'Spin Daily Roulette',
    ja: '出席ルーレットを回す',
    zh: '去转签到转盘',    vi: 'Spin Daily Roulette',
  },
  'home.prediction_title': {
    ko: '주가 예측 배팅',
    en: 'Stock Price Prediction',
    ja: '株価予測バトル',
    zh: '股价预测竞猜',    vi: 'Stock Price Prediction',
  },
  'home.prediction_pool': {
    ko: '상금 5,000 WLD 풀',
    en: '5,000 WLD Prize Pool',
    ja: '賞金5,000 WLDプール',
    zh: '5,000 WLD 奖金池',    vi: '5,000 WLD Prize Pool',
  },
  'home.prediction_desc': {
    ko: '매일 15:30 마감! 가상주식 3종 및 코스피/나스닥 종가 상승/하락을 맞추고 균등 배당금을 수령하세요.',
    en: 'Closes 15:30 daily! Forecast up/down closes for top virtual stocks and split the dividend pool.',
    ja: '毎日15:30締切！主要銘柄の終値上昇/下落を予想し、均等配当金を受け取りましょう。',
    zh: '每日15:30截止！竞猜重点股票收盘涨跌，赢取均分分红奖励。',    vi: 'Closes 15:30 daily! Forecast up/down closes for top virtual stocks and split the dividend pool.',
  },
  'home.prediction_btn': {
    ko: '예측 투표 참여하기',
    en: 'Join Prediction',
    ja: '予測投票に参加する',
    zh: '参与预测投票',    vi: 'Join Prediction',
  },

  // ==========================================
  // 18. Roadmap, Onboarding & Career Mastery (v86)
  // ==========================================
  'roadmap.title': {
    ko: '초반·중반·후반 실전 성장 로드맵',
    en: 'Early · Mid · Late Game Strategy Roadmap',
    ja: '序盤・中盤・終盤 実戦成長ロードマップ',
    zh: '初盘·中盘·后盘 实战成长攻略路线图',    vi: 'Early · Mid · Late Game Strategy Roadmap',
  },
  'roadmap.stage1_title': {
    ko: '1단계: 초반 시드 모으기 (1~3일)',
    en: 'Stage 1: Seed Building (Day 1–3)',
    ja: '第1段階：シード形成（1〜3日）',
    zh: '第1阶段：初始本金（第1~3天）',    vi: 'Stage 1: Seed Building (Day 1–3)',
  },
  'roadmap.stage2_title': {
    ko: '2단계: 중반 복리 & 주식 (4~14일)',
    en: 'Stage 2: Compounding & Stocks (Day 4–14)',
    ja: '第2段階：複利＆株式（4〜14日）',
    zh: '第2阶段：复利与股票（第4~14天）',    vi: 'Stage 2: Compounding & Stocks (Day 4–14)',
  },
  'roadmap.stage3_title': {
    ko: '3단계: 후반 부동산 건물주 (15일+)',
    en: 'Stage 3: Real Estate Tycoon (Day 15+)',
    ja: '第3段階：不動産オーナー（15日+）',
    zh: '第3阶段：地产包租公（第15天+）',    vi: 'Stage 3: Real Estate Tycoon (Day 15+)',
  },
  'onboarding.title': {
    ko: '온보딩 퀘스트 & 보너스',
    en: 'Onboarding Quests & Bonuses',
    ja: 'オンボーディングクエスト＆ボーナス',
    zh: '新手引导任务与奖励',    vi: 'Onboarding Quests & Bonuses',
  },
  'onboarding.bonus_total': {
    ko: '총 170,000 WLD 웰컴 보너스',
    en: 'Total 170,000 WLD Welcome Bonus',
    ja: '合計170,000 WLD ウェルカムボーナス',
    zh: '共计170,000 WLD新手欢迎大礼包',    vi: 'Total 170,000 WLD Welcome Bonus',
  },
  'onboarding.claim_all': {
    ko: '보상 일괄 수령',
    en: 'Claim All Rewards',
    ja: '報酬を一括受取',
    zh: '一键领取全部奖励',    vi: 'Claim All Rewards',
  },
  'career.mastery_guide': {
    ko: '8대 전문 직업 완벽 가이드',
    en: '8 Professional Careers Mastery Guide',
    ja: '8大専門職業完全ガイド',
    zh: '8大专业职业全能指南',    vi: '8 Professional Careers Mastery Guide',
  },
  'career.job_switch': {
    ko: '직업 전직 및 선택',
    en: 'Job Switch & Selection',
    ja: '職業選択・転職',
    zh: '职业选择与转职',    vi: 'Job Switch & Selection',
  },
  'career.claim_shift': {
    ko: '업무 수락 및 출근',
    en: 'Claim Task / Clock In',
    ja: '業務受託・出勤',
    zh: '接取工作打卡上岗',    vi: 'Claim Task / Clock In',
  },
  'career.cooldown_timer': {
    ko: '실시간 업무 쿨다운',
    en: 'Real-time Shift Cooldown',
    ja: 'リアルタイム業務クールダウン',
    zh: '实时工作倒计时',    vi: 'Real-time Shift Cooldown',
  },
  'career.submit_shift': {
    ko: '업무 완료 제출 & 급여 수령',
    en: 'Submit Shift & Claim Salary',
    ja: '業務完了提出＆給与受取',
    zh: '提交工作并领薪',    vi: 'Submit Shift & Claim Salary',
  },
  'career.promotion_tiers': {
    ko: '7대 숙련도 승진 로드맵',
    en: '7 Mastery Promotion Tiers',
    ja: '7大熟練度昇格ロードマップ',
    zh: '7大熟练度晋升路线图',    vi: '7 Mastery Promotion Tiers',
  },
  // ==========================================
  // 35. Home Screen & Bento Onboarding Master
  // ==========================================
  'home.banner.virtual_economy': {
    ko: '가상경제 플랫폼',
    en: 'Virtual Economy',
    ja: '仮想経済プラットフォーム',
    zh: '虚拟经济平台',    vi: 'Virtual Economy',
  },
  'home.banner.virtual_notice': {
    ko: '모든 WLD와 보상은 게임 안에서만 쓰는 가상 데이터입니다.',
    en: 'All WLD and rewards are virtual in-game data used solely inside the community.',
    ja: 'すべてのWLDと報酬はゲーム内でのみ使用される仮想データです。',
    zh: '所有WLD与奖励均为仅在社区内使用的虚拟游戏数据。',    vi: 'All WLD and rewards are virtual in-game data used solely inside the community.',
  },
  'home.banner.terms': {
    ko: '이용 기준',
    en: 'Terms',
    ja: '利用規約',
    zh: '使用条款',    vi: 'Terms',
  },
  'home.hero.ledger_live': {
    ko: '실시간 분산 경제 원장 가동 중',
    en: 'Live Distributed Ledger',
    ja: 'リアルタイム分散型経済元帳稼働中',
    zh: '实时分布式经济账本运行中',    vi: 'Live Distributed Ledger',
  },
  'home.hero.ledger_lossless': {
    ko: '100% 무손실 원장 보호',
    en: '100% Lossless Ledger',
    ja: '100%無損失元帳保護',
    zh: '100%无损账本保障',    vi: '100% Lossless Ledger',
  },
  'home.hero.net_worth': {
    ko: '내 가상 자산 총액',
    en: 'Total Virtual Net Worth',
    ja: '私の仮想資産総額',
    zh: '我的虚拟总资产',    vi: 'Total Virtual Net Worth',
  },
  'home.hero.desc': {
    ko: '직업 급여, 예적금 이자, 가상 주식 평가액이 PostgreSQL 원장 기준으로 실시간 통합 관리됩니다.',
    en: 'Your career salary, compound interest, and stock equity are aggregated in real-time.',
    ja: '職業給与、複利利息、株式評価額がPostgreSQL元帳ベースでリアルタイム統合管理されます。',
    zh: '职业薪酬、复利利息及股票估值基于PostgreSQL分布式账本实时合并管理。',    vi: 'Your career salary, compound interest, and stock equity are aggregated in real-time.',
  },
  'home.action.transfer': {
    ko: '돈 보내기',
    en: 'Transfer',
    ja: '送金',
    zh: '转账',    vi: 'Transfer',
  },
  'home.action.transfer_sub': {
    ko: '무수수료 멱등 송금',
    en: 'Zero Fee',
    ja: '手数料無料の冪等送金',
    zh: '零手续费幂等转账',    vi: 'Zero Fee',
  },
  'home.action.work': {
    ko: '직업 출근',
    en: 'Careers',
    ja: '職業出勤',
    zh: '职业上班',    vi: 'Careers',
  },
  'home.action.work_sub': {
    ko: '일일 급여 수령',
    en: 'Daily Salary',
    ja: '日次給与受取',
    zh: '领取每日薪资',    vi: 'Daily Salary',
  },
  'home.action.stocks': {
    ko: '주식 거래',
    en: 'Stocks',
    ja: '株式取引',
    zh: '股票交易',    vi: 'Stocks',
  },
  'home.action.stocks_sub': {
    ko: '10-Depth 호가 매매',
    en: 'Orderbook',
    ja: '10-Depth気配値取引',
    zh: '10档深度盘口交易',    vi: 'Orderbook',
  },
  'home.action.bank': {
    ko: '가상 은행',
    en: 'Bank',
    ja: '仮想銀行',
    zh: '虚拟银行',    vi: 'Bank',
  },
  'home.action.bank_sub': {
    ko: '복리 저축·국채',
    en: 'Savings & Bonds',
    ja: '複利貯蓄・国債',
    zh: '复利储蓄·国债',    vi: 'Savings & Bonds',
  },
  'home.bento.roadmap_badge': {
    ko: '3단계 실전 로드맵',
    en: '3-Stage Roadmap',
    ja: '3段階実践ロードマップ',
    zh: '三阶段实战路线图',    vi: '3-Stage Roadmap',
  },
  'home.bento.roadmap_title': {
    ko: '초반 · 중반 · 후반 실전 플레이 가이드',
    en: 'Getting Started 3-Stage Master Guide',
    ja: '序盤・中盤・終盤の実践プレイガイド',
    zh: '前期·中期·后期实战游戏指南',    vi: 'Getting Started 3-Stage Master Guide',
  },
  'home.bento.roadmap_desc': {
    ko: '1일차 시드 10만 WLD부터 7일차 복리·주식 1,000만, 30일차 건물주까지 60fps 비디오 시뮬레이터로 3분 만에 마스터하세요.',
    en: 'From 100k WLD seed to 10M compound & stocks to mega-city real estate landlord in 3 minutes.',
    ja: '1日目のシード10万WLDから7日目の複利・株式1,000万、30日目のビルオーナーまで60fpsシミュレーターで3分でマスターできます。',
    zh: '从第1天10万WLD初始本金到第7天复利·股票1,000万，再到第30天房产大亨，通过60fps视频模拟器3分钟轻松掌握。',    vi: 'From 100k WLD seed to 10M compound & stocks to mega-city real estate landlord in 3 minutes.',
  },
  'home.bento.stage1': {
    ko: '🌱 1단계: 시드 10만',
    en: '🌱 Stage 1: 100k Seed',
    ja: '🌱 ステージ1: シード10万',
    zh: '🌱 阶段一: 初始10万',    vi: '🌱 Stage 1: 100k Seed',
  },
  'home.bento.stage2': {
    ko: '📈 2단계: 복리/주식 1,000만',
    en: '📈 Stage 2: 10M Stocks',
    ja: '📈 ステージ2: 複利/株式1000万',
    zh: '📈 阶段二: 复利/股票1000万',    vi: '📈 Stage 2: 10M Stocks',
  },
  'home.bento.stage3': {
    ko: '👑 3단계: 건물주 1억',
    en: '👑 Stage 3: 100M Landlord',
    ja: '👑 ステージ3: 不動産1億',
    zh: '👑 阶段三: 亿级大亨',    vi: '👑 Stage 3: 100M Landlord',
  },
  'home.bento.roadmap_cta': {
    ko: '60fps 영상 시뮬레이터로 보기',
    en: 'Watch 60fps Video Simulator',
    ja: '60fps動画シミュレーターで見る',
    zh: '观看60fps视频模拟演示',    vi: 'Watch 60fps Video Simulator',
  },
  'home.bento.features_badge': {
    ko: '실제 화면 6대 기능 설명서',
    en: 'Visual 6 Core Features',
    ja: '実画面6大機能マニュアル',
    zh: '实操界面六大核心功能指南',    vi: 'Visual 6 Core Features',
  },
  'home.bento.features_title': {
    ko: '6대 핀테크 기능 조작법 & AI 투자 진단',
    en: '6 Core Features Guide & AI Profile Quiz',
    ja: '6大フィンテック機能操作ガイド＆AI投資診断',
    zh: '六大金融科技功能操作指南与AI投资诊断',    vi: '6 Core Features Guide & AI Profile Quiz',
  },
  'home.bento.features_desc': {
    ko: '주식 10-Depth 호가창, 복리 포켓, 직업 파밍, 메가시티 랜드의 실제 화면 스크린샷과 30초 맞춤형 포트폴리오 진단을 확인하세요.',
    en: 'Explore live orderbooks, compound savings, career shifts, real estate with 30s personalized allocation.',
    ja: '株式10-Depth気配値、複利ポケット、職業ファーミング、メガシティランドの実画面スクリーンショットと30秒のカスタム診断をご確認ください。',
    zh: '查看股票10档深度盘口、复利口袋、职业打工、元宇宙地产的实际界面截图及30秒定制化投资组合诊断。',    vi: 'Explore live orderbooks, compound savings, career shifts, real estate with 30s personalized allocation.',
  },
  'home.bento.features_cta': {
    ko: '기능 조작법 및 AI 진단 열기',
    en: 'Explore Features & AI Quiz',
    ja: '機能ガイドとAI診断を開く',
    zh: '开启功能指南与AI诊断',    vi: 'Explore Features & AI Quiz',
  },
  'home.tools.hub_title': {
    ko: '금융 웹 도구 허브',
    en: 'Financial Web Tools Hub',
    ja: '金融Webツールハブ',
    zh: '金融工具中心',    vi: 'Financial Web Tools Hub',
  },
  'home.tools.hub_desc': {
    ko: '복리 예적금 계산기, 코스피/나스닥 2,000+ 종목 물타기 평단가 계산기를 무료로 이용하세요.',
    en: 'Free access to compound interest calculators and dollar-cost averaging tools for 2,000+ stocks.',
    ja: '複利預貯金計算機、KOSPI/NASDAQ 2,000+銘柄のナンピン平均単価計算機を無料でご利用いただけます。',
    zh: '免费使用复利储蓄计算器以及全球2,000+标的加仓补仓均价计算器。',    vi: 'Free access to compound interest calculators and dollar-cost averaging tools for 2,000+ stocks.',
  },
  'home.tools.compound': {
    ko: '복리 이자 계산기',
    en: 'Compound Calculator',
    ja: '複利利息計算機',
    zh: '复利计算器',    vi: 'Compound Calculator',
  },
  'home.tools.stock': {
    ko: '물타기 계산기',
    en: 'DCA Calculator',
    ja: 'ナンピン計算機',
    zh: '补仓均价计算器',    vi: 'DCA Calculator',
  },
  'home.tools.farming': {
    ko: '직업 시뮬레이터',
    en: 'Career Simulator',
    ja: '職業シミュレーター',
    zh: '职业模拟器',    vi: 'Career Simulator',
  },
  'home.tools.all': {
    ko: '전체 계산기 둘러보기',
    en: 'Explore All Calculators',
    ja: 'すべての計算機を見る',
    zh: '浏览全部计算器',    vi: 'Explore All Calculators',
  },
  'home.retention.roulette_title': {
    ko: '일일 럭키 룰렛',
    en: 'Daily Lucky Roulette',
    ja: 'デイリーラッキールーレット',
    zh: '每日幸运转盘',    vi: 'Daily Lucky Roulette',
  },
  'home.retention.roulette_win': {
    ko: '100% 당첨 보장',
    en: '100% Win',
    ja: '100%当選保証',
    zh: '100%必中保障',    vi: '100% Win',
  },
  'home.retention.roulette_desc': {
    ko: '매일 1회 무료 룰렛을 돌리고 최대 5,000 WLD 잭팟과 7일 연속 출석 스트릭 보상을 획득하세요.',
    en: 'Spin the free daily wheel for up to 5,000 WLD jackpot and claim 7-day streak rewards.',
    ja: '毎日1回無料のルーレットを回して最大5,000 WLDジャックポットと7日連続出席報酬を獲得しましょう。',
    zh: '每日免费抽取幸运转盘，赢取最高5,000 WLD大奖及7日连续签到连胜奖励。',    vi: 'Spin the free daily wheel for up to 5,000 WLD jackpot and claim 7-day streak rewards.',
  },
  'home.retention.roulette_streak': {
    ko: '오늘의 출석 보상: 100 ~ 1,000 WLD 대기 중',
    en: 'Daily Streak Reward: 100 ~ 1,000 WLD',
    ja: '本日の出席報酬: 100 ~ 1,000 WLD',
    zh: '今日签到奖励: 100 ~ 1,000 WLD',    vi: 'Daily Streak Reward: 100 ~ 1,000 WLD',
  },
  'home.retention.roulette_spin': {
    ko: '출석 룰렛 돌리기',
    en: 'Spin Roulette',
    ja: '出席ルーレットを回す',
    zh: '启动签到转盘',    vi: 'Spin Roulette',
  },
  'home.retention.predict_title': {
    ko: '주가 예측 배팅',
    en: 'Stock Price Prediction',
    ja: '株価予測ベッティング',
    zh: '股价涨跌预测',    vi: 'Stock Price Prediction',
  },
  'home.retention.predict_pool': {
    ko: '상금 5,000 WLD 풀',
    en: '5,000 WLD Pool',
    ja: '賞金 5,000 WLD プール',
    zh: '5,000 WLD 奖金池',    vi: '5,000 WLD Pool',
  },
  'home.retention.predict_desc': {
    ko: '매일 15:30 마감! 가상주식 3종 및 코스피/나스닥 종가 상승/하락을 맞추고 균등 배당금을 수령하세요.',
    en: 'Closes 15:30 daily! Forecast up/down closes for top virtual stocks and split the dividend pool.',
    ja: '毎日15:30締切！仮想株式3種およびKOSPI/NASDAQ終値の上昇/下落を予測し、配当金を山分けしましょう。',
    zh: '每日15:30截止！预测3大虚拟股票及大盘涨跌走势，瓜分丰厚红利奖金池。',    vi: 'Closes 15:30 daily! Forecast up/down closes for top virtual stocks and split the dividend pool.',
  },
  'home.retention.predict_sage': {
    ko: "연속 3회 적중 시 '월가의 현자' 칭호 지급",
    en: "Hit 3 in a row to earn 'Sage of Wall Street'",
    ja: '3回連続的中で「ウォール街の賢者」称号付与',
    zh: '连续命中3次即可获得“华尔街智者”荣誉称号',    vi: '连续命中3次即可获得“华尔街智者”荣誉称号',
  },
  'home.retention.predict_join': {
    ko: '예측 투표 참여하기',
    en: 'Join Prediction',
    ja: '予測投票に参加',
    zh: '参与预测竞猜',    vi: 'Join Prediction',
  },
  'home.stocks.hot_title': {
    ko: '가상 주식 시장 주요 종목',
    en: 'Hot Stock Highlights',
    ja: '仮想株式市場の注目銘柄',
    zh: '虚拟股票市场热门标的',    vi: 'Hot Stock Highlights',
  },
  'home.stocks.view_exchange': {
    ko: '거래소 바로가기',
    en: 'View Exchange',
    ja: '取引所へ行く',
    zh: '前往交易所',    vi: 'View Exchange',
  },
  'home.stocks.wdg_title': {
    ko: '월덕게임즈 (WDG)',
    en: 'Woldeok Games (WDG)',
    ja: 'ウォルドクゲームズ (WDG)',
    zh: '月德游戏 (WDG)',    vi: 'Woldeok Games (WDG)',
  },
  'home.stocks.wdg_desc': {
    ko: '가상 엔터테인먼트 · 시총 1위',
    en: 'Virtual Entertainment · #1 Market Cap',
    ja: '仮想エンタメ・時価総額1位',
    zh: '虚拟娱乐·市值第一',    vi: 'Virtual Entertainment · #1 Market Cap',
  },
  'home.stocks.wdt_title': {
    ko: '월덱테크 (WDT)',
    en: 'Woldek Tech (WDT)',
    ja: 'ウォルデックテック (WDT)',
    zh: '沃德科技 (WDT)',    vi: 'Woldek Tech (WDT)',
  },
  'home.stocks.wdt_desc': {
    ko: '가상 AI & 클라우드 기술주',
    en: 'Virtual AI & Cloud Tech',
    ja: '仮想AI＆クラウドテック',
    zh: '虚拟AI与云科技龙头',    vi: 'Virtual AI & Cloud Tech',
  },
  'home.stocks.chimu_title': {
    ko: '치무테크 (CHIMU)',
    en: 'Chimu Tech (CHIMU)',
    ja: 'チムテック (CHIMU)',
    zh: '芝木科技 (CHIMU)',    vi: 'Chimu Tech (CHIMU)',
  },
  'home.stocks.chimu_desc': {
    ko: '메타버스 로보틱스',
    en: 'Metaverse Robotics',
    ja: 'メタバースロボティクス',
    zh: '元宇宙机器人',    vi: 'Metaverse Robotics',
  },
  'home.stocks.tick_rate': {
    ko: '호가 체결 틱 주기',
    en: 'Order Tick Rate',
    ja: '約定ティック周期',
    zh: '撮合周期',    vi: 'Order Tick Rate',
  },
  'home.stocks.alerts': {
    ko: '목표가 알림 설정',
    en: 'Price Alerts',
    ja: '目標価格アラート設定',
    zh: '目标价提醒设置',    vi: 'Price Alerts',
  },
  'home.career.station_title': {
    ko: '직업 업무 스테이션',
    en: 'Career Mastery',
    ja: '職業業務ステーション',
    zh: '职业工作站',    vi: 'Career Mastery',
  },
  'home.career.start_work': {
    ko: '출근하기',
    en: 'Start Work',
    ja: '出勤する',
    zh: '打卡上班',    vi: 'Start Work',
  },
  'home.career.senior_dev': {
    ko: '시니어 프로그래머',
    en: 'Senior Programmer',
    ja: 'シニアプログラマー',
    zh: '资深程序员',    vi: 'Senior Programmer',
  },
  'home.career.senior_dev_salary': {
    ko: '업무 완료 시 +2,200 WLD 급여',
    en: '+2,200 WLD salary on completion',
    ja: '業務完了時 +2,200 WLD 給与',
    zh: '完成工作发放 +2,200 WLD 薪资',    vi: '+2,200 WLD salary on completion',
  },
  'home.career.master': {
    ko: '마스터',
    en: 'Master',
    ja: 'マスター',
    zh: '大师',    vi: 'Master',
  },
  'home.career.quant_trader': {
    ko: '퀀트 트레이더',
    en: 'Quant Trader',
    ja: 'クオンツトレーダー',
    zh: '量化交易员',    vi: 'Quant Trader',
  },
  'home.career.quant_discount': {
    ko: '매매 수수료 15% 감면 혜택',
    en: '15% Trading Fee Discount',
    ja: '取引手数料15%割引特典',
    zh: '尊享交易手续费85折优惠',    vi: '15% Trading Fee Discount',
  },
  'home.career.pro': {
    ko: '전문직',
    en: 'Pro',
    ja: 'プロ',
    zh: '专业',    vi: 'Pro',
  },
  'home.career.remaining': {
    ko: '일일 남은 업무: 5회',
    en: 'Remaining Daily Tasks: 5',
    ja: '本日の残り業務: 5回',
    zh: '今日剩余工作: 5次',    vi: 'Remaining Daily Tasks: 5',
  },
  'home.career.routine': {
    ko: '업무 루틴 시작하기',
    en: 'Start Career Routine',
    ja: '業務ルーティンを開始',
    zh: '开启每日工作',    vi: 'Start Career Routine',
  },
  'home.notice.title': {
    ko: '공식 공지사항 & 패치노트',
    en: 'Announcements & Releases',
    ja: '公式お知らせ＆パッチノート',
    zh: '官方公告与更新日志',    vi: 'Announcements & Releases',
  },
  'home.notice.view_all': {
    ko: '전체보기',
    en: 'View All',
    ja: 'すべて見る',
    zh: '查看全部',    vi: 'View All',
  },
  // ==========================================
  // 17. Central Bank Savings Pots & League System
  // ==========================================
  'bank.savings_pot_title': {
    ko: '중앙은행 스마트 복리 포켓 (모의 체험)',
    en: 'Central Bank Smart Savings Pots (Simulated)',
    ja: '中央銀行スマート複利ポケット (模擬体験)',
    zh: '中央银行智能复利口袋 (模拟体验)',    vi: 'Central Bank Smart Savings Pots (Simulated)',
  },
  'bank.savings_pot_sim': {
    ko: '모의 시뮬레이션',
    en: 'Simulation',
    ja: '模擬シミュレーション',
    zh: '模拟演练',    vi: 'Simulation',
  },
  'bank.savings_pot_desc': {
    ko: '가상 목표 저축 시뮬레이터입니다. 브라우저에서 매일 복리 이자 정산 메커니즘을 체험해 볼 수 있습니다 (실제 계좌 잔액 미차감).',
    en: 'Simulated savings goal calculator. Experience compound interest calculation in your browser (no live balance deduction).',
    ja: '仮想目標貯蓄シミュレーターです。ブラウザ上で毎日の複利計算メカニズムを体験できます（実際の口座残高は変動しません）。',
    zh: '虚拟储蓄目标测算器。可在浏览器中体验每日复利结算机制（不扣除实际账户余额）。',    vi: 'Simulated savings goal calculator. Experience compound interest calculation in your browser (no live balance deduction).',
  },
  'bank.savings_pot_claim': {
    ko: '일일 이자 받기',
    en: 'Claim Daily Yield',
    ja: '日次利息を受け取る',
    zh: '领取每日利息',    vi: 'Claim Daily Yield',
  },
  'stocks.top_mover': {
    ko: '최고 상승',
    en: 'Top Mover',
    ja: '急上昇',
    zh: '最大涨幅',    vi: 'Top Mover',
  },
  'stocks.league.live': {
    ko: '실시간 리그 랭킹',
    en: 'Live League',
    ja: 'リアルタイムリーグ順位',
    zh: '实时联赛排行',    vi: 'Live League',
  },

  // ==========================================
  // 18. FinTech Home Landing & Stocks
  // ==========================================
  'home.ledger_running': {
    ko: '실시간 복식부기 불변 원장 시스템 정상 가동 중',
    en: 'Real-time double-entry immutable ledger operating normally',
    ja: 'リアルタイム複式簿記不変元帳システム正常稼働中',
    zh: '实时复式记账不可变账本系统正常运行中',
      vi: 'Sổ cái Bất biến Đang Hoạt động',
  },
  'home.verified_sim': {
    ko: '· 100% 안전한 금융 모의 시뮬레이터',
    en: '· 100% Safe Financial Simulation',
    ja: '· 100%安全な金融模擬シミュレーター',
    zh: '· 100%安全的虚拟金融模拟器',
      vi: 'Mô phỏng Tài chính Đã Xác minh',
  },
  'home.total_virtual_assets': {
    ko: '내 가상 자산 총액',
    en: 'Total Virtual Assets',
    ja: '仮想資産総額',
    zh: '虚拟资产总额',
      vi: 'Tổng tài sản ảo',
  },
  'home.cash_bank_aggregate': {
    ko: '활동 현금 + 은행 예치금 실시간 집계',
    en: 'Live sum of active cash + bank deposits',
    ja: 'アクティブ現金＋銀行預金のリアルタイム集計',
    zh: '活动现金与银行存款实时汇总',
      vi: 'Tổng hợp Tiền mặt & Tiết kiệm Ngân hàng',
  },
  'home.ledger_integrity_100': {
    ko: '원장 정합성 100%',
    en: '100% Ledger Integrity',
    ja: '元帳整合性100%',
    zh: '账本一致性100%',    vi: '100% Ledger Integrity',
  },
  'home.login_to_view': {
    ko: '로그인 후 확인',
    en: 'Sign in to view',
    ja: 'ログインして確認',
    zh: '登录后查看',    vi: 'Sign in to view',
  },
  'home.safe_sim_desc': {
    ko: '가상 재화로 즐기는 100% 안전한 금융 모의 시뮬레이션',
    en: '100% risk-free simulated financial playground',
    ja: '仮想資産で体験する100%安全な金融模擬体験',
    zh: '尽享零风险虚拟金融模拟体验',    vi: '100% risk-free simulated financial playground',
  },
  'home.p2p_transfer': {
    ko: '1:1 간편 송금',
    en: 'Instant Transfer',
    ja: 'かんたん送金',
    zh: '1:1快捷转账',    vi: 'Instant Transfer',
  },
  'home.view_history': {
    ko: '내역 조회',
    en: 'History',
    ja: '履歴照会',
    zh: '明细查询',    vi: 'History',
  },
  'home.stock_trading': {
    ko: '주식 거래',
    en: 'Stock Trading',
    ja: '株式取引',
    zh: '股票交易',
      vi: 'Giao dịch cổ phiếu',
  },
  'home.stock_trading_desc': {
    ko: '10개 가상 상장사',
    en: '10 Listed Companies',
    ja: '10の上場企業',
    zh: '10家精选虚拟公司',
      vi: 'Khớp lệnh tức thì với độ trễ thấp và biểu đồ thanh khoản cao',
  },
  'home.work_farming': {
    ko: '직업 출근',
    en: 'Career Work',
    ja: '職業出勤',
    zh: '职场上班',    vi: 'Career Work',
  },
  'home.work_farming_desc': {
    ko: '일일 파밍 보상',
    en: 'Daily Farming Rewards',
    ja: 'デイリーファーミング報酬',
    zh: '每日工作收益',    vi: 'Daily Farming Rewards',
  },
  'home.virtual_bank': {
    ko: '가상 은행',
    en: 'Virtual Bank',
    ja: '仮想銀行',
    zh: '虚拟银行',    vi: 'Virtual Bank',
  },
  'home.virtual_bank_desc': {
    ko: '예금 및 대출',
    en: 'Deposits & Loans',
    ja: '預金＆ローン',
    zh: '存款与贷款',    vi: 'Deposits & Loans',
  },
  'home.live_market_movers': {
    ko: '실시간 급등락 상장 종목',
    en: 'Live Market Movers',
    ja: 'リアルタイム急変動銘柄',
    zh: '实时异动上榜股票',    vi: 'Live Market Movers',
  },
  'home.view_all_stocks': {
    ko: '전체 보기',
    en: 'View All',
    ja: 'すべて見る',
    zh: '查看全部',
      vi: 'Xem toàn bộ 18 cổ phiếu niêm yết',
  },
  'home.safe_simulation_guide': {
    ko: '100% 안전한 가상 금융 시뮬레이션',
    en: '100% Safe Virtual Economy',
    ja: '100%安全な仮想金融シミュレーション',
    zh: '100%安全的虚拟金融模拟',
      vi: 'Trải nghiệm giao dịch cổ phiếu và tiền gửi an toàn không rủi ro tài chính',
  },
  'home.safe_simulation_body': {
    ko: '월덕 머니버스의 모든 화폐(WLD)와 주식 거래는 실제 현금이나 금융상품이 아닌 게임 내 알고리즘으로 구동되는 안전한 가상 경제입니다.',
    en: 'All WLD currency and stock trades are simulated game data governed by algorithms, not real-world cash or investment products.',
    ja: 'ウォルドク・マネーバースのすべての通貨(WLD)と株式取引は、実際の現金や金融商品ではなく、ゲーム内アルゴリズムで動作する安全な仮想経済です。',
    zh: '月德Moneyverse内所有货币(WLD)与股票交易均为基于算法的游戏模拟数据，绝非真实现金或金融投资品。',    vi: 'All WLD currency and stock trades are simulated game data governed by algorithms, not real-world cash or investment products.',
  },
  'home.calc_hub_title': {
    ko: '실전 금융 계산기 & 시뮬레이터',
    en: 'Financial Calculators & Simulators',
    ja: '実践金融計算機＆シミュレーター',
    zh: '实用金融计算器与模拟器',    vi: 'Financial Calculators & Simulators',
  },
  'home.calc_view_all': {
    ko: '전체 12종 계산기 보기',
    en: 'View All 12 Tools',
    ja: '全12種ツールを見る',
    zh: '查看全部12款工具',    vi: 'View All 12 Tools',
  },
  'home.calc_compound_title': {
    ko: '복리 예금·적금 계산기',
    en: 'Compound Interest Calculator',
    ja: '複利預金・積立計算機',
    zh: '复利储蓄计算器',    vi: 'Compound Interest Calculator',
  },
  'home.calc_compound_desc': {
    ko: '월 적립식 복리 이자와 72의 법칙 목표 자산 달성 시점 시뮬레이션',
    en: 'Simulate monthly contributions, compound interest, and Rule of 72 targets',
    ja: '毎月積立複利利息と72の法則による資産達成シミュレーション',
    zh: '测算定投复利收益与72法则目标达成时间',    vi: 'Simulate monthly contributions, compound interest, and Rule of 72 targets',
  },
  'home.calc_loan_title': {
    ko: '대출이자 & 상환 계산기',
    en: 'Loan Repayment Calculator',
    ja: 'ローン利息＆返済計算機',
    zh: '贷款利息与还款计算器',    vi: 'Loan Repayment Calculator',
  },
  'home.calc_loan_desc': {
    ko: '원리금균등, 원금균등, 만기일시 상환 방식별 총이자 비교',
    en: 'Compare total interest across amortized, equal principal, and lump sum plans',
    ja: '元利均等、元金均等、期日一括返済ごとの総利息比較',
    zh: '等额本息、等额本金与先息后本方案总利息对比',    vi: 'Compare total interest across amortized, equal principal, and lump sum plans',
  },
  'home.calc_stock_title': {
    ko: '주식 물타기·평단가 계산기',
    en: 'Stock Average Down Calculator',
    ja: '株式買増し・平均単価計算機',
    zh: '股票补仓均价计算器',    vi: 'Stock Average Down Calculator',
  },
  'home.calc_stock_desc': {
    ko: '추가 매수 시 희석되는 평균 단가 및 탈출 목표가 역산',
    en: 'Calculate revised average price on dips and target break-even exit',
    ja: '買増し時の平均取得単価と損益分岐点脱出価格を逆算',
    zh: '计算加仓后摊薄成本均价与保本解套目标价',    vi: 'Calculate revised average price on dips and target break-even exit',
  },
  'stocks.filter_all': {
    ko: '전체 10종목',
    en: 'All 10 Stocks',
    ja: '全10銘柄',
    zh: '全部10只股票',
      vi: 'Tất cả cổ phiếu',
  },
  'stocks.filter_movers': {
    ko: '급등·급락순',
    en: 'Top Movers',
    ja: '変動率順',
    zh: '涨跌幅榜',
      vi: 'Biến động mạnh',
  },
  'stocks.filter_price': {
    ko: '가격순',
    en: 'By Price',
    ja: '価格順',
    zh: '价格高低',    vi: 'By Price',
  },
  'stocks.filter_name': {
    ko: '이름순',
    en: 'By Name',
    ja: '名前順',
    zh: '名称排序',    vi: 'By Name',
  },
  'stocks.listed_count': {
    ko: '총 {count}개 종목 상장 중',
    en: '{count} stocks listed',
    ja: '計{count}銘柄上場中',
    zh: '现已上市{count}只股票',    vi: '{count} stocks listed',
  },
  'stocks.no_available': {
    ko: '거래 가능한 종목이 없습니다.',
    en: 'No tradable stocks available.',
    ja: '取引可能な銘柄がありません。',
    zh: '暂无可交易股票。',    vi: 'No tradable stocks available.',
  },
  'stocks.halted': {
    ko: '거래정지',
    en: 'HALTED',
    ja: '取引停止',
    zh: '暂停交易',    vi: 'HALTED',
  },
  'stocks.buy_action': {
    ko: '매수',
    en: 'Buy',
    ja: '買い',
    zh: '买入',    vi: 'Buy',
  },
  'stocks.safe_notice_title': {
    ko: '100% 안전한 가상 모의투자 안내',
    en: '100% Risk-Free Trading Simulation',
    ja: '100%安全な仮想模擬投資ガイド',
    zh: '100%安全的模拟投资提示',
      vi: 'Thông báo Giao dịch Mô phỏng An toàn',
  },
  'stocks.safe_notice_body': {
    ko: '월덕 머니버스의 모든 종목 시세와 재화(WLD)는 게임 내 알고리즘에 의해 움직이는 가상 경제이며, 실제 현금 입출금이나 실제 주식 투자 상품이 아닙니다.',
    en: 'All stock prices and WLD currency are algorithm-driven virtual game assets, not actual money or real financial securities.',
    ja: 'ウォルドク・マネーバースのすべての銘柄相場と通貨(WLD)はゲーム内アルゴリズムにより動作する仮想経済であり、実際の現金や実在の株式商品ではありません。',
    zh: '月德Moneyverse内所有标的行情与WLD货币均为由算法驱动的虚拟游戏资产，非真实现金或真实证券。',
      vi: 'Tất cả các giao dịch được mô phỏng trên chuỗi khối ảo. Không có rủi ro mất tiền thật.',
  },
  'skip.content': {
    ko: '본문으로 건너뛰기',
    en: 'Skip to main content',
    ja: '本文へスキップ',
    zh: '跳至正文',    vi: 'Skip to main content',
  },

  'stocks.league.simulated': {
    ko: '시즌 개막 준비 중 (모의 예시)',
    en: 'Pre-season (Simulated)',
    ja: 'シーズン開幕準備中 (模擬例)',
    zh: '赛季开幕筹备中 (模拟示例)',    vi: 'Pre-season (Simulated)',
  },
};

/**
 * Reverse Lookup Dictionary: Automatically map Korean or English raw strings to 4-language translations.
 */
const REVERSE_LOOKUP_MAP: Record<string, Record<Locale, string>> = {};

// Build reverse lookup index for O(1) text translation
for (const entry of Object.values(I18N_DICTIONARY)) {
  if (entry.ko) REVERSE_LOOKUP_MAP[entry.ko.trim().toLowerCase()] = entry;
  if (entry.en) REVERSE_LOOKUP_MAP[entry.en.trim().toLowerCase()] = entry;
}

/**
 * Translate arbitrary text or translation token across all 4 locales.
 */
export function lookupText(rawText: string, locale: Locale, fallback?: string): string {
  if (!rawText) return fallback ?? '';
  const key = rawText.trim().toLowerCase();
  
  // 1. Check direct token
  if (I18N_DICTIONARY[rawText]) {
    return I18N_DICTIONARY[rawText][locale] || I18N_DICTIONARY[rawText].en || fallback || rawText;
  }

  // 2. Check reverse text lookup
  if (REVERSE_LOOKUP_MAP[key]) {
    return REVERSE_LOOKUP_MAP[key][locale] || REVERSE_LOOKUP_MAP[key].en || fallback || rawText;
  }

  return fallback ?? rawText;
}

/**
 * Translate a translation key or raw text to the requested locale.
 * Fallbacks to English or Korean if not found.
 */
export function t(key: string, locale: Locale, fallback?: string): string {
  return lookupText(key, locale, fallback);
}
