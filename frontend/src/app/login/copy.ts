import type { Copy } from '@/lib/copy';

/**
 * Copy for `/login` (sign-in page and provider view). Korean is the carried-over product copy and
 * is byte-identical to the literals it replaced; the other locales are full translations.
 */
export const COPY = {
  title: { ko: '로그인', en: 'Sign in', ja: 'ログイン', zh: '登录', vi: 'Đăng nhập' },
  lead: {
    ko: '디스코드, 구글 또는 자체 계정으로 들어옵니다.',
    en: 'Sign in with Discord, Google or a Moneyverse account.',
    ja: 'Discord、Google、または独自アカウントでログインします。',
    zh: '使用 Discord、Google 或本站账号登录。',
    vi: 'Đăng nhập bằng Discord, Google hoặc tài khoản riêng.',
  },
  localHeading: { ko: '자체 계정', en: 'Moneyverse account', ja: '独自アカウント', zh: '本站账号', vi: 'Tài khoản riêng' },
  email: { ko: '이메일 주소', en: 'Email address', ja: 'メールアドレス', zh: '电子邮箱', vi: 'Địa chỉ email' },
  password: { ko: '비밀번호', en: 'Password', ja: 'パスワード', zh: '密码', vi: 'Mật khẩu' },
  forgot: { ko: '비밀번호 찾기', en: 'Forgot password', ja: 'パスワードを忘れた場合', zh: '找回密码', vi: 'Quên mật khẩu' },
  passwordPlaceholder: { ko: '비밀번호 입력', en: 'Enter password', ja: 'パスワードを入力', zh: '输入密码', vi: 'Nhập mật khẩu' },
  localSubmit: { ko: '자체 계정으로 로그인', en: 'Sign in with Moneyverse account', ja: '独自アカウントでログイン', zh: '使用本站账号登录', vi: 'Đăng nhập bằng tài khoản riêng' },
  newHere: { ko: '처음이신가요?', en: 'New here?', ja: '初めてですか？', zh: '第一次来？', vi: 'Lần đầu đến đây?' },
  register: { ko: '회원가입', en: 'Create an account', ja: '会員登録', zh: '注册', vi: 'Đăng ký' },
  socialHeading: { ko: '간편 로그인', en: 'Quick sign-in', ja: 'かんたんログイン', zh: '快捷登录', vi: 'Đăng nhập nhanh' },
  discord: { ko: '디스코드로 계속하기', en: 'Continue with Discord', ja: 'Discordで続ける', zh: '使用 Discord 继续', vi: 'Tiếp tục với Discord' },
  google: { ko: '구글로 계속하기', en: 'Continue with Google', ja: 'Googleで続ける', zh: '使用 Google 继续', vi: 'Tiếp tục với Google' },
  socialUnavailable: {
    ko: '지금은 간편 로그인을 사용할 수 없습니다. 자체 계정으로 로그인해 주세요.',
    en: 'Quick sign-in is not available right now. Please sign in with a Moneyverse account.',
    ja: '現在、かんたんログインは利用できません。独自アカウントでログインしてください。',
    zh: '暂时无法使用快捷登录，请使用本站账号登录。',
    vi: 'Hiện chưa dùng được đăng nhập nhanh. Vui lòng đăng nhập bằng tài khoản riêng.',
  },
  agreePrefix: { ko: '계정 진입 시', en: 'By signing in, you agree to the', ja: 'アカウントに入ると', zh: '登录即表示同意', vi: 'Khi đăng nhập, bạn đồng ý với' },
  terms: { ko: '이용약관', en: 'Terms of Service', ja: '利用規約', zh: '服务条款', vi: 'Điều khoản dịch vụ' },
  and: { ko: '및', en: 'and the', ja: 'および', zh: '和', vi: 'và' },
  privacy: { ko: '개인정보처리방침', en: 'Privacy Policy', ja: '個人情報処理方針', zh: '隐私政策', vi: 'Chính sách quyền riêng tư' },
  agreeSuffix: { ko: '에 동의한 것으로 처리됩니다.', en: '.', ja: 'に同意したものとみなされます。', zh: '。', vi: '.' },
  passwordReset: {
    ko: '비밀번호가 변경되었습니다. 새 비밀번호로 로그인해 주세요.',
    en: 'Your password was changed. Please sign in with the new password.',
    ja: 'パスワードが変更されました。新しいパスワードでログインしてください。',
    zh: '密码已更改，请使用新密码登录。',
    vi: 'Mật khẩu đã được đổi. Vui lòng đăng nhập bằng mật khẩu mới.',
  },
  consentTitle: { ko: '필수 이용 동의', en: 'Required agreements', ja: '必須の利用同意', zh: '必要的使用同意', vi: 'Đồng ý bắt buộc' },
  consentLead: {
    ko: '서비스 화폐·보상은 게임 내 가상 데이터이며 현금 환전이나 실제 투자 수익을 제공하지 않습니다.',
    en: 'The currency and rewards here are virtual game data; they cannot be exchanged for cash and give no real investment return.',
    ja: 'サービスの通貨・報酬はゲーム内の仮想データであり、現金への換金や実際の投資収益は提供されません。',
    zh: '本服务的货币和奖励均为游戏内虚拟数据，不能兑换现金，也不提供真实投资收益。',
    vi: 'Tiền tệ và phần thưởng của dịch vụ là dữ liệu ảo trong game, không đổi ra tiền mặt và không mang lại lợi nhuận đầu tư thật.',
  },
  policyUnavailable: {
    ko: '지금은 게시된 정책을 불러올 수 없어요. 잠시 후 다시 시도해 주세요.',
    en: 'The published policies cannot be loaded right now. Please try again shortly.',
    ja: '現在、公開中のポリシーを読み込めません。しばらくしてからもう一度お試しください。',
    zh: '暂时无法加载已发布的政策，请稍后再试。',
    vi: 'Hiện không tải được chính sách đã công bố. Vui lòng thử lại sau.',
  },
} satisfies Record<string, Copy>;

