import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { apiOrNull } from '@/lib/api';
import { getServerLocale } from '@/lib/locale-server';
import { localeLabel } from '@/lib/locale';
import { submitLocalLogin } from './actions';
import { parseLoginProviderEvidence } from './login-provider-evidence';

export async function LoginProvidersView({
  error,
  notice,
}: {
  readonly error?: string | undefined;
  readonly notice?: string | undefined;
}) {
  const locale = await getServerLocale();
  const evidence = parseLoginProviderEvidence(await apiOrNull<unknown>('/api/v1/auth/providers'));
  const availableProviders = evidence.status === 'verified' ? evidence.oauthEnabled : [];
  // An upstream outage does not prove local login is disabled; retain the attempt path.
  const showLocalLogin = evidence.status === 'unavailable' || evidence.localEnabled;

  return (
    <div className="mx-auto w-full max-w-[420px] py-4 sm:py-8">
      {/* Brand & Heading */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck className="size-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {localeLabel(
            locale,
            '반가워요!',
            'Welcome Back!',
            'おかえりなさい！',
            '欢迎回来！',
            'Chào mừng bạn!'
          )}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {localeLabel(
            locale,
            '월덕 머니버스에서 경제와 자산을 시작해보세요.',
            'Start your virtual economy journey and build financial assets.',
            'ウォルドク・マネーバースで仮想経済と資産運用を始めましょう。',
            '在月德虚拟金融平台开启您的数字资产之旅。',
            'Bắt đầu hành trình kinh tế và xây dựng tài sản ảo của bạn.'
          )}
        </p>
      </div>

      {notice && (
        <Alert className="mb-5 border-primary/30 bg-primary/5 text-foreground">
          <AlertDescription className="text-xs font-medium leading-relaxed">{notice}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-5">
          <AlertDescription className="text-xs font-medium leading-relaxed">{error}</AlertDescription>
        </Alert>
      )}

      {evidence.status === 'unavailable' && (
        <Alert role="status" aria-live="polite" className="mb-5 border-amber-500/40">
          <AlertDescription className="flex flex-col gap-3 text-sm">
            <span>{localeLabel(locale,
              '로그인 수단의 서버 상태를 확인하지 못했습니다. 이메일 로그인은 시도할 수 있지만, 간편 로그인 사용 가능 여부는 확인 전까지 표시하지 않습니다.',
              'Sign-in provider status is unavailable. You may try email sign-in; social sign-in availability is not verified.',
              'ログイン方法の状態を確認できません。メールログインはお試しいただけます。',
              '无法确认登录服务状态。您仍可尝试邮箱登录。',
              'Không thể xác minh trạng thái đăng nhập. Bạn vẫn có thể thử đăng nhập bằng email.')}</span>
            <Button asChild variant="outline" className="min-h-11 w-fit">
              <a href="/login/providers">{localeLabel(locale, '다시 확인', 'Retry provider check', '再確認', '重试', 'Thử lại')}</a>
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {evidence.status === 'verified' && !evidence.localEnabled && availableProviders.length === 0 && (
        <Alert role="status" className="mb-5 border-amber-500/40">
          <AlertDescription>{localeLabel(locale,
            '현재 사용할 수 있는 로그인 수단이 없습니다. 잠시 후 다시 확인해 주세요.',
            'No sign-in methods are currently enabled. Please try again later.',
            '現在利用可能なログイン方法はありません。',
            '当前没有可用的登录方式。',
            'Hiện không có phương thức đăng nhập nào.')}</AlertDescription>
        </Alert>
      )}

      {/* Main FinTech Card */}
      <Card className="border-border/80 bg-card/95 shadow-sm backdrop-blur-sm">
        <CardContent className="p-6 sm:p-7">
          {/* Local Email Login Form */}
          {showLocalLogin ? <form action={submitLocalLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="local-email" className="text-xs font-semibold text-muted-foreground">
                {localeLabel(locale, '이메일 주소', 'Email Address', 'メールアドレス', '邮箱地址', 'Địa chỉ Email')}
              </Label>
              <Input
                id="local-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                maxLength={254}
                required
                placeholder="name@example.com"
                className="min-h-11"
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="local-password" className="text-xs font-semibold text-muted-foreground">
                  {localeLabel(locale, '비밀번호', 'Password', 'パスワード', '密码', 'Mật khẩu')}
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary transition-colors hover:underline"
                >
                  {localeLabel(locale, '비밀번호 찾기', 'Forgot Password?', 'パスワードをお忘れですか？', '找回密码', 'Quên mật khẩu?')}
                </Link>
              </div>
              <Input
                id="local-password"
                name="password"
                type="password"
                autoComplete="current-password"
                maxLength={128}
                required
                placeholder={localeLabel(locale, '비밀번호 입력', 'Enter password', 'パスワードを入力', '输入密码', 'Nhập mật khẩu')}
                className="min-h-11"
              />
            </div>

            <Button
              type="submit"
              className="min-h-11 w-full sm:w-fit font-bold"
            >
              {localeLabel(locale, '자체 계정으로 로그인', 'Sign In with Email', 'メールでログイン', '邮箱登录', 'Đăng nhập với Email')}
              <ArrowRight className="ml-1 size-4" />
            </Button>
          </form> : (
            <p role="status" className="text-sm text-muted-foreground">
              {localeLabel(locale, '이 배포 환경에서는 이메일 로그인이 비활성화되어 있습니다.',
                'Email sign-in is disabled in this deployment.',
                'この環境ではメールログインは無効です。',
                '此部署已禁用邮箱登录。',
                'Đăng nhập bằng email đã bị tắt trong môi trường này.')}
            </p>
          )}

          {/* Social Sign-in Divider */}
          {availableProviders.length > 0 && (
            <>
              <div className="relative my-6 text-center">
                <Separator className="absolute inset-x-0 top-1/2" />
                <span className="relative bg-card px-3 text-xs font-medium text-muted-foreground">
                  {localeLabel(locale, '또는 간편 로그인', 'Or continue with', 'または外部連携でログイン', '或者使用第三方登录', 'Hoặc tiếp tục với')}
                </span>
              </div>

              <div className="grid gap-2.5">
                {availableProviders.map((id) => (
                  <Button
                    key={id}
                    variant="outline"
                    size="lg"
                    asChild
                    className="w-full justify-center rounded-xl border-border/80 text-sm font-medium transition-colors"
                  >
                    <a href={'/auth/' + id + '/authorize'}>
                      {id === 'google' ? 'Google' : 'Discord'}{' '}
                      {localeLabel(locale, '계정으로 계속하기', 'Account', 'で続ける', '账号登录', 'Tài khoản')}
                    </a>
                  </Button>
                ))}
              </div>
            </>
          )}

          {/* Registration Notice */}
          <div className="mt-6 border-t border-border/60 pt-5 text-center text-xs text-muted-foreground">
            {localeLabel(
              locale,
              '아직 회원이 아니신가요?',
              "Don't have an account?",
              'まだアカウントをお持ちでないですか？',
              '还没有账号？',
              'Chưa có tài khoản?'
            )}{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              {localeLabel(locale, '계정 만들기', 'Create Account', 'アカウント作成', '立即注册', 'Tạo tài khoản')}
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Footer Legal Links */}
      <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground/80">
        {localeLabel(
          locale,
          '로그인 시 이용약관 및 개인정보처리방침에 동의하게 됩니다.',
          'By signing in, you agree to our Terms of Service and Privacy Policy.',
          'ログインすると利用規約およびプライバシーポリシーに同意したものとみなされます。',
          '登录即表示您同意我们的服务条款与隐私政策。',
          'Bằng việc đăng nhập, bạn đồng ý với Điều khoản và Chính sách quyền riêng tư.'
        )}
      </p>
    </div>
  );
}