export const ERROR_COPY = {
  login_required: { ko: '로그인이 필요한 화면이에요. 먼저 로그인해 주세요.', en: 'This page needs you to sign in first.', ja: 'この画面はログインが必要です。先にログインしてください。', zh: '此页面需要登录，请先登录。', vi: 'Trang này cần đăng nhập. Vui lòng đăng nhập trước.' },
  consent_required: { ko: '서비스 이용 전에 최신 약관과 개인정보처리방침에 동의해 주세요.', en: 'Please agree to the latest Terms of Service and Privacy Policy before using the service.', ja: 'サービスを利用する前に、最新の利用規約と個人情報処理方針に同意してください。', zh: '使用服务前，请同意最新的服务条款和隐私政策。', vi: 'Vui lòng đồng ý với điều khoản và chính sách quyền riêng tư mới nhất trước khi sử dụng.' },
  oauth_session: { ko: '로그인 세션이 만료되었습니다. 다시 시도해 주세요.', en: 'The sign-in session expired. Please try again.', ja: 'ログインセッションの有効期限が切れました。もう一度お試しください。', zh: '登录会话已过期，请重试。', vi: 'Phiên đăng nhập đã hết hạn. Vui lòng thử lại.' },
  oauth_state: { ko: '로그인 요청을 확인할 수 없습니다. 다시 시도해 주세요.', en: 'The sign-in request could not be verified. Please try again.', ja: 'ログインリクエストを確認できません。もう一度お試しください。', zh: '无法确认登录请求，请重试。', vi: 'Không xác minh được yêu cầu đăng nhập. Vui lòng thử lại.' },
  oauth_cancelled: { ko: '로그인이 취소되었습니다.', en: 'Sign-in was cancelled.', ja: 'ログインがキャンセルされました。', zh: '登录已取消。', vi: 'Đã hủy đăng nhập.' },
  oauth_response: { ko: '로그인 제공자의 응답을 확인할 수 없습니다.', en: 'The sign-in provider’s response could not be verified.', ja: 'ログインプロバイダーの応答を確認できません。', zh: '无法确认登录服务商的响应。', vi: 'Không xác minh được phản hồi của nhà cung cấp đăng nhập.' },
  oauth_verification: { ko: '로그인 정보를 확인하지 못했습니다. 다시 시도해 주세요.', en: 'Your sign-in details could not be verified. Please try again.', ja: 'ログイン情報を確認できませんでした。もう一度お試しください。', zh: '未能确认登录信息，请重试。', vi: 'Không xác minh được thông tin đăng nhập. Vui lòng thử lại.' },
  oauth_login: { ko: '로그인을 완료하지 못했습니다. 다시 시도해 주세요.', en: 'Sign-in could not be completed. Please try again.', ja: 'ログインを完了できませんでした。もう一度お試しください。', zh: '未能完成登录，请重试。', vi: 'Không thể hoàn tất đăng nhập. Vui lòng thử lại.' },
  provider_unavailable: { ko: '로그인 제공자가 아직 연결되지 않았어요.', en: 'This sign-in provider is not connected yet.', ja: 'このログインプロバイダーはまだ接続されていません。', zh: '该登录服务商尚未接入。', vi: 'Nhà cung cấp đăng nhập này chưa được kết nối.' },
  local_fields: { ko: '이메일과 비밀번호를 모두 입력해 주세요.', en: 'Enter both your email and password.', ja: 'メールアドレスとパスワードの両方を入力してください。', zh: '请输入电子邮箱和密码。', vi: 'Hãy nhập cả email và mật khẩu.' },
  local_credentials: { ko: '이메일 또는 비밀번호를 확인해 주세요.', en: 'Check your email or password.', ja: 'メールアドレスまたはパスワードを確認してください。', zh: '请检查电子邮箱或密码。', vi: 'Hãy kiểm tra email hoặc mật khẩu.' },
  local_unavailable: { ko: '자체 로그인 서비스를 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.', en: 'Account sign-in is unavailable. Please try again shortly.', ja: '独自ログインサービスを利用できません。しばらくしてからもう一度お試しください。', zh: '本站账号登录服务暂不可用，请稍后再试。', vi: 'Dịch vụ đăng nhập tài khoản riêng hiện không khả dụng. Vui lòng thử lại sau.' },
  local_login: { ko: '자체 로그인을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.', en: 'Account sign-in could not be completed. Please try again shortly.', ja: '独自ログインを完了できませんでした。しばらくしてからもう一度お試しください。', zh: '未能完成本站账号登录，请稍后再试。', vi: 'Không thể hoàn tất đăng nhập tài khoản riêng. Vui lòng thử lại sau.' },
} satisfies Record<string, Copy>;
